/**
 * Alternate workout generator that provides a simpler workout structure with
 * regular rest periods, inspired by the user-provided example
 */
import { Exercise, WorkoutStep } from './exerciseTypes';
import { getPhaseSpecificExercises } from '../data/phaseExercises';

/**
 * Generates a streamlined workout plan with regular rest periods
 * 
 * @param tier Exercise tier level (1-4)
 * @param treatmentPhase Current treatment phase of the patient
 * @param cancerType Type of cancer for special considerations
 * @returns Array of workout steps with regular rest periods
 */
export function generateStreamlinedWorkout(
  tier: number = 2,
  treatmentPhase: string = 'post-treatment',
  cancerType?: string
): WorkoutStep[] {
  // Validate tier level
  const validTier = Math.min(Math.max(1, tier), 4);
  
  // Get phase-specific exercises
  const phaseExercises = getPhaseSpecificExercises(treatmentPhase);
  
  // Filter exercises based on tier
  let eligibleExercises = phaseExercises.filter(ex => ex.tier.includes(validTier));
  
  // Filter by cancer type if provided
  if (cancerType) {
    const avoidConditions: Record<string, string[]> = {
      'breast': ['breast_surgery', 'lymphedema_risk', 'chest_wall_pain', 'limited_arm_mobility'],
      'melanoma': ['skin_lesions', 'surgical_site_healing', 'sun_sensitivity'],
      'prostate': ['pelvic_floor_weakness', 'urinary_issues', 'hormone_therapy_effects'],
      'colorectal': ['abdominal_surgery_recent', 'ostomy_precautions', 'abdominal_weakness'],
      'lung': ['breathing_difficulty', 'reduced_lung_capacity', 'chest_wall_pain', 'oxygen_dependence'],
      'lymphoma': ['fatigue_severe', 'lymphedema_risk', 'spleen_enlargement', 'reduced_immunity'],
      'leukemia': ['low_platelets', 'immunosuppression', 'anemia', 'bone_pain'],
      'thyroid': ['neck_mobility_issues', 'hormone_imbalance', 'fatigue'],
      'bladder': ['pelvic_floor_weakness', 'frequent_urination', 'incontinence'],
      'ovarian': ['abdominal_surgery_recent', 'abdominal_weakness', 'hormone_therapy_effects'],
      'pancreatic': ['abdominal_pain', 'digestive_issues', 'weight_loss_severe'],
      'brain': ['balance_issues', 'coordination_problems', 'cognitive_changes', 'fatigue'],
      'head_and_neck': ['neck_mobility_issues', 'swallowing_difficulty', 'balance_problems']
    };
    
    const conditions = avoidConditions[cancerType as keyof typeof avoidConditions] || [];
    if (conditions.length > 0) {
      eligibleExercises = eligibleExercises.filter(ex => 
        !ex.avoidFor || !ex.avoidFor.some(condition => conditions.includes(condition))
      );
    }
  }
  
  // Shuffle exercises for variety
  eligibleExercises = eligibleExercises.sort(() => Math.random() - 0.5);
  
  // Limit to a reasonable number of exercises based on tier
  const exerciseCount = Math.min(4 + validTier, eligibleExercises.length);
  eligibleExercises = eligibleExercises.slice(0, exerciseCount);
  
  // Generate workout plan following the example pattern
  const workoutPlan: WorkoutStep[] = [];
  
  // Add warm-up
  workoutPlan.push({
    step: "🔸 Warm-Up",
    detail: `${5 + validTier} minutes of gentle movement to prepare your body`
  });
  
  // Add main exercises with rest periods
  eligibleExercises.forEach((ex, idx) => {
    workoutPlan.push({
      step: `🔸 ${ex.name}`,
      detail: `${ex.sets} sets x ${ex.reps} • Rest ${ex.rest}`
    });
    
    // Add extended rest every 2 exercises (or as appropriate for the tier)
    if ((idx + 1) % 2 === 0 && idx < eligibleExercises.length - 1) {
      workoutPlan.push({
        step: "🔹 Rest",
        detail: tier <= 2 ? "2 min" : "90 sec"
      });
    }
  });
  
  // Add cool-down
  workoutPlan.push({
    step: "🔸 Cool-Down",
    detail: `${3 + validTier} minutes of gentle stretching and deep breathing`
  });
  
  return workoutPlan;
}

/**
 * Alternate workout format that's more concise
 */
export function getCompactWorkoutPlan(
  tier: number = 2,
  treatmentPhase: string = 'post-treatment'
): WorkoutStep[] {
  // Simple structure for patients who prefer less detailed instructions
  const workoutPlan = generateStreamlinedWorkout(tier, treatmentPhase);
  
  // Add a summary at the beginning
  workoutPlan.unshift({
    step: "📋 Workout Summary",
    detail: `Tier ${tier} workout for ${treatmentPhase} phase • ${workoutPlan.length - 1} exercises • Approx. ${15 + (tier * 5)} minutes`
  });
  
  return workoutPlan;
}