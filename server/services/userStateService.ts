import { db } from "../db";
import { sql } from "drizzle-orm";

type SessionFeedback = "COMFORTABLE" | "A_BIT_TIRING" | "TOO_MUCH";
type TomorrowAdjustment = "LIGHTER" | "SAME" | "GENTLE_BUILD";

interface UserState {
  userId: string;
  
  phase: "PROTECT" | "REBUILD" | "EXPAND";
  phaseChangedAt?: string;
  phaseTransitionSeenAt?: string;
  
  lastSessionAt?: string;
  lastSessionFeedback?: SessionFeedback;
  lastSessionFeedbackAt?: string;
  
  weekSessionCount: number;
  weekWindowStart?: string;
  
  todayEnergy?: "LOW" | "OKAY" | "GOOD";
  todayComfort?: "UNCOMFORTABLE" | "MANAGEABLE" | "COMFORTABLE";
  todayConfidence?: "LOW" | "SOME" | "READY";
  
  tomorrowAdjustment?: TomorrowAdjustment;
  
  progressReflectionSeenAt?: string;
  
  needsNoEnergyFlow: boolean;
  needsReturnAfterBreak: boolean;
  needsPhaseTransition: boolean;
}

async function ensureAdaptiveState(userId: string): Promise<void> {
  const existing = await db.execute(sql`
    SELECT id FROM user_adaptive_state WHERE user_id = ${userId}
  `);
  
  if (existing.rows.length === 0) {
    await db.execute(sql`
      INSERT INTO user_adaptive_state (user_id, week_session_count, created_at, updated_at)
      VALUES (${userId}, 0, NOW(), NOW())
    `);
  }
}

export async function getUserState(userId: string): Promise<UserState> {
  await ensureAdaptiveState(userId);
  
  const adaptiveResult = await db.execute(sql`
    SELECT 
      phase_transition_seen_at,
      last_session_at,
      last_session_feedback,
      last_session_feedback_at,
      week_session_count,
      week_window_start,
      tomorrow_adjustment,
      progress_reflection_seen_at
    FROM user_adaptive_state
    WHERE user_id = ${userId}
  `);
  
  const recoveryResult = await db.execute(sql`
    SELECT 
      recovery_phase,
      phase_updated_at
    FROM user_recovery_status
    WHERE user_id = ${userId}
  `);
  
  const todayCheckin = await db.execute(sql`
    SELECT energy, pain, confidence
    FROM daily_checkins
    WHERE user_id = ${userId}
    AND date = CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1
  `);
  
  const adaptiveState = adaptiveResult.rows[0] as any || {};
  const recoveryState = recoveryResult.rows[0] as any || { recovery_phase: "PROTECT" };
  const checkin = todayCheckin.rows[0] as any;
  
  const phase = recoveryState.recovery_phase || "PROTECT";
  const phaseChangedAt = recoveryState.phase_updated_at ? new Date(recoveryState.phase_updated_at).toISOString() : undefined;
  const phaseTransitionSeenAt = adaptiveState.phase_transition_seen_at ? new Date(adaptiveState.phase_transition_seen_at).toISOString() : undefined;
  
  const lastSessionAt = adaptiveState.last_session_at ? new Date(adaptiveState.last_session_at).toISOString() : undefined;
  
  let todayEnergy: "LOW" | "OKAY" | "GOOD" | undefined;
  if (checkin) {
    const energy = checkin.energy as number;
    if (energy <= 3) todayEnergy = "LOW";
    else if (energy <= 6) todayEnergy = "OKAY";
    else todayEnergy = "GOOD";
  }
  
  let todayComfort: "UNCOMFORTABLE" | "MANAGEABLE" | "COMFORTABLE" | undefined;
  if (checkin) {
    const pain = checkin.pain as number;
    if (pain >= 7) todayComfort = "UNCOMFORTABLE";
    else if (pain >= 4) todayComfort = "MANAGEABLE";
    else todayComfort = "COMFORTABLE";
  }
  
  let todayConfidence: "LOW" | "SOME" | "READY" | undefined;
  if (checkin) {
    const conf = checkin.confidence as number;
    if (conf <= 3) todayConfidence = "LOW";
    else if (conf <= 6) todayConfidence = "SOME";
    else todayConfidence = "READY";
  }
  
  const daysSinceSession = lastSessionAt 
    ? Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  const needsReturnAfterBreak = daysSinceSession >= 7;
  const needsNoEnergyFlow = todayEnergy === "LOW";
  
  let needsPhaseTransition = false;
  if (phaseChangedAt) {
    if (!phaseTransitionSeenAt) {
      needsPhaseTransition = true;
    } else {
      needsPhaseTransition = new Date(phaseChangedAt) > new Date(phaseTransitionSeenAt);
    }
  }
  
  return {
    userId,
    phase,
    phaseChangedAt,
    phaseTransitionSeenAt,
    lastSessionAt,
    lastSessionFeedback: adaptiveState.last_session_feedback as SessionFeedback | undefined,
    lastSessionFeedbackAt: adaptiveState.last_session_feedback_at ? new Date(adaptiveState.last_session_feedback_at).toISOString() : undefined,
    weekSessionCount: adaptiveState.week_session_count || 0,
    weekWindowStart: adaptiveState.week_window_start,
    todayEnergy,
    todayComfort,
    todayConfidence,
    tomorrowAdjustment: adaptiveState.tomorrow_adjustment as TomorrowAdjustment | undefined,
    progressReflectionSeenAt: adaptiveState.progress_reflection_seen_at ? new Date(adaptiveState.progress_reflection_seen_at).toISOString() : undefined,
    needsNoEnergyFlow,
    needsReturnAfterBreak,
    needsPhaseTransition,
  };
}

export async function markSessionComplete(userId: string, completedAt: string): Promise<void> {
  await ensureAdaptiveState(userId);
  
  const completedDate = new Date(completedAt);
  const sevenDaysAgo = new Date(completedDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const currentState = await db.execute(sql`
    SELECT week_session_count, week_window_start
    FROM user_adaptive_state
    WHERE user_id = ${userId}
  `);
  
  const state = currentState.rows[0] as any;
  let weekSessionCount = state?.week_session_count || 0;
  const weekWindowStart = state?.week_window_start ? new Date(state.week_window_start) : null;
  
  if (weekWindowStart && weekWindowStart < sevenDaysAgo) {
    weekSessionCount = 1;
  } else {
    weekSessionCount += 1;
  }
  
  await db.execute(sql`
    UPDATE user_adaptive_state
    SET 
      last_session_at = ${completedDate},
      week_session_count = ${weekSessionCount},
      week_window_start = COALESCE(week_window_start, ${completedDate.toISOString().split('T')[0]}),
      updated_at = NOW()
    WHERE user_id = ${userId}
  `);
}

export async function recordSessionFeedback(
  userId: string, 
  feedback: SessionFeedback, 
  at: string
): Promise<UserState> {
  await ensureAdaptiveState(userId);
  
  let tomorrowAdjustment: TomorrowAdjustment;
  if (feedback === "TOO_MUCH") {
    tomorrowAdjustment = "LIGHTER";
  } else if (feedback === "A_BIT_TIRING") {
    tomorrowAdjustment = "SAME";
  } else {
    tomorrowAdjustment = "GENTLE_BUILD";
  }
  
  await db.execute(sql`
    UPDATE user_adaptive_state
    SET 
      last_session_feedback = ${feedback},
      last_session_feedback_at = ${new Date(at)},
      tomorrow_adjustment = ${tomorrowAdjustment},
      updated_at = NOW()
    WHERE user_id = ${userId}
  `);
  
  return getUserState(userId);
}

export async function markPhaseTransitionSeen(userId: string, seenAt: string): Promise<void> {
  await ensureAdaptiveState(userId);
  
  await db.execute(sql`
    UPDATE user_adaptive_state
    SET 
      phase_transition_seen_at = ${new Date(seenAt)},
      updated_at = NOW()
    WHERE user_id = ${userId}
  `);
}

export async function markProgressReflectionSeen(userId: string, seenAt: string): Promise<void> {
  await ensureAdaptiveState(userId);
  
  await db.execute(sql`
    UPDATE user_adaptive_state
    SET 
      progress_reflection_seen_at = ${new Date(seenAt)},
      updated_at = NOW()
    WHERE user_id = ${userId}
  `);
}

export async function needsLighterSession(userId: string): Promise<boolean> {
  const state = await getUserState(userId);
  
  if (state.needsNoEnergyFlow) return true;
  
  if (state.lastSessionFeedback === "TOO_MUCH" && state.lastSessionFeedbackAt) {
    const hoursSinceFeedback = (Date.now() - new Date(state.lastSessionFeedbackAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceFeedback <= 48) return true;
  }
  
  if (state.tomorrowAdjustment === "LIGHTER") return true;
  
  return false;
}
