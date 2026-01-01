/**
 * Symptom → Exercise Type Focus Mapping
 * 
 * This module maps patient symptoms to recommended exercise type focus flags.
 * Based on ACSM-ACS evidence for cancer survivors:
 * - Fatigue → Aerobic (evidence for fatigue reduction)
 * - Pain/QoL limits → Resistance (functional capacity, ADL improvement)
 * - Anxiety → Mind-Body (calming, stress reduction)
 * - Low Mood → Multi-Component (combining approaches for mood)
 */

export type SignalLevel = "green" | "amber" | "red";
export type ExerciseFocus = "aerobic" | "resistance" | "mind_body" | "multi_component";

export interface SymptomState {
  fatigue?: SignalLevel | number;
  pain?: SignalLevel | number;
  anxiety?: SignalLevel | number;
  low_mood?: SignalLevel | number;
  QoL_limits?: SignalLevel | number;
  treatment?: SignalLevel | number;
}

export interface FocusResult {
  focus: ExerciseFocus[];
  primaryFocus: ExerciseFocus;
  explanations: string[];
  suggestions: ExerciseSuggestion[];
}

export interface ExerciseSuggestion {
  type: ExerciseFocus;
  title: string;
  description: string;
  duration: string;
  gentleNote: string;
}

/**
 * Convert signal level to numeric severity (0-3)
 */
function toSeverity(val: SignalLevel | number | undefined): number {
  if (val === undefined) return 0;
  if (typeof val === "number") return Math.min(3, Math.max(0, val));
  const mapping: Record<SignalLevel, number> = { green: 1, amber: 2, red: 3 };
  return mapping[val] || 0;
}

/**
 * Choose exercise focus flags based on symptom severity
 * Returns focus areas that are evidence-supported for the user's symptoms
 */
export function chooseExerciseFocus(symptoms: SymptomState): ExerciseFocus[] {
  const focus = new Set<ExerciseFocus>();

  // Fatigue → Aerobic (ACSM evidence: aerobic exercise reduces cancer-related fatigue)
  if (toSeverity(symptoms.fatigue) >= 2) {
    focus.add("aerobic");
  }

  // Pain or QoL limits → Resistance (ACSM evidence: resistance training improves function and QoL)
  if (toSeverity(symptoms.pain) >= 2 || toSeverity(symptoms.QoL_limits) >= 2) {
    focus.add("resistance");
  }

  // Anxiety → Mind-Body (ACSM evidence: mind-body exercises help with anxiety)
  if (toSeverity(symptoms.anxiety) >= 2) {
    focus.add("mind_body");
  }

  // Low Mood → Multi-Component (combining exercise types shown to help mood)
  if (toSeverity(symptoms.low_mood) >= 2) {
    focus.add("multi_component");
  }

  // Default fallback: balanced approach if nothing stands out
  if (focus.size === 0) {
    focus.add("aerobic");
    focus.add("resistance");
  }

  return Array.from(focus);
}

/**
 * Get the primary (most important) focus based on symptom severity
 */
function getPrimaryFocus(symptoms: SymptomState): ExerciseFocus {
  const severities = [
    { symptom: "fatigue", focus: "aerobic" as ExerciseFocus, severity: toSeverity(symptoms.fatigue) },
    { symptom: "pain", focus: "resistance" as ExerciseFocus, severity: toSeverity(symptoms.pain) },
    { symptom: "QoL_limits", focus: "resistance" as ExerciseFocus, severity: toSeverity(symptoms.QoL_limits) },
    { symptom: "anxiety", focus: "mind_body" as ExerciseFocus, severity: toSeverity(symptoms.anxiety) },
    { symptom: "low_mood", focus: "multi_component" as ExerciseFocus, severity: toSeverity(symptoms.low_mood) },
  ];

  // Find the highest severity
  severities.sort((a, b) => b.severity - a.severity);
  
  if (severities[0].severity >= 2) {
    return severities[0].focus;
  }
  
  return "aerobic"; // Default
}

/**
 * Generate gentle, evidence-based explanations for why certain exercise types are suggested
 */
export function getExerciseFocusExplanations(focus: ExerciseFocus[]): string[] {
  const explanations: string[] = [];

  if (focus.includes("aerobic")) {
    explanations.push(
      "We've leaned a little more towards short walking and other aerobic sessions this week, because that type of movement has good evidence for helping with fatigue after cancer treatment."
    );
  }

  if (focus.includes("resistance")) {
    explanations.push(
      "You'll see some gentle strength sessions in your plan – resistance exercises are helpful for supporting everyday tasks and improving quality of life."
    );
  }

  if (focus.includes("mind_body")) {
    explanations.push(
      "We've included at least one short calm-movement or breathing session – mind-body exercises can be especially helpful when anxiety or worry is loud."
    );
  }

  if (focus.includes("multi_component")) {
    explanations.push(
      "Your plan mixes a little walking, a little strength, and a small calming block – combining different types of movement can work well over time for lifting low mood."
    );
  }

  return explanations;
}

/**
 * Get exercise suggestions based on symptom state
 * Returns gentle, context-aware suggestions with permission to modify or rest
 */
export function getSymptomBasedSuggestions(symptoms: SymptomState): ExerciseSuggestion[] {
  const suggestions: ExerciseSuggestion[] = [];
  const fatigueSeverity = toSeverity(symptoms.fatigue);
  const painSeverity = toSeverity(symptoms.pain);
  const anxietySeverity = toSeverity(symptoms.anxiety);
  const moodSeverity = toSeverity(symptoms.low_mood);
  const qolSeverity = toSeverity(symptoms.QoL_limits);

  // Fatigue is high - suggest short aerobic
  if (fatigueSeverity >= 3) {
    suggestions.push({
      type: "aerobic",
      title: "Ultra-Short Walk",
      description: "If anything at all feels possible, a 3-minute easy walk is a good first step – simple aerobic movement can help with fatigue over time.",
      duration: "3 min",
      gentleNote: "If not, full rest is absolutely okay. Rest is part of recovery."
    });
  } else if (fatigueSeverity >= 2) {
    suggestions.push({
      type: "aerobic",
      title: "Gentle Walking",
      description: "A short, easy-paced walk can be helpful when energy is low. There's good evidence that gentle aerobic movement helps with fatigue.",
      duration: "5-10 min",
      gentleNote: "Go at your own pace. Stopping early is always fine."
    });
  }

  // Pain or QoL limits are elevated - suggest gentle resistance
  if (painSeverity >= 2 || qolSeverity >= 2) {
    if (painSeverity >= 3) {
      suggestions.push({
        type: "resistance",
        title: "Very Gentle Strength",
        description: "If your medical team is happy for you to move, very gentle strength exercises can support joints and everyday tasks.",
        duration: "5-8 min",
        gentleNote: "Go slowly, and it's always okay to do less or stop. Listen to your body first."
      });
    } else {
      suggestions.push({
        type: "resistance",
        title: "Light Strength Session",
        description: "Gentle resistance work can help with everyday tasks and quality of life. We've kept it light and manageable.",
        duration: "10-15 min",
        gentleNote: "Skip any exercise that doesn't feel right. Your comfort comes first."
      });
    }
  }

  // Anxiety is elevated - suggest mind-body
  if (anxietySeverity >= 2) {
    suggestions.push({
      type: "mind_body",
      title: "Calm Movement & Breathing",
      description: "Anxiety is present today. A short calm-movement session with breathing can be helpful for easing worry and tension.",
      duration: "5-10 min",
      gentleNote: "These practices are always optional. Find what feels calming for you."
    });
  }

  // Low mood - suggest multi-component
  if (moodSeverity >= 2) {
    suggestions.push({
      type: "multi_component",
      title: "Mini Mixed Session",
      description: "Mood is low today. A tiny mixed session – a little walk, a little strength, and a little calm – can be a helpful way to nudge mood over time.",
      duration: "10-12 min total",
      gentleNote: "At your own pace. Small mixed sessions like this can help, but rest is equally valid."
    });
  }

  // If no specific symptoms, provide a general balanced suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      type: "aerobic",
      title: "Balanced Movement",
      description: "Today looks like a good day for some gentle movement. A mix of walking and light activity can support overall wellbeing.",
      duration: "15-20 min",
      gentleNote: "Adjust as needed. Every bit of movement counts."
    });
  }

  return suggestions;
}

/**
 * Get complete focus result with all information
 */
export function getExerciseFocusResult(symptoms: SymptomState): FocusResult {
  const focus = chooseExerciseFocus(symptoms);
  const primaryFocus = getPrimaryFocus(symptoms);
  const explanations = getExerciseFocusExplanations(focus);
  const suggestions = getSymptomBasedSuggestions(symptoms);

  return {
    focus,
    primaryFocus,
    explanations,
    suggestions
  };
}

/**
 * Confidence-to-Move supportive messages
 * Evidence-based, non-pressuring messages about exercise benefits
 */
export const confidenceMessages = [
  "Each small bit of movement you do – even 3 minutes – connects you with the same kind of exercise that's been shown to help many people with fatigue, mood and everyday function after cancer.",
  "It's not about big workouts. Thoughtful walking, strength work and calm-movement sessions can all play a role in easing fatigue, pain, anxiety and low mood. We're here to help you find what feels possible today.",
  "Research shows that gentle, consistent movement – even very short sessions – can make a real difference over time. You're already taking steps in the right direction.",
  "Every small session is worthwhile. The evidence tells us that regular, gentle movement supports energy levels, mood, and quality of life for cancer survivors.",
  "Moving at your own pace, in your own time, is exactly what the research supports. There's no pressure to do more than feels right today.",
  "Small movements add up. Studies show that even brief, light activity can help with fatigue and wellbeing during and after cancer treatment.",
  "Your body knows what it needs. Gentle walking, light strength work, or calm breathing – all have evidence for helping cancer survivors feel better over time."
];

/**
 * Get a random confidence message
 */
export function getConfidenceMessage(): string {
  return confidenceMessages[Math.floor(Math.random() * confidenceMessages.length)];
}
