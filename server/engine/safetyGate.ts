import { Symptoms, SafetyGateResult, SafetyFlag, DoseBias } from './types';

export function evaluateSafetyGate(symptoms: Symptoms): SafetyGateResult {
  const reasons: string[] = [];
  let safetyFlag: SafetyFlag = "GREEN";
  let suggestedBias: DoseBias = "NORMAL";

  if (symptoms.fatigue >= 8 || symptoms.pain >= 8) {
    safetyFlag = "RED";
    suggestedBias = "LOWER_DOSE";
    
    if (symptoms.fatigue >= 8) {
      reasons.push("High fatigue level (8+) detected");
    }
    if (symptoms.pain >= 8) {
      reasons.push("High pain level (8+) detected");
    }
    reasons.push("Recommending recovery-focused session");
  } else if (symptoms.fatigue >= 6 || symptoms.pain >= 6 || symptoms.anxiety >= 7) {
    safetyFlag = "AMBER";
    suggestedBias = "LOWER_DOSE";
    
    if (symptoms.fatigue >= 6) {
      reasons.push("Elevated fatigue (6+) - reducing intensity");
    }
    if (symptoms.pain >= 6) {
      reasons.push("Elevated pain (6+) - reducing load");
    }
    if (symptoms.anxiety >= 7) {
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
