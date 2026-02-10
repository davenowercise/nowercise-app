import type {
  GenerateTodayPlanInput,
  TodayPlanOutput,
  PlanVariant
} from "./types";
import { safetyGate } from "./safetyGate";
import { computeCapacity } from "./capacityScore";
import { applySafetyFilters } from "./filters/applySafetyFilters";
import { applyPainFilters } from "./filters/applyPainFilters";
import { selectBlocks } from "./selection/selectBlocks";
import { selectExercises } from "./selection/selectExercises";
import { buildExplainability } from "./explain/buildExplainability";

export async function generateTodayPlan(input: GenerateTodayPlanInput): Promise<TodayPlanOutput> {
  const safety = safetyGate(input);
  const capacity = computeCapacity(input, safety);

  const variant: PlanVariant =
    safety.status === "RED" ? "RESET" :
    capacity.band === "HIGH" ? "MAIN" :
    capacity.band === "MED" ? "EASIER" : "RESET";

  const safetyFiltered = applySafetyFilters(input.exercises, input, variant);
  const painFiltered = applyPainFilters(safetyFiltered.exercises, input.checkin.pain010);
  const constraintsApplied = [
    ...safetyFiltered.constraintsApplied,
    ...painFiltered.constraintsApplied
  ];

  if (painFiltered.exercises.length === 0) {
    const explain = buildExplainability("RESET", safety, capacity, [
      ...constraintsApplied,
      "Insufficient safe exercises available today."
    ]);
    explain.planWhy = "Insufficient safe exercises available today.";
    return {
      dateISO: input.checkin.dateISO,
      safetyStatus: safety.status,
      recommendedVariant: "RESET",
      capacityScore: capacity.score,
      capacityBand: capacity.band,
      blocks: [],
      explain,
      meta: { version: "v1", generatedAtISO: new Date().toISOString() }
    };
  }

  const painLocations = input.checkin.painLocations || [];
  const needsShoulderMarker =
    input.user.safety.postOpShoulderRisk !== "NONE" ||
    painLocations.includes("SHOULDER");
  const blocksTemplate = selectBlocks(variant).filter(block =>
    block.blockKey !== "MARKER_SHOULDER_RAISE" || needsShoulderMarker
  );
  const selection = selectExercises(
    blocksTemplate,
    painFiltered.exercises,
    variant,
    painLocations,
    input.markerSignals
  );

  return {
    dateISO: input.checkin.dateISO,
    safetyStatus: safety.status,
    recommendedVariant: variant,
    capacityScore: capacity.score,
    capacityBand: capacity.band,
    blocks: selection.blocks,
    explain: buildExplainability(variant, safety, capacity, constraintsApplied, selection.selectionReasons, selection.constraintsApplied),
    meta: { version: "v1", generatedAtISO: new Date().toISOString() }
  };
}
