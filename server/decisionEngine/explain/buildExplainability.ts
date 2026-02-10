import type { CapacityResult } from "../capacityScore";
import type { SafetyGateResult } from "../safetyGate";
import type { PlanVariant, Explainability } from "../types";

export function buildExplainability(
  variant: PlanVariant,
  safety: SafetyGateResult,
  capacity: CapacityResult,
  constraintsApplied: string[] = [],
  selectionReasons: string[] = [],
  selectionConstraints: string[] = []
): Explainability {
  const planWhy = variant === "RESET"
    ? "Recovery-focused based on safety and symptoms."
    : variant === "EASIER"
      ? "Lighter plan based on how you’re feeling today."
      : "Maintaining steady progress with a main plan.";

  return {
    summary: `Plan ${variant}, capacity ${capacity.score}`,
    safetyReasons: safety.reasons,
    capacityDrivers: capacity.drivers,
    planWhy,
    constraintsApplied: Array.from(new Set([...constraintsApplied, ...selectionConstraints])),
    selectionReasons: selectionReasons.slice(0, 3),
  };
}
