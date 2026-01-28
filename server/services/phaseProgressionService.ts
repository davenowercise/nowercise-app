import { db } from "../db";
import { sql } from "drizzle-orm";

type RecoveryPhase = "PROTECT" | "REBUILD" | "EXPAND";

interface StabilityBreakdown {
  energyComponent: number;
  confidenceComponent: number;
  painComponent: number;
  safetyAdjustment: number;
  redDays: number;
  yellowDays: number;
  greenDays: number;
  totalCheckins: number;
  avgEnergy: number;
  avgPain: number;
  avgConfidence: number;
}

interface StabilityResult {
  stabilityScore: number;
  breakdown: StabilityBreakdown;
}

interface PhaseEvaluationResult {
  recoveryPhase: RecoveryPhase;
  stabilityScore: number;
  phaseReason: string;
  phaseChanged: boolean;
  previousPhase?: RecoveryPhase;
}

async function getCheckinData(userId: string, days: number = 14): Promise<{
  checkins: any[];
  states: any[];
}> {
  const checkins = await db.execute(sql`
    SELECT date, energy, pain, confidence, side_effects, red_flags
    FROM daily_checkins
    WHERE user_id = ${userId}
    AND date >= CURRENT_DATE - ${days}::int
    ORDER BY date DESC
  `);

  const states = await db.execute(sql`
    SELECT date, safety_status
    FROM today_states
    WHERE user_id = ${userId}
    AND date >= CURRENT_DATE - ${days}::int
    ORDER BY date DESC
  `);

  return {
    checkins: checkins.rows as any[],
    states: states.rows as any[],
  };
}

export function computeStabilityScore(
  checkins: any[],
  states: any[]
): StabilityResult {
  if (checkins.length === 0) {
    return {
      stabilityScore: 50,
      breakdown: {
        energyComponent: 17.5,
        confidenceComponent: 17.5,
        painComponent: 10,
        safetyAdjustment: 0,
        redDays: 0,
        yellowDays: 0,
        greenDays: 0,
        totalCheckins: 0,
        avgEnergy: 5,
        avgPain: 5,
        avgConfidence: 5,
      },
    };
  }

  const safetyMap = new Map<string, string>();
  for (const state of states) {
    safetyMap.set(state.date, state.safety_status);
  }

  let totalEnergy = 0;
  let totalPain = 0;
  let totalConfidence = 0;
  let redDays = 0;
  let yellowDays = 0;
  let greenDays = 0;

  for (const checkin of checkins) {
    totalEnergy += checkin.energy;
    totalPain += checkin.pain;
    totalConfidence += checkin.confidence;

    const status = safetyMap.get(checkin.date) || "GREEN";
    if (status === "RED") redDays++;
    else if (status === "YELLOW") yellowDays++;
    else greenDays++;
  }

  const count = checkins.length;
  const avgEnergy = totalEnergy / count;
  const avgPain = totalPain / count;
  const avgConfidence = totalConfidence / count;

  const energyComponent = (avgEnergy / 10) * 35;
  const confidenceComponent = (avgConfidence / 10) * 35;
  const painComponent = ((10 - avgPain) / 10) * 20;

  let safetyAdjustment = 0;
  if (redDays >= 1) {
    safetyAdjustment = -30;
  } else if (yellowDays >= 4) {
    safetyAdjustment = -15;
  } else if (yellowDays >= 2) {
    safetyAdjustment = -8;
  }

  const rawScore = energyComponent + confidenceComponent + painComponent + safetyAdjustment;
  const stabilityScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    stabilityScore,
    breakdown: {
      energyComponent: Math.round(energyComponent * 10) / 10,
      confidenceComponent: Math.round(confidenceComponent * 10) / 10,
      painComponent: Math.round(painComponent * 10) / 10,
      safetyAdjustment,
      redDays,
      yellowDays,
      greenDays,
      totalCheckins: count,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgPain: Math.round(avgPain * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
    },
  };
}

function determinePhase(
  currentPhase: RecoveryPhase,
  stabilityScore: number,
  redDays: number,
  yellowDays: number,
  totalCheckins: number
): { newPhase: RecoveryPhase; reason: string } {
  if (redDays >= 1) {
    return {
      newPhase: "PROTECT",
      reason: "RED flag detected in the past 14 days - safety first.",
    };
  }

  if (yellowDays >= 6) {
    return {
      newPhase: "PROTECT",
      reason: "High frequency of YELLOW days (6+) - focusing on stability.",
    };
  }

  if (totalCheckins < 10) {
    return {
      newPhase: currentPhase,
      reason: `Maintaining ${currentPhase} phase - need at least 10 check-ins for reliable evaluation.`,
    };
  }

  if (currentPhase === "PROTECT") {
    if (stabilityScore >= 62 && redDays === 0 && yellowDays <= 2) {
      return {
        newPhase: "REBUILD",
        reason: `Moved to REBUILD: stability score ${stabilityScore} with consistent energy/confidence and minimal yellow days.`,
      };
    }
    return {
      newPhase: "PROTECT",
      reason: `Maintaining PROTECT: stability score ${stabilityScore} - continue building foundation.`,
    };
  }

  if (currentPhase === "REBUILD") {
    if (stabilityScore <= 55 || yellowDays >= 4) {
      return {
        newPhase: "PROTECT",
        reason: `Moved to PROTECT: ${stabilityScore <= 55 ? `stability score dropped to ${stabilityScore}` : "repeated yellow days"} - refocusing on stability.`,
      };
    }
    if (stabilityScore >= 74 && redDays === 0 && yellowDays <= 1) {
      return {
        newPhase: "EXPAND",
        reason: `Moved to EXPAND: stability score ${stabilityScore} with excellent consistency.`,
      };
    }
    return {
      newPhase: "REBUILD",
      reason: `Maintaining REBUILD: stability score ${stabilityScore} - continue building capacity.`,
    };
  }

  if (currentPhase === "EXPAND") {
    if (redDays >= 1) {
      return {
        newPhase: "PROTECT",
        reason: "Moved to PROTECT: RED flag detected - prioritizing safety.",
      };
    }
    if (stabilityScore <= 65 || yellowDays >= 3) {
      return {
        newPhase: "REBUILD",
        reason: `Moved to REBUILD: ${stabilityScore <= 65 ? `stability score ${stabilityScore}` : "increased yellow days"} - consolidating gains.`,
      };
    }
    return {
      newPhase: "EXPAND",
      reason: `Maintaining EXPAND: stability score ${stabilityScore} - continuing progression.`,
    };
  }

  return { newPhase: "PROTECT", reason: "Default to PROTECT phase." };
}

async function getCurrentPhase(userId: string): Promise<RecoveryPhase> {
  const result = await db.execute(sql`
    SELECT recovery_phase FROM user_recovery_status WHERE user_id = ${userId} LIMIT 1
  `);

  if (result.rows.length === 0) {
    return "PROTECT";
  }

  return (result.rows[0] as any).recovery_phase as RecoveryPhase;
}

async function updatePhase(
  userId: string,
  phase: RecoveryPhase,
  stabilityScore: number,
  reason: string,
  previousPhase: RecoveryPhase
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  await db.execute(sql`
    INSERT INTO user_recovery_status (user_id, recovery_phase, phase_updated_at, phase_reason, stability_score)
    VALUES (${userId}, ${phase}, NOW(), ${reason}, ${stabilityScore})
    ON CONFLICT (user_id) DO UPDATE SET
      recovery_phase = ${phase},
      phase_updated_at = NOW(),
      phase_reason = ${reason},
      stability_score = ${stabilityScore},
      updated_at = NOW()
  `);

  if (phase !== previousPhase) {
    await db.execute(sql`
      INSERT INTO phase_history (user_id, date, from_phase, to_phase, stability_score, reason)
      VALUES (${userId}, ${today}, ${previousPhase}, ${phase}, ${stabilityScore}, ${reason})
    `);

    console.log(`[PHASE CHANGE] User ${userId}: ${previousPhase} -> ${phase} (score: ${stabilityScore})`);
  }
}

export async function evaluatePhase(userId: string): Promise<PhaseEvaluationResult> {
  const { checkins, states } = await getCheckinData(userId, 14);
  const { stabilityScore, breakdown } = computeStabilityScore(checkins, states);

  const currentPhase = await getCurrentPhase(userId);
  const { newPhase, reason } = determinePhase(
    currentPhase,
    stabilityScore,
    breakdown.redDays,
    breakdown.yellowDays,
    breakdown.totalCheckins
  );

  await updatePhase(userId, newPhase, stabilityScore, reason, currentPhase);

  return {
    recoveryPhase: newPhase,
    stabilityScore,
    phaseReason: reason,
    phaseChanged: newPhase !== currentPhase,
    previousPhase: newPhase !== currentPhase ? currentPhase : undefined,
  };
}

export async function getPhaseStatus(userId: string): Promise<{
  recoveryPhase: RecoveryPhase;
  stabilityScore: number | null;
  phaseReason: string | null;
  phaseUpdatedAt: string | null;
}> {
  const result = await db.execute(sql`
    SELECT recovery_phase, stability_score, phase_reason, phase_updated_at
    FROM user_recovery_status
    WHERE user_id = ${userId}
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return {
      recoveryPhase: "PROTECT",
      stabilityScore: null,
      phaseReason: "Default starting phase - no evaluation yet.",
      phaseUpdatedAt: null,
    };
  }

  const row = result.rows[0] as any;
  return {
    recoveryPhase: row.recovery_phase,
    stabilityScore: row.stability_score,
    phaseReason: row.phase_reason,
    phaseUpdatedAt: row.phase_updated_at,
  };
}

export function getPhaseSessionCaps(phase: RecoveryPhase): {
  allowedLevels: string[];
  maxLevel: string;
} {
  switch (phase) {
    case "PROTECT":
      return { allowedLevels: ["VERY_LOW", "LOW"], maxLevel: "LOW" };
    case "REBUILD":
      return { allowedLevels: ["VERY_LOW", "LOW", "MEDIUM"], maxLevel: "MEDIUM" };
    case "EXPAND":
      return { allowedLevels: ["LOW", "MEDIUM"], maxLevel: "MEDIUM" };
    default:
      return { allowedLevels: ["VERY_LOW", "LOW"], maxLevel: "LOW" };
  }
}
