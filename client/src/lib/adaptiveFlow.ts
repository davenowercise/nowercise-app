export type AdaptiveScreen = 
  | "PHASE_TRANSITION" 
  | "RETURNING" 
  | "NO_ENERGY" 
  | "PROGRESS_REFLECTION" 
  | "NONE";

export type Phase = "PRE_TREATMENT" | "IN_TREATMENT" | "POST_TREATMENT";
export type RecoveryPhase = "PROTECT" | "REBUILD" | "EXPAND";

export function mapRecoveryPhaseToTreatmentPhase(recoveryPhase?: RecoveryPhase): Phase {
  switch (recoveryPhase) {
    case "PROTECT":
      return "IN_TREATMENT";
    case "REBUILD":
    case "EXPAND":
      return "POST_TREATMENT";
    default:
      return "POST_TREATMENT";
  }
}
export type SessionFeedback = "COMFORTABLE" | "A_BIT_TIRING" | "TOO_MUCH";
export type EnergyLevel = "LOW" | "OKAY" | "GOOD";

interface UserState {
  needsPhaseTransition?: boolean;
  needsReturnAfterBreak?: boolean;
  needsNoEnergyFlow?: boolean;
  weekSessionCount?: number;
  progressReflectionSeenAt?: string;
}

export interface IntroMessageState {
  phase?: Phase;
  todayEnergy?: EnergyLevel;
  lastSessionFeedback?: SessionFeedback;
  lastSessionFeedbackAt?: string;
  lastSessionAt?: string;
  needsNoEnergyFlow?: boolean;
  needsReturnAfterBreak?: boolean;
}

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return null;
  const diffMs = Date.now() - d;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getAdaptiveIntroMessage(state: IntroMessageState): string | null {
  const gapDays = daysSince(state.lastSessionAt);

  if (state.needsReturnAfterBreak || (gapDays !== null && gapDays >= 7)) {
    return "We'll ease back in gently today — there's no catching up needed.";
  }

  if (state.needsNoEnergyFlow || state.todayEnergy === "LOW") {
    return "We've kept today very gentle to support you without draining you.";
  }

  switch (state.lastSessionFeedback) {
    case "TOO_MUCH":
      return "We've made today lighter to help your body recover.";
    case "A_BIT_TIRING":
      return "Today stays at a similar level — steady and supportive.";
    case "COMFORTABLE":
      return "We'll gently build from here, staying within your comfort.";
    default:
      break;
  }

  if (state.phase === "IN_TREATMENT") {
    return "We'll keep things supportive today and adjust to how you feel.";
  }
  if (state.phase === "POST_TREATMENT") {
    return "We'll keep building gently, with plenty of flexibility day to day.";
  }

  return "Today is supportive movement — steady, calm, and in your control.";
}

export function resolveAdaptiveScreen(userState: UserState | null): AdaptiveScreen {
  if (!userState) return "NONE";

  if (userState.needsPhaseTransition) {
    return "PHASE_TRANSITION";
  }

  if (userState.needsReturnAfterBreak) {
    return "RETURNING";
  }

  if (userState.needsNoEnergyFlow) {
    return "NO_ENERGY";
  }

  if (userState.weekSessionCount && userState.weekSessionCount >= 1) {
    const lastSeen = userState.progressReflectionSeenAt 
      ? new Date(userState.progressReflectionSeenAt) 
      : null;
    
    if (!lastSeen) {
      return "PROGRESS_REFLECTION";
    }
    
    const daysSinceLastShown = Math.floor(
      (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastShown >= 7) {
      return "PROGRESS_REFLECTION";
    }
  }

  return "NONE";
}
