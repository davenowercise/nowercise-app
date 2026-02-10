import weights from "./rules/capacityWeights.json";
import type { GenerateTodayPlanInput, CapacityBand } from "./types";
import type { SafetyGateResult } from "./safetyGate";

export interface CapacityResult {
  score: number;
  band: CapacityBand;
  drivers: string[];
}

export function computeCapacity(input: GenerateTodayPlanInput, _safety: SafetyGateResult): CapacityResult {
  let score = weights.base;
  const drivers: string[] = [];

  score -= input.checkin.fatigue010 * weights.symptoms.fatigue010_weight;
  drivers.push("Fatigue influenced capacity");

  score -= input.checkin.pain010 * weights.symptoms.pain010_weight;
  drivers.push("Pain influenced capacity");

  if (input.checkin.nausea010 != null) {
    score -= input.checkin.nausea010 * weights.symptoms.nausea010_weight;
    drivers.push("Nausea influenced capacity");
  }

  if (input.checkin.sleep010 != null) {
    score -= input.checkin.sleep010 * weights.symptoms.sleep010_weight;
    drivers.push("Sleep influenced capacity");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const band: CapacityBand =
    score >= weights.bandThresholds.HIGH_gte ? "HIGH" :
    score >= weights.bandThresholds.MED_gte ? "MED" : "LOW";

  return { score, band, drivers };
}
