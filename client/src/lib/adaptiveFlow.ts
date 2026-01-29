export type AdaptiveScreen = 
  | "PHASE_TRANSITION" 
  | "RETURNING" 
  | "NO_ENERGY" 
  | "PROGRESS_REFLECTION" 
  | "NONE";

interface UserState {
  needsPhaseTransition?: boolean;
  needsReturnAfterBreak?: boolean;
  needsNoEnergyFlow?: boolean;
  weekSessionCount?: number;
  progressReflectionSeenAt?: string;
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
