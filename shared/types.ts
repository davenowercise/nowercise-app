/**
 * Shared types for Nowercise application
 */

// Exercise template definition
export interface ExerciseTemplate {
  name: string;
  description: string;
  duration: number; // in minutes
  intensity: string;
  type: string;
  suitable_tiers: number[];
}

// Session template definition
export interface SessionTemplate {
  name: string;
  description: string;
  duration: number; // in minutes
  suitable_tiers: number[];
  cancer_types: string[];
  exercises: ExerciseTemplate[];
}

// Weekly exercise plan definition
export interface WeeklyPlanItem {
  day: string;
  activity: string;
}

// Onboarding result type
export interface OnboardingResult {
  tier: number;
  suggestedSessions: string[];
  flags: string[];
  treatmentPhase: string;
  intensityModifier: number;
  safetyFlag: boolean;
  source: string;
}

// PAR-Q+ data structure
export interface ParqData {
  parqAnswers: ("Yes" | "No")[];
  parqRequired: boolean;
}

// Client onboarding data structure
export interface OnboardingData {
  cancerType: string;
  symptoms: string[];
  confidenceScore: number;
  energyScore: number;
  comorbidities?: string[];
  treatmentPhase?: string;
  parqData?: ParqData;
}

// API Response for client onboarding
export interface OnboardingResponse {
  recommendedTier: number;
  preferredModes: string[];
  restrictions: string[];
  notes: string[];
  source: string;
  treatmentPhase?: string;
  intensityModifier?: number;
  safetyFlag?: boolean;
  parqRequired?: boolean;
  medicalClearanceRequired?: boolean;
  suggestedSession: string;
  sessionRecommendations?: {
    suggestedSession: string;
    sessionRecommendations: SessionTemplate[];
  };
  weeklyPlan?: WeeklyPlanItem[];
}

// FITT recommendations
export interface FittRecommendations {
  aerobic: string[];
  resistance: string[];
  flexibility: string[];
}