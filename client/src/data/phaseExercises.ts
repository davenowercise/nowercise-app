/**
 * Treatment phase-specific exercises
 * 
 * This file contains exercise recommendations specific to different cancer treatment phases.
 * These exercises are designed to be safe and effective based on the unique challenges
 * of each treatment phase.
 */
import { Exercise } from '../utils/exerciseTypes';

/**
 * Pre-Treatment phase exercises
 * Focus: Building baseline fitness, preparing the body for treatment
 */
export const pretreatmentExercises: Exercise[] = [
  {
    name: "Gentle Walking",
    type: "cardio",
    equipment: ["none"],
    location: ["home", "outdoors"],
    tier: [1, 2, 3, 4],
    sets: 1,
    reps: "5-20 minutes",
    rest: "as needed",
    tags: ["low-impact", "beginner-friendly", "endurance"],
    video: null,
    treatmentPhase: ["pre-treatment", "all"],
    intensityByPhase: {
      "pre-treatment": "moderate",
      "during-treatment": "light",
      "post-surgery": "very light"
    },
    description: "Walking at a comfortable pace to build baseline cardiovascular fitness"
  },
  {
    name: "Seated Marching",
    type: "cardio",
    equipment: ["chair"],
    location: ["home"],
    tier: [1, 2],
    sets: 2,
    reps: "30-60 seconds",
    rest: "30-60 seconds",
    tags: ["low-impact", "beginner-friendly", "seated"],
    video: null,
    treatmentPhase: ["pre-treatment", "all"],
    description: "Seated in chair, lift knees up and down in marching motion"
  },
  {
    name: "Wall Push-ups",
    type: "strength",
    equipment: ["none"],
    location: ["home"],
    tier: [1, 2, 3],
    sets: 2,
    reps: "8-12",
    rest: "60 seconds",
    tags: ["upper-body", "beginner-friendly"],
    video: null,
    treatmentPhase: ["pre-treatment", "all"],
    description: "Standing push-ups against a wall, great for building upper body strength gently"
  },
  {
    name: "Ankle Pumps",
    type: "mobility",
    equipment: ["none"],
    location: ["home"],
    tier: [1],
    sets: 3,
    reps: "10-15 each direction",
    rest: "30 seconds",
    tags: ["circulation", "seated", "beginner-friendly"],
    video: null,
    treatmentPhase: ["pre-treatment", "all"],
    description: "Seated or lying, point and flex feet to improve circulation"
  },
  {
    name: "Standing Leg Curls",
    type: "strength",
    equipment: ["chair"],
    location: ["home"],
    tier: [1, 2, 3],
    sets: 2,
    reps: "8-12 each leg",
    rest: "30-60 seconds",
    tags: ["lower-body", "balance"],
    video: null,
    treatmentPhase: ["pre-treatment", "all"],
    description: "Standing behind chair for support, bend knee to bring heel toward buttocks"
  }
];

/**
 * During-Treatment phase exercises
 * Focus: Maintaining function, managing side effects, gentle activity
 */
export const duringTreatmentExercises: Exercise[] = [
  {
    name: "Seated Breathing Exercise",
    type: "flexibility",
    equipment: ["chair"],
    location: ["home"],
    tier: [1],
    sets: 3,
    reps: "10 breaths",
    rest: "30 seconds",
    tags: ["breathing", "relaxation", "beginner-friendly"],
    video: null,
    treatmentPhase: ["during-treatment", "all"],
    intensityByPhase: {
      "during-treatment": "light"
    },
    description: "Seated deep breathing with arm raises to improve lung capacity"
  },
  {
    name: "Gentle Standing Stretches",
    type: "flexibility",
    equipment: ["chair"],
    location: ["home"],
    tier: [1, 2],
    sets: 1,
    reps: "hold 15-30 seconds each",
    rest: "as needed",
    tags: ["stretching", "mobility", "beginner-friendly"],
    video: null,
    treatmentPhase: ["during-treatment", "all"],
    description: "Simple standing stretches for major muscle groups, using chair for support as needed"
  },
  {
    name: "Seated Resistance Band Row",
    type: "strength",
    equipment: ["resistance-bands", "chair"],
    location: ["home"],
    tier: [1, 2],
    sets: 2,
    reps: "8-10",
    rest: "60 seconds",
    tags: ["upper-body", "back", "posture"],
    video: null,
    treatmentPhase: ["during-treatment", "all"],
    description: "Seated row exercise using resistance band to maintain back strength"
  },
  {
    name: "Wall Angels",
    type: "mobility",
    equipment: ["none"],
    location: ["home"],
    tier: [1, 2],
    sets: 2,
    reps: "8-10",
    rest: "30-60 seconds",
    tags: ["posture", "shoulder-mobility"],
    video: null,
    treatmentPhase: ["during-treatment", "all"],
    description: "Standing against wall, slide arms up and down in snow angel pattern"
  },
  {
    name: "Seated Alternating Knee Lifts",
    type: "strength",
    equipment: ["chair"],
    location: ["home"],
    tier: [1, 2],
    sets: 2,
    reps: "10-15 each leg",
    rest: "30-60 seconds",
    tags: ["core", "seated", "balance"],
    video: null,
    treatmentPhase: ["during-treatment", "all"],
    description: "Seated in chair, lift and lower knees one at a time to engage core"
  }
];

/**
 * Post-Surgery phase exercises
 * Focus: Gentle recovery, restoring range of motion, reducing stiffness
 */
export const postSurgeryExercises: Exercise[] = [
  {
    name: "Diaphragmatic Breathing",
    type: "flexibility",
    equipment: ["none"],
    location: ["home"],
    tier: [1],
    sets: 3,
    reps: "10 breaths",
    rest: "30 seconds",
    tags: ["breathing", "core", "beginner-friendly"],
    video: null,
    treatmentPhase: ["post-surgery", "all"],
    avoidFor: ["abdominal_surgery_recent"],
    description: "Deep breathing focusing on expanding abdomen rather than chest"
  },
  {
    name: "Ankle Circles",
    type: "mobility",
    equipment: ["none"],
    location: ["home"],
    tier: [1],
    sets: 2,
    reps: "10 circles each direction",
    rest: "15-30 seconds",
    tags: ["circulation", "seated", "beginner-friendly"],
    video: null,
    treatmentPhase: ["post-surgery", "all"],
    description: "Seated or lying, rotate ankles in circles to improve circulation"
  },
  {
    name: "Gentle Shoulder Rolls",
    type: "mobility",
    equipment: ["none"],
    location: ["home"],
    tier: [1],
    sets: 2,
    reps: "10 forward, 10 backward",
    rest: "30 seconds",
    tags: ["shoulder-mobility", "seated", "posture"],
    video: null,
    treatmentPhase: ["post-surgery", "all"],
    avoidFor: ["breast_surgery"],
    description: "Seated or standing, gently roll shoulders forward and backward"
  },
  {
    name: "Wrist Flexion and Extension",
    type: "mobility",
    equipment: ["none"],
    location: ["home"],
    tier: [1],
    sets: 2,
    reps: "10 each direction",
    rest: "15-30 seconds",
    tags: ["wrist-mobility", "seated", "beginner-friendly"],
    video: null,
    treatmentPhase: ["post-surgery", "all"],
    description: "Gently bend wrists forward and backward to improve mobility"
  },
  {
    name: "Gentle Seated Side Bend",
    type: "flexibility",
    equipment: ["chair"],
    location: ["home"],
    tier: [1, 2],
    sets: 2,
    reps: "hold 5-10 seconds each side",
    rest: "30 seconds",
    tags: ["lateral-flexion", "seated", "core"],
    video: null,
    treatmentPhase: ["post-surgery", "all"],
    avoidFor: ["abdominal_surgery_recent"],
    description: "Seated in chair, gently lean to one side, then the other"
  }
];

/**
 * Post-Treatment phase exercises
 * Focus: Rebuilding strength and endurance, regaining function
 */
export const postTreatmentExercises: Exercise[] = [
  {
    name: "Chair Squats",
    type: "strength",
    equipment: ["chair"],
    location: ["home"],
    tier: [2, 3],
    sets: 2,
    reps: "10-15",
    rest: "60 seconds",
    tags: ["lower-body", "functional", "progressive"],
    video: null,
    treatmentPhase: ["post-treatment", "all"],
    intensityByPhase: {
      "post-treatment": "moderate",
      "long-term-survivor": "moderate to challenging"
    },
    description: "Standing up and sitting down from chair to build leg strength"
  },
  {
    name: "Standing Row with Resistance Band",
    type: "strength",
    equipment: ["resistance-bands"],
    location: ["home"],
    tier: [2, 3],
    sets: 2,
    reps: "10-15",
    rest: "60 seconds",
    tags: ["upper-body", "back", "posture"],
    video: null,
    treatmentPhase: ["post-treatment", "all"],
    avoidFor: ["breast_surgery"],
    description: "Standing row exercise with resistance band anchored to doorway"
  },
  {
    name: "Standing Heel Raises",
    type: "strength",
    equipment: ["chair"],
    location: ["home"],
    tier: [2, 3],
    sets: 3,
    reps: "10-15",
    rest: "30-60 seconds",
    tags: ["lower-body", "balance", "ankle-strength"],
    video: null,
    treatmentPhase: ["post-treatment", "all"],
    description: "Stand behind chair for support, raise up onto toes and lower"
  },
  {
    name: "Marching with Knee Lifts",
    type: "cardio",
    equipment: ["none"],
    location: ["home"],
    tier: [2, 3],
    sets: 2,
    reps: "30-60 seconds",
    rest: "30-60 seconds",
    tags: ["cardio", "core", "balance"],
    video: null,
    treatmentPhase: ["post-treatment", "all"],
    description: "March in place lifting knees higher to increase intensity"
  },
  {
    name: "Modified Side Plank",
    type: "strength",
    equipment: ["yoga-mat"],
    location: ["home"],
    tier: [2, 3],
    sets: 2,
    reps: "hold 15-30 seconds each side",
    rest: "30-60 seconds",
    tags: ["core", "lateral-stability"],
    video: null,
    treatmentPhase: ["post-treatment", "all"],
    avoidFor: ["abdominal_surgery_recent"],
    description: "Side plank from knee position to build core strength"
  }
];

/**
 * Long-Term Survivor phase exercises
 * Focus: Maintaining health, progressive challenge, preventing recurrence
 */
export const longTermExercises: Exercise[] = [
  {
    name: "Walking Intervals",
    type: "cardio",
    equipment: ["none"],
    location: ["outdoors", "home"],
    tier: [3, 4],
    sets: 5,
    reps: "2 min fast, 1 min slow",
    rest: "1 minute between sets",
    tags: ["cardio", "interval-training", "endurance"],
    video: null,
    treatmentPhase: ["long-term-survivor", "all"],
    intensityByPhase: {
      "long-term-survivor": "challenging"
    },
    description: "Alternating between brisk and relaxed walking pace"
  },
  {
    name: "Bodyweight Squats",
    type: "strength",
    equipment: ["none"],
    location: ["home"],
    tier: [3, 4],
    sets: 3,
    reps: "12-15",
    rest: "60 seconds",
    tags: ["lower-body", "functional", "progressive"],
    video: null,
    treatmentPhase: ["long-term-survivor", "all"],
    description: "Full bodyweight squats with proper form"
  },
  {
    name: "Push-ups (Modified or Full)",
    type: "strength",
    equipment: ["none"],
    location: ["home"],
    tier: [3, 4],
    sets: 3,
    reps: "8-12",
    rest: "60 seconds",
    tags: ["upper-body", "core", "progressive"],
    video: null,
    treatmentPhase: ["long-term-survivor", "all"],
    avoidFor: ["breast_surgery"],
    description: "Push-ups from knees or toes depending on strength level"
  },
  {
    name: "Standing Bicycle Crunch",
    type: "strength",
    equipment: ["none"],
    location: ["home"],
    tier: [3, 4],
    sets: 2,
    reps: "10-15 each side",
    rest: "30-60 seconds",
    tags: ["core", "rotation", "balance"],
    video: null,
    treatmentPhase: ["long-term-survivor", "all"],
    avoidFor: ["abdominal_surgery_recent"],
    description: "Standing, bring elbow to opposite knee in bicycle motion"
  },
  {
    name: "Dumbbell Rows",
    type: "strength",
    equipment: ["dumbbells", "chair"],
    location: ["home"],
    tier: [3, 4],
    sets: 3,
    reps: "10-12 each arm",
    rest: "60 seconds",
    tags: ["upper-body", "back", "progressive"],
    video: null,
    treatmentPhase: ["long-term-survivor", "all"],
    description: "One-arm dumbbell row leaning on chair for support"
  }
];

/**
 * Get phase-specific exercises based on treatment phase
 * @param phase Treatment phase identifier
 * @returns Array of exercises for that phase
 */
export function getPhaseSpecificExercises(phase: string): Exercise[] {
  switch(phase.toLowerCase()) {
    case 'pre-treatment':
      return pretreatmentExercises;
    case 'during-treatment':
      return duringTreatmentExercises;
    case 'post-surgery':
      return postSurgeryExercises;
    case 'post-treatment':
      return postTreatmentExercises;
    case 'long-term-survivor':
      return longTermExercises;
    default:
      return [...pretreatmentExercises, ...duringTreatmentExercises, 
              ...postSurgeryExercises, ...postTreatmentExercises, 
              ...longTermExercises];
  }
}