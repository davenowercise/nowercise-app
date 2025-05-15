import { generateWorkoutPlan } from './generateWorkoutPlan';
import { WorkoutStep, WorkoutPlanOptions, WorkoutResult } from './exerciseTypes';

/**
 * Parameters for creating a workout from tier info
 */
interface CreateWorkoutParams {
  tier?: number;
  treatmentPhase?: string;
  cancerType?: string;
  flagged?: boolean;
  medicalClearanceRequired?: boolean;
  preferences?: WorkoutPlanOptions;
}

// WorkoutResult type is now imported from exerciseTypes.ts

/**
 * Builds a tailored workout for a client based on onboarding tier and status
 * @param tier - The user's tier (1–4)
 * @param treatmentPhase - Current treatment stage for intensity context
 * @param cancerType - Type of cancer for specific adaptations
 * @param flagged - If a safety flag was raised
 * @param medicalClearanceRequired - If medical clearance is required
 * @param preferences - Additional workout preferences
 * @returns Formatted workout plan or warning if medical clearance needed
 */
export function createWorkoutFromTier({
  tier = 2,
  treatmentPhase = "Post-Treatment",
  cancerType,
  flagged = false,
  medicalClearanceRequired = false,
  preferences = {}
}: CreateWorkoutParams): WorkoutResult {
  // If flagged or medical clearance needed, return warning
  if (flagged || medicalClearanceRequired) {
    return {
      tier,
      treatmentPhase,
      date: new Date().toLocaleDateString(),
      sessionTitle: `Your Tier ${tier} Nowercise Plan`,
      warning: "⚠️ Medical clearance needed before exercise plan can be shown.",
      cancerType
    };
  }

  // Set intensity modifier based on treatment phase
  let intensityModifier = 1.0;
  
  switch (treatmentPhase) {
    case "Pre-Treatment":
      intensityModifier = 1.0;
      break;
    case "During-Treatment":
      intensityModifier = 0.8;
      break;
    case "Post-Surgery":
      intensityModifier = 0.7;
      break;
    case "Post-Treatment":
      intensityModifier = 0.9;
      break;
    case "Long-Term Survivor":
      intensityModifier = 1.0;
      break;
    default:
      intensityModifier = 0.9;
  }
  
  // Apply treatment phase intensity modifiers
  let adjustedTier = tier;
  
  if (intensityModifier < 0.8 && tier > 1) {
    // Reduce tier level for more conservative exercise
    adjustedTier = tier - 1;
  }

  // Map treatment phase from UI to data format
  const mappedTreatmentPhase = treatmentPhase
    .toLowerCase()
    .replace(/ /g, '-'); // replace all spaces with hyphens
    
  // Merge preferences with cancer type and treatment phase
  const workoutPreferences = {
    ...preferences,
    cancerType: cancerType || undefined,
    treatmentPhase: mappedTreatmentPhase
  };

  // Generate workout plan based on tier and preferences
  const workoutPlan = generateWorkoutPlan(adjustedTier, workoutPreferences);

  // Format output
  return {
    tier: adjustedTier,
    treatmentPhase,
    date: new Date().toLocaleDateString(),
    sessionTitle: `Your Tier ${adjustedTier} Nowercise Plan`,
    exercises: workoutPlan,
    cancerType
  };
}

/**
 * Creates a sample workout for demonstration purposes
 * @returns Sample workout with default values
 */
export function createSampleWorkout(): WorkoutResult {
  return createWorkoutFromTier({
    tier: 2,
    treatmentPhase: "Post-Treatment",
    cancerType: "breast",
    flagged: false,
    preferences: {
      equipment: ["resistance-bands", "chair"],
      duration: "medium"
    }
  });
}