import rules from "./rules/safetyRules.json";
import type { GenerateTodayPlanInput, SafetyStatus } from "./types";

export interface SafetyGateResult {
  status: SafetyStatus;
  reasons: string[];
}

export function safetyGate(input: GenerateTodayPlanInput): SafetyGateResult {
  const reasons: string[] = [];
  const rf = input.checkin.redFlags ?? {};

  for (const key of rules.redFlagsImmediate) {
    if (rf[key as keyof typeof rf]) {
      reasons.push(`Red flag: ${key}`);
    }
  }

  if (reasons.length > 0) {
    return { status: "RED", reasons };
  }

  if (input.checkin.fatigue010 >= rules.amberConditions.fatigue010_gte) {
    reasons.push("High fatigue");
  }
  if (input.checkin.pain010 >= rules.amberConditions.pain010_gte) {
    reasons.push("High pain");
  }

  if (reasons.length > 0) {
    return { status: "AMBER", reasons };
  }

  return { status: "GREEN", reasons: [] };
}
