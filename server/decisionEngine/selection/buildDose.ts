import caps from "../rules/doseCaps.json";
import type { PlanVariant, WorkoutDose } from "../types";

export function buildDose(variant: PlanVariant): WorkoutDose {
  const cap = (caps as Record<PlanVariant, WorkoutDose>)[variant];
  return {
    sets: cap.sets,
    reps: cap.reps || undefined,
    seconds: cap.seconds || undefined,
    restSeconds: cap.restSeconds || undefined,
    rpeCap: cap.rpeCap || undefined,
  };
}
