/**
 * generateWorkoutPlan.ts
 * Creates structured workouts based on tier, goals, equipment, and preferences
 */

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  type: 'resistance' | 'aerobic' | 'breathing' | 'mobility' | 'balance';
  tier: number[];
  equipment?: string[];
  bodyPart?: string[];
  cancerSpecific?: string[];
}

export interface WorkoutStep {
  step: string;
  detail: string;
}

export interface WorkoutPlanOptions {
  equipment?: string[];
  bodyParts?: string[];
  duration?: 'short' | 'medium' | 'long';
  focusOn?: string[];
  avoidMovements?: string[];
  cancerType?: string;
}

// Exercise library
const EXERCISES: Exercise[] = [
  {
    name: "Handle Band Bicep Curl",
    sets: 3,
    reps: "8–12",
    rest: "90 sec",
    type: "resistance",
    tier: [1, 2, 3],
    bodyPart: ["arms", "upper body"],
    equipment: ["resistance bands"]
  },
  {
    name: "Seated Chest Press Bands",
    sets: 2,
    reps: "8–12",
    rest: "90 sec",
    type: "resistance",
    tier: [1, 2],
    bodyPart: ["chest", "upper body"],
    equipment: ["resistance bands", "chair"]
  },
  {
    name: "Dumbbell Front Squat",
    sets: 3,
    reps: "8–10",
    rest: "90 sec",
    type: "resistance",
    tier: [3, 4],
    bodyPart: ["legs", "lower body"],
    equipment: ["dumbbells"]
  },
  {
    name: "Seated Leg Extension",
    sets: 2,
    reps: "15",
    rest: "90 sec",
    type: "resistance",
    tier: [1, 2, 3],
    bodyPart: ["legs", "lower body"],
    equipment: ["chair"]
  },
  {
    name: "BW marching on the spot",
    sets: 2,
    reps: "45 sec",
    rest: "90 sec",
    type: "aerobic",
    tier: [1, 2],
    bodyPart: ["legs", "full body"],
    equipment: []
  },
  {
    name: "4-4 Box Breathing",
    sets: 3,
    reps: "do slowly",
    rest: "none",
    type: "breathing",
    tier: [1, 2, 3, 4],
    bodyPart: ["core", "lungs"],
    equipment: []
  },
  {
    name: "Seated Shoulder Mobility",
    sets: 2,
    reps: "8-10 each side",
    rest: "60 sec",
    type: "mobility",
    tier: [1, 2, 3, 4],
    bodyPart: ["shoulders", "upper body"],
    equipment: ["chair"],
    cancerSpecific: ["breast"]
  },
  {
    name: "Wall Push-up",
    sets: 2,
    reps: "8-12",
    rest: "90 sec",
    type: "resistance",
    tier: [1, 2],
    bodyPart: ["chest", "arms"],
    equipment: []
  },
  {
    name: "Seated Gentle Twist",
    sets: 2,
    reps: "8-10 each side",
    rest: "60 sec",
    type: "mobility",
    tier: [1, 2],
    bodyPart: ["core", "spine"],
    equipment: ["chair"],
    cancerSpecific: ["colorectal"]
  },
  {
    name: "Supported Bridge",
    sets: 2,
    reps: "hold 5-10 sec x 5",
    rest: "90 sec",
    type: "resistance",
    tier: [1, 2, 3],
    bodyPart: ["core", "glutes"],
    equipment: []
  }
];

/**
 * Generates a personalized workout plan based on tier level and preferences
 * 
 * @param tier The user's exercise tier (1-4)
 * @param preferences Optional preferences to customize the workout
 * @returns Array of workout steps with instructions
 */
export function generateWorkoutPlan(tier = 2, preferences: WorkoutPlanOptions = {}): WorkoutStep[] {
  // Filter exercises based on tier
  let eligibleExercises = EXERCISES.filter(ex => ex.tier.includes(tier));
  
  // Apply additional filters based on preferences
  if (preferences.equipment && preferences.equipment.length > 0) {
    eligibleExercises = eligibleExercises.filter(ex => 
      !ex.equipment || ex.equipment.length === 0 || 
      ex.equipment.some(equip => preferences.equipment?.includes(equip))
    );
  }
  
  if (preferences.bodyParts && preferences.bodyParts.length > 0) {
    eligibleExercises = eligibleExercises.filter(ex => 
      ex.bodyPart && ex.bodyPart.some(part => preferences.bodyParts?.includes(part))
    );
  }
  
  // Filter for cancer-specific exercises if applicable
  if (preferences.cancerType) {
    // Prioritize cancer-specific exercises but don't exclude others
    eligibleExercises.sort((a, b) => {
      const aHasSpecific = a.cancerSpecific?.includes(preferences.cancerType || '') ? 1 : 0;
      const bHasSpecific = b.cancerSpecific?.includes(preferences.cancerType || '') ? 1 : 0;
      return bHasSpecific - aHasSpecific; // Sort cancer-specific first
    });
  }
  
  // Determine workout length based on tier and preferences
  let exerciseCount = 4; // Default
  
  if (preferences.duration === 'short') {
    exerciseCount = Math.max(3, tier); // Minimum 3 exercises
  } else if (preferences.duration === 'long') {
    exerciseCount = Math.min(8, tier + 4); // Maximum 8 exercises
  } else {
    // Medium (default)
    exerciseCount = tier + 3; // Tier 1 = 4 exercises, Tier 4 = 7 exercises
  }
  
  // Limit to number of available exercises
  exerciseCount = Math.min(exerciseCount, eligibleExercises.length);
  
  // Select exercises for the workout
  const selectedExercises = eligibleExercises.slice(0, exerciseCount);
  
  // Generate the workout plan
  const workoutPlan: WorkoutStep[] = [];
  
  // Add warm-up
  workoutPlan.push({
    step: "🔸 Warm-up",
    detail: "5 minutes of gentle movement to prepare your body"
  });
  
  // Add main exercises
  selectedExercises.forEach((ex, idx) => {
    workoutPlan.push({
      step: `🔸 ${ex.name}`,
      detail: `${ex.sets} sets x ${ex.reps} • Rest ${ex.rest}`
    });
    
    // Add extended rest every 2–3 exercises
    if ((idx + 1) % 2 === 0 && idx < selectedExercises.length - 1) {
      workoutPlan.push({
        step: "🔹 Rest & Hydrate",
        detail: "2 min"
      });
    }
  });
  
  // Add cool-down
  workoutPlan.push({
    step: "🔸 Cool-down",
    detail: "5 minutes of gentle stretching and breathing"
  });
  
  return workoutPlan;
}

// Additional utility function to generate a weekly plan based on tier
export function generateWeeklyPlan(tier = 2): { 
  daysPerWeek: number; 
  workouts: { day: string; focus: string; duration: number }[] 
} {
  // Tier determines frequency and intensity
  const daysPerWeek = Math.min(tier + 2, 6); // Tier 1 = 3 days, Tier 4 = 6 days
  
  const focusAreas = [
    "Full Body Gentle",
    "Upper Body Focus",
    "Lower Body Focus",
    "Core & Balance",
    "Cardio & Mobility",
    "Active Recovery"
  ];
  
  const weekdays = ["Monday", "Wednesday", "Friday", "Tuesday", "Thursday", "Saturday"];
  
  // Generate workouts for the week
  const workouts = Array.from({ length: daysPerWeek }, (_, i) => ({
    day: weekdays[i],
    focus: focusAreas[i % focusAreas.length],
    duration: tier === 1 ? 20 : tier === 2 ? 25 : tier === 3 ? 30 : 40 // Minutes
  }));
  
  return {
    daysPerWeek,
    workouts
  };
}