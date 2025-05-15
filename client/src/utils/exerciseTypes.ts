/**
 * TypeScript definitions for exercise data structures
 */

/**
 * Exercise data type definition
 */
export interface Exercise {
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
  description: string;
  avoidFor?: string[];
  treatmentPhase?: string[];
  recommended?: string[];
  intensityByPhase?: {
    [key: string]: string;
  };
  focus?: string[]; // Added for compatibility with existing code
}

/**
 * Workout step for displaying exercise instructions
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
  treatmentPhase?: string;
  format?: 'standard' | 'streamlined'; // Format preference for workout display
}

/**
 * Return type for created workout
 */
export interface WorkoutResult {
  tier: number;
  treatmentPhase: string;
  date: string;
  sessionTitle: string;
  warning?: string;
  exercises?: WorkoutStep[];
  cancerType?: string;
}