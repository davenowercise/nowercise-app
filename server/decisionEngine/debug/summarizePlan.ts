import type { MarkerKey, MarkerResult, TodayPlanOutput } from "../types";

type MarkerSummary = {
  sitToStand?: { rating?: string; comfortableReps?: number; side?: string };
  supportedMarch?: { rating?: string; comfortableReps?: number; side?: string };
  shoulderRaise?: { rating?: string; comfortableReps?: number; side?: string };
};

export function summarizePlan(
  plan: TodayPlanOutput,
  latestMarkers?: Partial<Record<MarkerKey, MarkerResult>>
) {
  const markerSummary: MarkerSummary = {
    sitToStand: latestMarkers?.SIT_TO_STAND
      ? {
          rating: latestMarkers.SIT_TO_STAND.rating,
          comfortableReps: latestMarkers.SIT_TO_STAND.comfortableReps,
          side: latestMarkers.SIT_TO_STAND.side,
        }
      : undefined,
    supportedMarch: latestMarkers?.SUPPORTED_MARCH
      ? {
          rating: latestMarkers.SUPPORTED_MARCH.rating,
          comfortableReps: latestMarkers.SUPPORTED_MARCH.comfortableReps,
          side: latestMarkers.SUPPORTED_MARCH.side,
        }
      : undefined,
    shoulderRaise: latestMarkers?.SHOULDER_RAISE
      ? {
          rating: latestMarkers.SHOULDER_RAISE.rating,
          comfortableReps: latestMarkers.SHOULDER_RAISE.comfortableReps,
          side: latestMarkers.SHOULDER_RAISE.side,
        }
      : undefined,
  };

  return {
    safetyStatus: plan.safetyStatus,
    capacityScore: plan.capacityScore,
    recommendedVariant: plan.recommendedVariant,
    markerSummary,
    constraintsApplied: plan.explain.constraintsApplied,
    selectionReasons: plan.explain.selectionReasons.slice(0, 3),
  };
}
