// Import exercise data
import exerciseData from '../data/exercises.json';

/**
 * Type definition for a workout step
 */
export interface WorkoutStep {
  step: string;
  detail: string;
}

/**
 * Workout plan preference options
 */
export interface WorkoutPlanOptions {
  equipment?: string[];
  duration?: string;
  focusAreas?: string[];
  cancerType?: string;
}

/**
 * Exercise data type
 */
interface Exercise {
  name: string;
  type: string;
  equipment: string[];
  location: string[];
  tier: number[];
  sets: number;
  reps: string;
  rest: string;
  tags: string[];
  video: string | null;
  avoidFor?: string[];
  focus?: string[]; // Added for compatibility with existing code
}

/**
 * Library of tier-appropriate exercises
 */
const tierExercises = {
  // Very gentle, mostly seated exercises
  1: [
    { name: "Seated marching", focus: ["legs", "cardio"], equipment: ["chair"] },
    { name: "Chair supported leg lifts", focus: ["legs"], equipment: ["chair"] },
    { name: "Seated arm circles", focus: ["arms", "shoulders"], equipment: ["chair"] },
    { name: "Seated side bends", focus: ["core"], equipment: ["chair"] },
    { name: "Chair-supported calf raises", focus: ["legs"], equipment: ["chair"] },
    { name: "Gentle neck stretches", focus: ["mobility"], equipment: ["none"] },
    { name: "Seated forward bend", focus: ["mobility"], equipment: ["chair"] },
    { name: "Seated chest stretch", focus: ["mobility", "chest"], equipment: ["chair"] },
    { name: "Wall push-ups", focus: ["arms", "chest"], equipment: ["none"] },
    { name: "Seated knee extensions", focus: ["legs"], equipment: ["chair"] },
    { name: "Seated band pulls", focus: ["arms", "back"], equipment: ["resistance-bands", "chair"] },
    { name: "Band chest press", focus: ["chest", "arms"], equipment: ["resistance-bands", "chair"] }
  ],
  
  // More dynamic but still moderate intensity
  2: [
    { name: "Wall squats", focus: ["legs"], equipment: ["none"] },
    { name: "Standing calf raises", focus: ["legs"], equipment: ["none"] },
    { name: "Step touches", focus: ["legs", "cardio"], equipment: ["none"] },
    { name: "Modified lunges", focus: ["legs"], equipment: ["chair"] },
    { name: "Standing rows with band", focus: ["back", "arms"], equipment: ["resistance-bands"] },
    { name: "Lateral raises with band", focus: ["shoulders"], equipment: ["resistance-bands"] },
    { name: "Core rotations", focus: ["core"], equipment: ["none"] },
    { name: "Modified planks", focus: ["core"], equipment: ["chair"] },
    { name: "Supported bridge", focus: ["core", "legs"], equipment: ["yoga-mat"] },
    { name: "Light dumbbell curls", focus: ["arms"], equipment: ["dumbbells"] },
    { name: "Assisted/modified push-ups", focus: ["chest", "arms"], equipment: ["none"] },
    { name: "Standing or seated band pull-aparts", focus: ["back", "shoulders"], equipment: ["resistance-bands"] },
    { name: "Light medicine ball lifts", focus: ["core", "arms"], equipment: ["medicine-ball"] }
  ],
  
  // More challenging with some moderate intensity
  3: [
    { name: "Bodyweight squats", focus: ["legs"], equipment: ["none"] },
    { name: "Lunges", focus: ["legs"], equipment: ["none"] },
    { name: "Glute bridges", focus: ["core", "legs"], equipment: ["yoga-mat"] },
    { name: "Bird-dog", focus: ["core", "back"], equipment: ["yoga-mat"] },
    { name: "Plank holds", focus: ["core"], equipment: ["yoga-mat"] },
    { name: "Dumbbell rows", focus: ["back", "arms"], equipment: ["dumbbells"] },
    { name: "Push-ups (standard or modified)", focus: ["chest", "arms"], equipment: ["none"] },
    { name: "Dumbbell shoulder press", focus: ["shoulders", "arms"], equipment: ["dumbbells"] },
    { name: "Standing bicycle crunches", focus: ["core"], equipment: ["none"] },
    { name: "Step-ups", focus: ["legs", "cardio"], equipment: ["chair"] },
    { name: "Side planks", focus: ["core"], equipment: ["yoga-mat"] },
    { name: "Band pull-throughs", focus: ["legs", "core"], equipment: ["resistance-bands"] },
    { name: "Medicine ball rotations", focus: ["core"], equipment: ["medicine-ball"] }
  ],
  
  // Higher intensity for those with good physical condition
  4: [
    { name: "Walking lunges", focus: ["legs"], equipment: ["none"] },
    { name: "Squat to overhead press", focus: ["full-body"], equipment: ["dumbbells"] },
    { name: "Push-up variations", focus: ["chest", "arms", "core"], equipment: ["none"] },
    { name: "Dumbbell rows", focus: ["back", "arms"], equipment: ["dumbbells"] },
    { name: "Mountain climbers", focus: ["cardio", "core"], equipment: ["none"] },
    { name: "Plank to push-up", focus: ["core", "arms", "chest"], equipment: ["none"] },
    { name: "Side plank with rotation", focus: ["core"], equipment: ["none"] },
    { name: "Split squats", focus: ["legs"], equipment: ["none"] },
    { name: "Reverse flys", focus: ["back", "shoulders"], equipment: ["resistance-bands", "dumbbells"] },
    { name: "Kettlebell or dumbbell swings", focus: ["full-body"], equipment: ["dumbbells"] },
    { name: "High knees", focus: ["cardio", "core"], equipment: ["none"] },
    { name: "Band wood chops", focus: ["core"], equipment: ["resistance-bands"] },
    { name: "Medicine ball slams", focus: ["full-body"], equipment: ["medicine-ball"] }
  ]
};

/**
 * Cancer-specific exercise modifications
 */
const cancerModifications = {
  "breast": {
    avoid: ["heavy chest exercises after surgery", "excessive upper body strain"],
    modify: ["upper body exercises with reduced range", "arm exercises with lighter weights"],
    focus: ["gradual shoulder mobility", "gentle lymphatic movement"]
  },
  "prostate": {
    avoid: ["heavy lifting immediately post-surgery", "high-impact activity after radiation"],
    modify: ["exercises with pelvic floor awareness", "squats with proper form"],
    focus: ["pelvic floor strength", "lower body mobility"]
  },
  "colorectal": {
    avoid: ["excessive abdominal pressure", "heavy lifting with ostomy"],
    modify: ["core exercises with ostomy considerations", "gentler abdominal work"],
    focus: ["gradual core rebuilding", "lower body strength"]
  },
  "lung": {
    avoid: ["high intensity without oxygen monitoring", "breath holding"],
    modify: ["cardio with breathing focus", "shorter exercise intervals"],
    focus: ["breathing coordination", "gradual stamina building"]
  },
  "melanoma": {
    avoid: ["excessive sun exposure during outdoor exercise"],
    modify: ["exercises that don't strain healing incision sites"],
    focus: ["full-body movement", "normal exercise with sun protection"]
  },
  "lymphoma": {
    avoid: ["overexertion during active treatment", "excessive heat exposure"],
    modify: ["exercise intensity based on energy levels", "reduced impact"],
    focus: ["gentle movement", "building back endurance gradually"]
  },
  "leukemia": {
    avoid: ["activities with bleeding/bruising risk during low platelets", "infection exposure"],
    modify: ["intensity based on blood counts", "shorter sessions during treatment"],
    focus: ["gentle rebuilding", "maintaining mobility"]
  }
};

/**
 * Get a warm-up routine based on tier level
 */
function getWarmUp(tier: number): WorkoutStep {
  const warmUps = [
    "Start with 5 minutes of gentle seated movements. Rotate your shoulders, ankles, and wrists. March your feet slowly while seated. Take deep breaths.",
    "Begin with 5-7 minutes of gentle movement. March in place, do arm circles, shoulder rolls, and gentle side bends. Focus on smooth movements and breathing.",
    "Warm up for 8-10 minutes with marching or light stepping, arm swings, trunk rotations, and dynamic stretches. Gradually increase your range of motion.",
    "Complete a 10-minute dynamic warm-up including light cardio (marching, step-touches), arm circles, trunk rotations, leg swings, and gentle mobility exercises for all major joints."
  ];
  
  return {
    step: "Warm-Up",
    detail: warmUps[tier - 1]
  };
}

/**
 * Get a cool-down routine based on tier level
 */
function getCoolDown(tier: number): WorkoutStep {
  const coolDowns = [
    "Finish with 5 minutes of gentle seated stretches. Hold each stretch for 15-20 seconds while breathing deeply. Focus on your neck, shoulders, back, and legs.",
    "Complete with 5-7 minutes of stretching. Gently stretch your major muscle groups, holding each stretch for 20-30 seconds while breathing deeply.",
    "End with 7-10 minutes of stretching and deep breathing. Hold stretches for 30 seconds each, focusing on the muscle groups you worked today.",
    "Finish with a 10-minute cool-down including full-body stretching (30-45 seconds per stretch) and deep breathing exercises to help your body recover."
  ];
  
  return {
    step: "Cool-Down",
    detail: coolDowns[tier - 1]
  };
}

/**
 * Generate cancer-specific safety notes
 */
function getCancerSpecificNotes(cancerType?: string): string | null {
  if (!cancerType || !cancerModifications[cancerType as keyof typeof cancerModifications]) {
    return null;
  }
  
  const mods = cancerModifications[cancerType as keyof typeof cancerModifications];
  
  return `For ${cancerType} cancer: Focus on ${mods.focus.join(", ")}. 
          Modify ${mods.modify.join(", ")}. 
          Avoid ${mods.avoid.join(", ")}.`;
}

/**
 * Get appropriate exercise duration and intensity based on tier
 */
function getExerciseDuration(tier: number, durationPref?: string): {sets: number, reps: string, rest: string} {
  // Default durations by tier
  const tierDurations = [
    { sets: 1, reps: "8-10 repetitions", rest: "90 seconds" },
    { sets: 1, reps: "10-12 repetitions", rest: "60-90 seconds" },
    { sets: 2, reps: "10-15 repetitions", rest: "45-60 seconds" },
    { sets: 2, reps: "12-15 repetitions", rest: "30-45 seconds" }
  ];
  
  // Adjust for duration preference
  let duration = tierDurations[tier - 1];
  
  if (durationPref === "short") {
    duration.sets = Math.max(1, duration.sets - 1);
    duration.rest = (parseInt(duration.rest) + 15) + " seconds";
  } else if (durationPref === "long") {
    duration.sets += 1;
  }
  
  return duration;
}

/**
 * Filter exercises based on available equipment
 */
function filterByEquipment(exercises: any[], availableEquipment: string[]): any[] {
  // If "none" is in the list, prioritize bodyweight exercises
  if (availableEquipment.includes("none")) {
    return exercises.filter(ex => 
      ex.equipment.includes("none") || 
      ex.equipment.some((eq: string) => availableEquipment.includes(eq))
    );
  }
  
  // Otherwise, filter for exercises that use available equipment
  return exercises.filter(ex => 
    ex.equipment.some((eq: string) => availableEquipment.includes(eq))
  );
}

// Import exercise data
import exerciseData from '../data/exercises.json';

// Exercise data type
interface Exercise {
  name: string;
  type: string;
  equipment: string[];
  location: string[];
  tier: number[];
  sets: number;
  reps: string;
  rest: string;
  tags: string[];
  video: string | null;
  avoidFor?: string[];
}

/**
 * Generates a workout plan based on tier level and client preferences
 * 
 * @param tier - Exercise tier level (1-4)
 * @param options - Optional preferences for customization
 * @returns Array of workout steps
 */
export function generateWorkoutPlan(
  tier: number = 2,
  options: WorkoutPlanOptions = {}
): WorkoutStep[] {
  // Validate tier level
  const validTier = Math.min(Math.max(1, tier), 4);
  
  try {
    // Type assertion for the imported JSON data
    const exercises = exerciseData as Exercise[];
    
    // Filter exercises by tier
    let eligibleExercises = exercises.filter(ex => ex.tier.includes(validTier));
    
    // Filter by equipment if provided
    if (options.equipment && options.equipment.length > 0) {
      eligibleExercises = eligibleExercises.filter(ex => 
        ex.equipment.some(equip => {
          // Map equipment names to match our format
          const mappedEquip = equip === 'band' ? 'resistance-bands' : 
                             equip === 'bodyweight' ? 'none' : equip;
          return options.equipment?.includes(mappedEquip);
        })
      );
    }
    
    // Filter out exercises that should be avoided for the specific cancer type
    if (options.cancerType) {
      const avoidConditions: Record<string, string[]> = {
        'breast': ['breast_surgery', 'lymphedema_risk'],
        'melanoma': ['skin_lesions'],
        'prostate': ['pelvic_floor_weakness']
      };
      
      const currentConditions = avoidConditions[options.cancerType as keyof typeof avoidConditions] || [];
      
      if (currentConditions.length > 0) {
        eligibleExercises = eligibleExercises.filter(ex => 
          !ex.avoidFor || !ex.avoidFor.some(condition => currentConditions.includes(condition))
        );
      }
    }
    
    // Ensure we have enough exercises
    if (eligibleExercises.length < 5) {
      console.log('Not enough exercises with current filters, falling back to tier only');
      eligibleExercises = exercises.filter(ex => ex.tier.includes(validTier));
    }
    
    // Shuffle exercises for variety
    eligibleExercises = eligibleExercises.sort(() => Math.random() - 0.5);
    
    // Select exercises for the workout (vary by tier and duration)
    let exerciseCount = 4 + validTier;
    if (options.duration === "short") exerciseCount = Math.max(4, exerciseCount - 1);
    if (options.duration === "long") exerciseCount = exerciseCount + 2;
    
    // Ensure we have a balanced workout with different types of exercises
    const workoutExercises: Exercise[] = [];
    
    // Always include at least one mobility/breathing exercise
    const mobilityExercises = eligibleExercises.filter(ex => 
      ex.type === 'mobility' || ex.type === 'breathing'
    ).slice(0, 1);
    
    // Get resistance exercises
    const resistanceExercises = eligibleExercises.filter(ex => 
      ex.type === 'resistance'
    ).slice(0, Math.ceil(exerciseCount * 0.6));
    
    // Get aerobic exercises
    const aerobicExercises = eligibleExercises.filter(ex => 
      ex.type === 'aerobic'
    ).slice(0, Math.floor(exerciseCount * 0.3));
    
    // Combine and ensure we have the right count
    workoutExercises.push(...mobilityExercises, ...resistanceExercises, ...aerobicExercises);
    
    // If we still don't have enough, add more from any category
    if (workoutExercises.length < exerciseCount) {
      // Filter out exercises we've already included
      const remainingExercises = eligibleExercises.filter(ex => 
        !workoutExercises.some(selected => selected.name === ex.name)
      );
      
      // Add enough to reach our target count
      workoutExercises.push(
        ...remainingExercises.slice(0, exerciseCount - workoutExercises.length)
      );
    }
    
    // Shuffle final selection for better flow
    const finalExercises = workoutExercises.sort(() => Math.random() - 0.5);
    
    // Create the workout plan
    const workoutPlan: WorkoutStep[] = [];
    
    // Start with warm-up
    workoutPlan.push(getWarmUp(validTier));
    
    // Add main exercises
    finalExercises.forEach((exercise, index) => {
      const detail = `${exercise.name}: Perform ${exercise.sets} ${exercise.sets > 1 ? 'sets' : 'set'} of ${exercise.reps}. Rest for ${exercise.rest} between sets.`;
      
      workoutPlan.push({
        step: `Exercise ${index + 1}`,
        detail
      });
    });
    
    // Add cancer-specific notes if applicable
    if (options.cancerType) {
      const notes = getCancerSpecificNotes(options.cancerType);
      if (notes) {
        workoutPlan.push({
          step: "Special Considerations",
          detail: notes
        });
      }
    }
    
    // End with cool-down
    workoutPlan.push(getCoolDown(validTier));
    
    return workoutPlan;
  } catch (error) {
    console.error("Error generating workout plan:", error);
    
    // Fall back to the original tiered exercises if there's an error
    let exercises = [...tierExercises[validTier as keyof typeof tierExercises]];
    
    // Filter by equipment if provided
    if (options.equipment && options.equipment.length > 0) {
      exercises = filterByEquipment(exercises, options.equipment);
    }
    
    // Shuffle exercises for variety
    exercises = exercises.sort(() => Math.random() - 0.5);
    
    // Select exercises for the workout
    exercises = exercises.slice(0, 4 + validTier);
    
    // Get duration parameters
    const duration = getExerciseDuration(validTier, options.duration);
    
    // Create the workout plan
    const workoutPlan: WorkoutStep[] = [];
    
    // Start with warm-up
    workoutPlan.push(getWarmUp(validTier));
    
    // Add main exercises
    exercises.forEach((exercise, index) => {
      const setInfo = duration.sets > 1 
        ? `${duration.sets} sets of ${duration.reps}` 
        : duration.reps;
        
      const detail = `${exercise.name}: Perform ${setInfo}. Rest for ${duration.rest} between sets.`;
      
      workoutPlan.push({
        step: `Exercise ${index + 1}`,
        detail
      });
    });
    
    // Add cancer-specific notes if applicable
    if (options.cancerType) {
      const notes = getCancerSpecificNotes(options.cancerType);
      if (notes) {
        workoutPlan.push({
          step: "Special Considerations",
          detail: notes
        });
      }
    }
    
    // End with cool-down
    workoutPlan.push(getCoolDown(validTier));
    
    return workoutPlan;
  }
}