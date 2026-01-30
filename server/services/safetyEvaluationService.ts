type SafetyStatus = "GREEN" | "YELLOW" | "RED";
type IntensityModifier = "DOWN2" | "DOWN1" | "SAME" | "UP1";
type SessionLevel = "VERY_LOW" | "LOW" | "MEDIUM";

interface CheckinInput {
  energy: number;
  pain: number;
  confidence: number;
  sideEffects: string[];
  redFlags: string[];
}

interface TodayStateOutput {
  safetyStatus: SafetyStatus;
  readinessScore: number;
  intensityModifier: IntensityModifier;
  sessionLevel: SessionLevel;
  explainWhy: string;
  safetyMessage: {
    title: string;
    body: string;
  };
}

const RED_FLAG_ITEMS = [
  "chest_pain",
  "fever",
  "severe_breathlessness",
  "fainting",
  "new_sudden_swelling",
  "signs_of_infection",
];

const YELLOW_FLAG_SIDE_EFFECTS = [
  "dizziness_mild",
  "new_swelling",
  "neuropathy_flare",
  "unusual_fatigue_spike",
  "persistent_joint_pain",
];

function computeReadinessScore(energy: number, confidence: number, pain: number): number {
  const energyContrib = (energy / 10) * 40;
  const confidenceContrib = (confidence / 10) * 40;
  const painReduction = ((10 - pain) / 10) * 20;
  const raw = energyContrib + confidenceContrib + painReduction;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

function formatSideEffect(effect: string): string {
  return effect.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function generateExplainWhy(
  status: SafetyStatus,
  energy: number,
  pain: number,
  sideEffects: string[],
  redFlags: string[]
): string {
  if (status === "RED") {
    return "Please pause exercise for now and check with your medical team. Safety comes first, and we want to make sure you're okay before continuing.";
  }

  if (status === "YELLOW") {
    const reasons: string[] = [];

    if (energy <= 3) {
      reasons.push("your energy is lower than usual");
    }
    if (pain >= 7) {
      reasons.push("you're experiencing more discomfort today");
    }

    const yellowEffects = sideEffects.filter(e => YELLOW_FLAG_SIDE_EFFECTS.includes(e));
    if (yellowEffects.length > 0) {
      const formatted = yellowEffects.slice(0, 2).map(formatSideEffect).join(" and ");
      reasons.push(`you've reported ${formatted.toLowerCase()}`);
    }

    if (reasons.length === 0) {
      reasons.push("some symptoms need monitoring");
    }

    const reasonText = reasons.join(" and ");
    return `We're keeping things gentle today because ${reasonText}. The goal is to support your body, not push it.`;
  }

  return "Based on how you're feeling today, your body is ready for gentle, steady movement. This helps maintain strength and energy without overloading your system.";
}

function generateSafetyMessage(status: SafetyStatus): { title: string; body: string } {
  if (status === "RED") {
    return {
      title: "Please pause exercise today.",
      body: "Based on what you've shared, it's best to rest and contact your medical team. Your safety is our priority.",
    };
  }

  if (status === "YELLOW") {
    return {
      title: "Let's take this gently today.",
      body: "Reduce intensity and monitor how you feel. If symptoms continue or you're unsure, check with your clinician.",
    };
  }

  return {
    title: "You're in a good place to move today.",
    body: "Today is about comfortable, steady movement. You don't need to push — just show up for your body.",
  };
}

export function evaluateTodayState(input: CheckinInput): TodayStateOutput {
  const { energy, pain, confidence, sideEffects, redFlags } = input;

  const readinessScore = computeReadinessScore(energy, confidence, pain);

  const hasRedFlags = redFlags.some(flag => RED_FLAG_ITEMS.includes(flag));
  if (hasRedFlags) {
    return {
      safetyStatus: "RED",
      readinessScore,
      intensityModifier: "DOWN2",
      sessionLevel: "VERY_LOW",
      explainWhy: generateExplainWhy("RED", energy, pain, sideEffects, redFlags),
      safetyMessage: generateSafetyMessage("RED"),
    };
  }

  const hasYellowSideEffects = sideEffects.some(e => YELLOW_FLAG_SIDE_EFFECTS.includes(e));
  const isLowEnergy = energy <= 3;
  const isHighPain = pain >= 7;

  if (hasYellowSideEffects || isLowEnergy || isHighPain) {
    const sessionLevel: SessionLevel = isLowEnergy || isHighPain ? "VERY_LOW" : "LOW";
    return {
      safetyStatus: "YELLOW",
      readinessScore,
      intensityModifier: "DOWN1",
      sessionLevel,
      explainWhy: generateExplainWhy("YELLOW", energy, pain, sideEffects, redFlags),
      safetyMessage: generateSafetyMessage("YELLOW"),
    };
  }

  const isHighReadiness = energy >= 7 && pain <= 3 && confidence >= 6;
  return {
    safetyStatus: "GREEN",
    readinessScore,
    intensityModifier: "SAME",
    sessionLevel: isHighReadiness ? "MEDIUM" : "LOW",
    explainWhy: generateExplainWhy("GREEN", energy, pain, sideEffects, redFlags),
    safetyMessage: generateSafetyMessage("GREEN"),
  };
}

export const SIDE_EFFECT_OPTIONS = [
  { value: "nausea", label: "Nausea" },
  { value: "sleep_poor", label: "Poor sleep" },
  { value: "fatigue_general", label: "General fatigue" },
  { value: "appetite_loss", label: "Appetite loss" },
  { value: "dizziness_mild", label: "Mild dizziness" },
  { value: "new_swelling", label: "New swelling" },
  { value: "neuropathy_flare", label: "Neuropathy flare" },
  { value: "unusual_fatigue_spike", label: "Unusual fatigue spike" },
  { value: "persistent_joint_pain", label: "Persistent joint pain" },
];

export const RED_FLAG_OPTIONS = [
  { value: "chest_pain", label: "Chest pain" },
  { value: "fever", label: "Fever" },
  { value: "severe_breathlessness", label: "Severe breathlessness" },
  { value: "fainting", label: "Fainting or near-fainting" },
  { value: "new_sudden_swelling", label: "New sudden swelling" },
  { value: "signs_of_infection", label: "Signs of infection" },
];
