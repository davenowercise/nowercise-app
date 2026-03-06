/**
 * Planner service tests. Require DATABASE_URL.
 * Run: DATABASE_URL=... npm test
 * Skipped when DATABASE_URL is not set.
 */
import test from "node:test";
import assert from "node:assert/strict";

const hasDb = !!process.env.DATABASE_URL;

test("generateWeekPlan refuses if COMPLETED exists unless force=true", {
  skip: !hasDb,
}, async () => {
  const { generateWeekPlan } = await import("../plannerService");
  const { db } = await import("../../db");
  const { plannedSessions } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");

  const userId = "planner-force-test-" + Date.now();
  const weekStart = "2026-02-09";

  const r1 = await generateWeekPlan(userId, weekStart);
  const monSession = r1.sessions.find((s) => s.plannedDate === "2026-02-09");
  assert.ok(monSession);
  await db.update(plannedSessions).set({ status: "COMPLETED" }).where(eq(plannedSessions.id, monSession.id));

  await assert.rejects(
    () => generateWeekPlan(userId, weekStart),
    /regeneration requires force=true/
  );

  const result = await generateWeekPlan(userId, weekStart, { force: true });
  assert.equal(result.ok, true);
});

test("moveSession blocks moving if it creates Thu+Fri adjacent strength", {
  skip: !hasDb,
}, async () => {
  const { generateWeekPlan, moveSession } = await import("../plannerService");

  const userId = "planner-adjacent-test-" + Date.now();
  const weekStart = "2026-02-09";
  const result = await generateWeekPlan(userId, weekStart);
  const [wedSession] = result.sessions.filter((s) => s.plannedDate === "2026-02-11");

  const moveResult = await moveSession(wedSession.id, "2026-02-12");
  assert.equal(moveResult.ok, false);
  assert.ok((moveResult as { error: string }).error.includes("recovery day"));
});

test("moveSession blocks moving onto existing strength day", {
  skip: !hasDb,
}, async () => {
  const { generateWeekPlan, moveSession } = await import("../plannerService");

  const userId = "planner-collision-test-" + Date.now();
  const weekStart = "2026-02-09";
  const result = await generateWeekPlan(userId, weekStart);
  const [monSession] = result.sessions.filter((s) => s.plannedDate === "2026-02-09");
  const [wedSession] = result.sessions.filter((s) => s.plannedDate === "2026-02-11");

  const moveResult = await moveSession(wedSession.id, "2026-02-09");
  assert.equal(moveResult.ok, false);
  assert.ok((moveResult as { error: string }).error.includes("already has a strength session"));
});

test("uniqueness constraint prevents duplicates", {
  skip: !hasDb,
}, async () => {
  const { db } = await import("../../db");
  const { plannedSessions } = await import("@shared/schema");
  const crypto = await import("node:crypto");

  const userId = "planner-dup-test-" + Date.now();
  const weekStart = "2026-02-09";
  const dateStr = "2026-02-09";

  await db.insert(plannedSessions).values({
    id: crypto.randomUUID(),
    userId,
    weekStartDate: weekStart,
    plannedDate: dateStr,
    sessionType: "STRENGTH",
    sessionTemplate: "GentleStrength_A",
    status: "PLANNED",
  });

  await assert.rejects(
    () =>
      db.insert(plannedSessions).values({
        id: crypto.randomUUID(),
        userId,
        weekStartDate: weekStart,
        plannedDate: dateStr,
        sessionType: "STRENGTH",
        sessionTemplate: "GentleStrength_A",
        status: "PLANNED",
      }),
    /duplicate key|unique constraint/i
  );
});
