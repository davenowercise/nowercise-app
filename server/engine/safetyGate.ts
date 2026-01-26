import { Symptoms, SafetyGateResult, SafetyFlag, DoseBias } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function evaluateSafetyGate(symptoms: Symptoms): SafetyGateResult {
  const fatigue = clamp(symptoms.fatigue, 0, 10);
  const pain = clamp(symptoms.pain, 0, 10);
  const anxiety = clamp(symptoms.anxiety, 0, 10);

  const reasons: string[] = [];
  let safetyFlag: SafetyFlag = "GREEN";
  let suggestedBias: DoseBias = "NORMAL";

  if (fatigue >= 8 || pain >= 8) {
    safetyFlag = "RED";
    suggestedBias = "LOWER_DOSE";
    
    if (fatigue >= 8) {
      reasons.push("High fatigue level (8+) detected");
    }
    if (pain >= 8) {
      reasons.push("High pain level (8+) detected");
    }
    reasons.push("Recommending recovery-focused session");
  } else if (fatigue >= 6 || pain >= 6 || anxiety >= 7) {
    safetyFlag = "AMBER";
    suggestedBias = "LOWER_DOSE";
    
    if (fatigue >= 6) {
      reasons.push("Elevated fatigue (6+) - reducing intensity");
    }
    if (pain >= 6) {
      reasons.push("Elevated pain (6+) - reducing load");
    }
    if (anxiety >= 7) {
      reasons.push("Elevated anxiety (7+) - focusing on calming movements");
    }
  } else {
    reasons.push("Symptoms within normal range - full session recommended");
  }

  return {
    safetyFlag,
    reasons,
    suggestedBias,
  };
}
