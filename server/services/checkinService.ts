import { db } from "../db";
import { sql } from "drizzle-orm";
import { getUtcDateKey } from "../utils/dateKey";

// -----------------------------------------------------------------
// TodayCheckinStatus: full status object for today's check-in
// Used by multiple routes that need to know if the user has already
// submitted a check-in for today and what its contents are.
// -----------------------------------------------------------------
export interface TodayCheckinStatus {
  todayKey: string;
  checkin: any | null;
  hasCheckedInToday: boolean;
  checkinDateKey: string | null;
}

// -----------------------------------------------------------------
// getTodayCheckinStatus
// Returns the full check-in record for today (if any) along with
// derived flags. The server-side UTC date key is the single source
// of truth for "today".
// -----------------------------------------------------------------
export async function getTodayCheckinStatus(userId: string): Promise<TodayCheckinStatus> {
  const todayKey = getUtcDateKey();
  const result = await db.execute(sql`
    SELECT *
    FROM daily_checkins
    WHERE user_id = ${userId} AND date = ${todayKey}
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  `);

  const checkin = (result.rows[0] as any) || null;
  const checkinDateKey = checkin?.date ?? null;
  const hasCheckedInToday = !!checkin;

  console.log("[CHECKIN-STATUS]", {
    userId,
    todayKey,
    checkinDateKey,
    hasCheckedInToday,
  });

  return { todayKey, checkin, hasCheckedInToday, checkinDateKey };
}

// -----------------------------------------------------------------
// hasCheckedInToday
// Lightweight boolean check — returns true if the user already has
// a daily_checkins row for the server's current UTC date.
// Use this when you only need a yes/no answer without the full row.
// -----------------------------------------------------------------
export async function hasCheckedInToday(userId: string): Promise<boolean> {
  const todayKey = getUtcDateKey();
  const result = await db.execute(sql`
    SELECT 1
    FROM daily_checkins
    WHERE user_id = ${userId} AND date = ${todayKey}
    LIMIT 1
  `);
  return result.rows.length > 0;
}

// -----------------------------------------------------------------
// SaveCheckinData: the validated shape expected by saveTodayCheckin
// -----------------------------------------------------------------
export interface SaveCheckinData {
  energy: number;
  pain: number;
  confidence: number;
  sideEffects: string[];
  redFlags: string[];
  notes?: string;
}

// -----------------------------------------------------------------
// SaveCheckinResult: what saveTodayCheckin returns to the caller
// -----------------------------------------------------------------
export interface SaveCheckinResult {
  checkInId: number;
  createdAt: Date;
  dateKey: string;
  todayState: {
    safetyStatus: string;
    readinessScore: number;
    sessionLevel: string;
    intensityModifier: number | string;
    explainWhy: string;
    safetyMessage: { title: string; body: string };
  };
}

// -----------------------------------------------------------------
// saveTodayCheckin
// Single entry-point for persisting a daily check-in.
//
// Responsibilities:
//   1. Compute the server-side "today" date key (UTC).
//   2. Evaluate the safety / readiness state from the submitted data.
//   3. Upsert into daily_checkins (one row per user per day).
//   4. Insert into check_ins (clinical history — append-only).
//   5. Upsert into today_states (derived state for the session engine).
//   6. Trigger safety monitoring (immediate alerts + background patterns).
//   7. If red flags are present, create a safety_alert row and send
//      a non-blocking email notification.
//
// The caller (route handler) does NOT need to calculate dates or
// touch the database directly — this function is the single source
// of truth for "save a check-in".
// -----------------------------------------------------------------
export async function saveTodayCheckin(
  userId: string,
  data: SaveCheckinData
): Promise<SaveCheckinResult> {
  // 1. Server-authoritative date
  const dateKey = getUtcDateKey();

  // 2. Evaluate safety / readiness
  const { evaluateTodayState } = await import("./safetyEvaluationService");
  const todayState = evaluateTodayState({
    energy: data.energy,
    pain: data.pain,
    confidence: data.confidence,
    sideEffects: data.sideEffects,
    redFlags: data.redFlags,
  });

  console.log("[CHECKIN-SVC] TodayState evaluated:", todayState.safetyStatus);

  // 3. Upsert daily_checkins
  await db.execute(sql`
    INSERT INTO daily_checkins (user_id, date, energy, pain, confidence, side_effects, red_flags, notes)
    VALUES (${userId}, ${dateKey}, ${data.energy}, ${data.pain}, ${data.confidence},
            ${JSON.stringify(data.sideEffects)}::jsonb, ${JSON.stringify(data.redFlags)}::jsonb, ${data.notes || null})
    ON CONFLICT (user_id, date) DO UPDATE SET
      energy = EXCLUDED.energy,
      pain = EXCLUDED.pain,
      confidence = EXCLUDED.confidence,
      side_effects = EXCLUDED.side_effects,
      red_flags = EXCLUDED.red_flags,
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `);

  // 4. Append to check_ins (clinical history)
  const checkInResult = await db.execute(sql`
    INSERT INTO check_ins (user_id, energy_level, pain_level, confidence, side_effects, safety_flags, notes)
    VALUES (${userId}, ${data.energy}, ${data.pain}, ${data.confidence},
            ${JSON.stringify(data.sideEffects)}::jsonb, ${JSON.stringify(data.redFlags)}::jsonb, ${data.notes || null})
    RETURNING id, created_at
  `);
  const checkInRow = checkInResult.rows[0] as { id: number; created_at: Date };

  // 5. Upsert today_states
  await db.execute(sql`
    INSERT INTO today_states (user_id, date, safety_status, readiness_score, intensity_modifier, session_level, explain_why, safety_message_title, safety_message_body)
    VALUES (${userId}, ${dateKey}, ${todayState.safetyStatus}, ${todayState.readinessScore}, ${todayState.intensityModifier}, ${todayState.sessionLevel}, ${todayState.explainWhy}, ${todayState.safetyMessage.title}, ${todayState.safetyMessage.body})
    ON CONFLICT (user_id, date) DO UPDATE SET
      safety_status = EXCLUDED.safety_status,
      readiness_score = EXCLUDED.readiness_score,
      intensity_modifier = EXCLUDED.intensity_modifier,
      session_level = EXCLUDED.session_level,
      explain_why = EXCLUDED.explain_why,
      safety_message_title = EXCLUDED.safety_message_title,
      safety_message_body = EXCLUDED.safety_message_body
  `);

  // 6. Safety monitoring
  const { checkImmediateAlerts, runPatternAnalysis } = await import("./safetyMonitoringService");
  await checkImmediateAlerts(userId, dateKey, todayState.safetyStatus, data.redFlags);
  runPatternAnalysis(userId).catch(err => console.error("Pattern analysis error:", err));

  // 7. Red flag alerting (non-blocking)
  const hasRedFlags = data.redFlags.length > 0 && !data.redFlags.includes("NONE_APPLY");
  if (hasRedFlags) {
    try {
      await db.execute(sql`
        INSERT INTO safety_alerts (user_id, check_in_id, severity, reasons, message)
        VALUES (${userId}, ${checkInRow.id}, 'RED',
                ${JSON.stringify(data.redFlags)}::jsonb,
                ${'RED FLAG check-in. User selected: ' + data.redFlags.join(', ')})
      `);

      const { sendSafetyAlertEmail } = await import("./emailService");
      const appUrl = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'https://nowercise.replit.app';

      sendSafetyAlertEmail({
        userId,
        timestamp: new Date(),
        energy: data.energy,
        pain: data.pain,
        confidence: data.confidence,
        safetyFlags: data.redFlags,
        sideEffects: data.sideEffects,
        notes: data.notes,
        appUrl,
      }).then(async (sent) => {
        if (sent) {
          await db.execute(sql`
            UPDATE safety_alerts SET notified_at = NOW()
            WHERE check_in_id = ${checkInRow.id} AND notified_at IS NULL
          `);
        }
      }).catch(err => console.error("Email notification error:", err));
    } catch (alertError) {
      console.error("Safety alert error (non-blocking):", alertError);
    }
  }

  // Confirm status after save
  const status = await getTodayCheckinStatus(userId);
  console.log("[CHECKIN-SVC] Status after save:", status.hasCheckedInToday);

  return {
    checkInId: checkInRow.id,
    createdAt: checkInRow.created_at,
    dateKey,
    todayState: {
      safetyStatus: todayState.safetyStatus,
      readinessScore: todayState.readinessScore,
      sessionLevel: todayState.sessionLevel,
      intensityModifier: todayState.intensityModifier,
      explainWhy: todayState.explainWhy,
      safetyMessage: todayState.safetyMessage,
    },
  };
}

export async function isTodayPaused(userId: string): Promise<boolean> {
  const dateKey = getUtcDateKey();
  const result = await db.execute(sql`
    SELECT safety_status FROM today_states
    WHERE user_id = ${userId} AND date = ${dateKey}
    LIMIT 1
  `);
  if (result.rows.length === 0) return false;
  return (result.rows[0] as any).safety_status === "RED";
}
