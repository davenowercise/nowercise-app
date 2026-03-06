/**
 * Nowercise Planner – Backend logic for weekly strength session planning.
 * Week starts Monday. Default pattern: Mon/Wed/Fri strength. No adjacent strength days.
 */
import { db } from "../db";
import { plannedSessions, sessionEvents } from "@shared/schema";
import { eq, and, gte, lte, or, asc, ne, inArray, desc } from "drizzle-orm";
import { addDays, parseISO, format, startOfWeek } from "date-fns";

const DEFAULT_STRENGTH_TEMPLATE = "GentleStrength_A";

/** Get Monday (week start) for a given date string YYYY-MM-DD */
export function getWeekStartDate(dateStr: string): string {
  const d = parseISO(dateStr);
  const monday = startOfWeek(d, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

/** Check if newDate would create adjacent strength days (day-1 or day+1 has strength), excluding a session being moved */
async function isAdjacentStrengthDayTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  newDateStr: string,
  excludeSessionId: string | null
): Promise<boolean> {
  const prevDay = format(addDays(parseISO(newDateStr), -1), "yyyy-MM-dd");
  const nextDay = format(addDays(parseISO(newDateStr), 1), "yyyy-MM-dd");

  const conditions = [
    eq(plannedSessions.userId, userId),
    eq(plannedSessions.sessionType, "STRENGTH"),
    or(
      eq(plannedSessions.plannedDate, prevDay),
      eq(plannedSessions.plannedDate, nextDay)
    ),
  ];
  if (excludeSessionId) {
    conditions.push(ne(plannedSessions.id, excludeSessionId));
  }

  const adjacent = await tx
    .select({ id: plannedSessions.id })
    .from(plannedSessions)
    .where(and(...conditions))
    .limit(1);

  return adjacent.length > 0;
}

/** Check if newDate would create adjacent strength days (day-1 or day+1 has strength) */
export async function isAdjacentStrengthDay(
  userId: string,
  newDateStr: string
): Promise<boolean> {
  return db.transaction(async (tx) =>
    isAdjacentStrengthDayTx(tx, userId, newDateStr, null)
  );
}

export type GenerateWeekPlanOpts = { force?: boolean };

/** Generate default week plan: Mon/Wed/Fri strength. Safer regeneration: refuses if COMPLETED exists unless force=true. */
export async function generateWeekPlan(
  userId: string,
  weekStartDateStr: string,
  opts?: GenerateWeekPlanOpts
): Promise<{ ok: boolean; sessions: Array<{ id: string; plannedDate: string; sessionType: string }> }> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({
        id: plannedSessions.id,
        status: plannedSessions.status,
        plannedDate: plannedSessions.plannedDate,
      })
      .from(plannedSessions)
      .where(
        and(
          eq(plannedSessions.userId, userId),
          eq(plannedSessions.weekStartDate, weekStartDateStr)
        )
      );

    const hasCompleted = existing.some((r) => r.status === "COMPLETED");
    if (hasCompleted && opts?.force !== true) {
      throw new Error(
        "Week already has completed sessions; regeneration requires force=true."
      );
    }

    await tx
      .delete(plannedSessions)
      .where(
        and(
          eq(plannedSessions.userId, userId),
          eq(plannedSessions.weekStartDate, weekStartDateStr),
          ne(plannedSessions.status, "COMPLETED")
        )
      );

    const weekStart = parseISO(weekStartDateStr);
    const strengthDays = [
      format(addDays(weekStart, 0), "yyyy-MM-dd"), // Monday
      format(addDays(weekStart, 2), "yyyy-MM-dd"), // Wednesday
      format(addDays(weekStart, 4), "yyyy-MM-dd"), // Friday
    ];

    const completedDates = new Set(
      existing.filter((r) => r.status === "COMPLETED").map((r) => r.plannedDate)
    );

    const sessions: Array<{ id: string; plannedDate: string; sessionType: string }> = [];
    const crypto = await import("node:crypto");

    for (const dateStr of strengthDays) {
      if (completedDates.has(dateStr)) continue;
      const id = crypto.randomUUID();
      await tx.insert(plannedSessions).values({
        id,
        userId,
        weekStartDate: weekStartDateStr,
        plannedDate: dateStr,
        sessionType: "STRENGTH",
        sessionTemplate: DEFAULT_STRENGTH_TEMPLATE,
        status: "PLANNED",
      });
      sessions.push({ id, plannedDate: dateStr, sessionType: "STRENGTH" });
    }

    return { ok: true, sessions };
  });
}

export type SessionEventInfo = {
  eventType: string;
  fromDate: string | null;
  toDate: string | null;
};

export type WeekPlanSession = {
  id: string;
  plannedDate: string;
  sessionType: string;
  sessionTemplate: string | null;
  status: string;
  recentEvents?: SessionEventInfo[];
};

/** Get planned sessions for a week with recent event history */
export async function getWeekPlan(
  userId: string,
  weekStartDateStr: string
): Promise<WeekPlanSession[]> {
  const weekStart = parseISO(weekStartDateStr);
  const sunday = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const rows = await db
    .select({
      id: plannedSessions.id,
      plannedDate: plannedSessions.plannedDate,
      sessionType: plannedSessions.sessionType,
      sessionTemplate: plannedSessions.sessionTemplate,
      status: plannedSessions.status,
    })
    .from(plannedSessions)
    .where(
      and(
        eq(plannedSessions.userId, userId),
        gte(plannedSessions.plannedDate, weekStartDateStr),
        lte(plannedSessions.plannedDate, sunday)
      )
    )
    .orderBy(asc(plannedSessions.plannedDate));

  if (rows.length === 0) return [];

  const sessionIds = rows.map((r) => r.id);
  const events = await db
    .select({
      plannedSessionId: sessionEvents.plannedSessionId,
      eventType: sessionEvents.eventType,
      fromDate: sessionEvents.fromDate,
      toDate: sessionEvents.toDate,
    })
    .from(sessionEvents)
    .where(inArray(sessionEvents.plannedSessionId, sessionIds))
    .orderBy(desc(sessionEvents.createdAt));

  const eventsBySession = new Map<string, SessionEventInfo[]>();
  for (const e of events) {
    const list = eventsBySession.get(e.plannedSessionId) ?? [];
    if (list.length < 2) list.push({ eventType: e.eventType, fromDate: e.fromDate, toDate: e.toDate });
    eventsBySession.set(e.plannedSessionId, list);
  }

  return rows.map((r) => ({
    ...r,
    recentEvents: eventsBySession.get(r.id) ?? [],
  }));
}

export type MoveSessionResult =
  | { ok: true; session: { id: string; plannedDate: string } }
  | { ok: false; error: string };

/** Move a planned session to a new date within the same week. Transactional with full validation. */
export async function moveSession(
  plannedSessionId: string,
  newDateStr: string,
  reason?: string | null
): Promise<MoveSessionResult> {
  return db.transaction(async (tx) => {
      const [session] = await tx
        .select()
        .from(plannedSessions)
        .where(eq(plannedSessions.id, plannedSessionId))
        .limit(1);

      if (!session) {
        return { ok: false, error: "Session not found." };
      }

      if (session.status === "COMPLETED") {
        return { ok: false, error: "That session is already completed." };
      }

      if (session.sessionType !== "STRENGTH") {
        return { ok: false, error: "Only strength sessions can be moved." };
      }

      const weekStart = getWeekStartDate(session.plannedDate);
      const newWeekStart = getWeekStartDate(newDateStr);

      if (weekStart !== newWeekStart) {
        return {
          ok: false,
          error: "Sessions can only be moved within the same week.",
        };
      }

      const weekStartDate = parseISO(weekStart);
      const sunday = format(addDays(weekStartDate, 6), "yyyy-MM-dd");
      if (newDateStr < weekStart || newDateStr > sunday) {
        return {
          ok: false,
          error: "Sessions can only be moved within the same week.",
        };
      }

      const collision = await tx
        .select({ id: plannedSessions.id })
        .from(plannedSessions)
        .where(
          and(
            eq(plannedSessions.userId, session.userId),
            eq(plannedSessions.plannedDate, newDateStr),
            eq(plannedSessions.sessionType, "STRENGTH"),
            ne(plannedSessions.id, plannedSessionId)
          )
        )
        .limit(1);

      if (collision.length > 0) {
        return {
          ok: false,
          error: "That day already has a strength session planned.",
        };
      }

      const hasAdjacent = await isAdjacentStrengthDayTx(
        tx,
        session.userId,
        newDateStr,
        plannedSessionId
      );
      if (hasAdjacent) {
        return {
          ok: false,
          error: "Strength sessions need a recovery day between them.",
        };
      }

      const strengthInWeek = await tx
        .select({ id: plannedSessions.id })
        .from(plannedSessions)
        .where(
          and(
            eq(plannedSessions.userId, session.userId),
            gte(plannedSessions.plannedDate, weekStart),
            lte(plannedSessions.plannedDate, sunday),
            eq(plannedSessions.sessionType, "STRENGTH")
          )
        );

      if (strengthInWeek.length > 3) {
        return {
          ok: false,
          error: "Max 3 strength sessions per week.",
        };
      }

      const fromDate = session.plannedDate;
      await tx
        .update(plannedSessions)
        .set({ plannedDate: newDateStr })
        .where(eq(plannedSessions.id, plannedSessionId));

      const crypto = await import("node:crypto");
      await tx.insert(sessionEvents).values({
        id: crypto.randomUUID(),
        plannedSessionId,
        eventType: "MOVED",
        fromDate,
        toDate: newDateStr,
        reason: reason ?? null,
      });

      return {
        ok: true,
        session: { id: plannedSessionId, plannedDate: newDateStr },
      };
    });
}

export type UpdateStatusResult =
  | { ok: true; session: { id: string; plannedDate: string; status: string } }
  | { ok: false; error: string };

/** Mark a planned session as COMPLETED or SKIPPED. */
export async function updateSessionStatus(
  plannedSessionId: string,
  newStatus: "COMPLETED" | "SKIPPED"
): Promise<UpdateStatusResult> {
  const [session] = await db
    .select()
    .from(plannedSessions)
    .where(eq(plannedSessions.id, plannedSessionId))
    .limit(1);

  if (!session) {
    return { ok: false, error: "Session not found." };
  }

  if (session.status === "COMPLETED") {
    return { ok: false, error: "Session already completed." };
  }

  await db
    .update(plannedSessions)
    .set({ status: newStatus })
    .where(eq(plannedSessions.id, plannedSessionId));

  const crypto = await import("node:crypto");
  await db.insert(sessionEvents).values({
    id: crypto.randomUUID(),
    plannedSessionId,
    eventType: newStatus,
    fromDate: session.plannedDate,
    toDate: null,
    reason: null,
  });

  return {
    ok: true,
    session: { id: plannedSessionId, plannedDate: session.plannedDate, status: newStatus },
  };
}

export type SwitchToCalmResult =
  | { ok: true; session: { id: string; plannedDate: string; sessionType: string; status: string } }
  | { ok: false; error: string };

/** Switch a planned STRENGTH session to CALM (e.g. from readiness "need calm"). */
export async function switchSessionToCalm(plannedSessionId: string): Promise<SwitchToCalmResult> {
  const [session] = await db
    .select()
    .from(plannedSessions)
    .where(eq(plannedSessions.id, plannedSessionId))
    .limit(1);

  if (!session) {
    return { ok: false, error: "Session not found." };
  }

  if (session.sessionType !== "STRENGTH") {
    return { ok: false, error: "Only strength sessions can be switched to calm." };
  }

  if (session.status === "COMPLETED") {
    return { ok: false, error: "Session already completed." };
  }

  await db
    .update(plannedSessions)
    .set({ sessionType: "CALM", sessionTemplate: null, status: "ADJUSTED" })
    .where(eq(plannedSessions.id, plannedSessionId));

  const crypto = await import("node:crypto");
  await db.insert(sessionEvents).values({
    id: crypto.randomUUID(),
    plannedSessionId,
    eventType: "SWITCHED_TO_CALM",
    fromDate: session.plannedDate,
    toDate: null,
    reason: null,
  });

  return {
    ok: true,
    session: { id: plannedSessionId, plannedDate: session.plannedDate, sessionType: "CALM", status: "ADJUSTED" },
  };
}
