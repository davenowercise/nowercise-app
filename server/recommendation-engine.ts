/**
 * Nowercise Recommendation Engine
 * 
 * This engine analyzes patient data to recommend exercises and programs
 * that are appropriate for their specific situation.
 */

import { db } from './db';
import { eq, and, gte, lte, inArray, not, or, desc } from 'drizzle-orm';
import { 
  users, 
  patientProfiles, 
  physicalAssessments, 
  exercises, 
  programs, 
  exerciseRecommendations, 
  programRecommendations, 
  programWorkouts,
  PhysicalAssessment,
  Exercise,
  PatientProfile
} from '@shared/schema';

// Define weighted scoring factors for exercise matching
const SCORING_WEIGHTS = {
  ENERGY_LEVEL_MATCH: 25,
  CANCER_TYPE_MATCH: 20,
  TREATMENT_STAGE_MATCH: 15,
  BODY_FOCUS_MATCH: 10, 
  PREFERENCES_MATCH: 10,
  ACCESSIBILITY_MATCH: 10,
  EQUIPMENT_MATCH: 5,
  DISLIKE_PENALTY: -20
};

/**
 * Main recommendation function to generate exercise recommendations for a patient
 */
export async function generateExerciseRecommendations(
  patientId: string,
  assessmentId: number,
  specialistId?: string,
  limit: number = 10
): Promise<RecommendationResult[]> {
  // Load patient data
  const [patientProfile] = await db
    .select()
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, patientId));
  
  // Load patient assessment data
  const [assessment] = await db
    .select()
    .from(physicalAssessments)
    .where(eq(physicalAssessments.id, assessmentId));
  
  if (!patientProfile || !assessment) {
    throw new Error('Patient profile or assessment not found');
  }
  
  // Get all exercises from the database
  const allExercises = await db.select().from(exercises);
  
  // Score each exercise for this patient
  const scoredExercises: RecommendationResult[] = [];
  
  for (const exercise of allExercises) {
    const { score, reasonCodes } = scoreExerciseForPatient(exercise, patientProfile, assessment);
    
    scoredExercises.push({
      exercise,
      score,
      reasonCodes
    });
  }
  
  // Sort by score (highest first) and limit to requested number
  const recommendedExercises = scoredExercises
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Store recommendations in database
  for (const recommendation of recommendedExercises) {
    await db.insert(exerciseRecommendations).values({
      patientId,
      assessmentId,
      exerciseId: recommendation.exercise.id,
      recommendationScore: recommendation.score,
      reasonCodes: recommendation.reasonCodes,
      specialistId: specialistId
    });
  }
  
  return recommendedExercises;
}

/**
 * Score an exercise based on how well it matches a patient's needs
 */
function scoreExerciseForPatient(
  exercise: Exercise, 
  patientProfile: PatientProfile, 
  assessment: PhysicalAssessment
): { score: number; reasonCodes: string[] } {
  let score = 50; // Start with neutral score
  const reasonCodes: string[] = [];
  
  // Check energy level match (this is critical)
  const patientEnergyLevel = assessment.energyLevel || 3;
  const energyDifference = Math.abs((exercise.energyLevel || 3) - patientEnergyLevel);
  
  // Energy level is an exact match or very close (within 1 level)
  if (energyDifference === 0) {
    score += SCORING_WEIGHTS.ENERGY_LEVEL_MATCH;
    reasonCodes.push('perfect_energy_match');
  } else if (energyDifference === 1) {
    score += SCORING_WEIGHTS.ENERGY_LEVEL_MATCH / 2;
    reasonCodes.push('good_energy_match');
  } else if (energyDifference >= 2) {
    // Large energy gap is a significant mismatch
    score -= SCORING_WEIGHTS.ENERGY_LEVEL_MATCH;
    reasonCodes.push('energy_mismatch');
  }
  
  // Check cancer type appropriateness
  if (exercise.cancerAppropriate && patientProfile.cancerType) {
    const cancerTypes = exercise.cancerAppropriate as string[];
    if (cancerTypes.includes(patientProfile.cancerType)) {
      score += SCORING_WEIGHTS.CANCER_TYPE_MATCH;
      reasonCodes.push('cancer_type_match');
    }
  }
  
  // Check treatment stage match
  if (exercise.treatmentPhases && patientProfile.treatmentStage) {
    const phases = exercise.treatmentPhases as string[];
    if (phases.includes(patientProfile.treatmentStage)) {
      score += SCORING_WEIGHTS.TREATMENT_STAGE_MATCH;
      reasonCodes.push('treatment_stage_match');
    }
  }
  
  // Check for body focus matches with any injuries
  if (exercise.bodyFocus && assessment.priorInjuries) {
    const bodyFocus = exercise.bodyFocus as string[];
    const injuries = assessment.priorInjuries as string[];
    
    // Check if exercise focuses on areas where patient has injuries
    const hasInjuryConflict = injuries.some(injury => {
      // Map injury terms to body parts
      const injuryMap: Record<string, string[]> = {
        'frozen shoulder': ['shoulder', 'upper body', 'arms'],
        'knee pain': ['knee', 'legs', 'lower body'],
        // Add more mappings as needed
      };
      
      const affectedAreas = injuryMap[injury.toLowerCase()] || [];
      return bodyFocus.some(area => affectedAreas.includes(area.toLowerCase()));
    });
    
    if (hasInjuryConflict) {
      score -= SCORING_WEIGHTS.BODY_FOCUS_MATCH;
      reasonCodes.push('injury_conflict');
    }
  }
  
  // Check for accessibility needs
  if (assessment.mobilityStatus) {
    // Check if exercise is appropriate for patient's mobility
    if (assessment.mobilityStatus === 'seated only' && 
        exercise.movementType && 
        !['seated', 'chair', 'bed'].includes(exercise.movementType.toLowerCase())) {
      score -= SCORING_WEIGHTS.ACCESSIBILITY_MATCH;
      reasonCodes.push('mobility_mismatch');
    } else {
      score += SCORING_WEIGHTS.ACCESSIBILITY_MATCH / 2;
      reasonCodes.push('mobility_appropriate');
    }
  }
  
  // Match exercise preferences
  if (assessment.exercisePreferences && exercise.movementType) {
    const preferences = assessment.exercisePreferences as string[];
    if (preferences.some(p => 
        exercise.movementType?.toLowerCase().includes(p.toLowerCase()))) {
      score += SCORING_WEIGHTS.PREFERENCES_MATCH;
      reasonCodes.push('preference_match');
    }
  }
  
  // Check for exercise dislikes (strong negative)
  if (assessment.exerciseDislikes && exercise.movementType) {
    const dislikes = assessment.exerciseDislikes as string[];
    if (dislikes.some(d => 
        exercise.movementType?.toLowerCase().includes(d.toLowerCase()))) {
      score += SCORING_WEIGHTS.DISLIKE_PENALTY;
      reasonCodes.push('disliked_exercise_type');
    }
  }
  
  // Check equipment availability
  if (assessment.equipmentAvailable && exercise.equipment) {
    const availableEquipment = assessment.equipmentAvailable as string[];
    const requiredEquipment = exercise.equipment as string[];
    
    // If exercise requires equipment patient doesn't have
    const missingEquipment = requiredEquipment.filter(
      e => !availableEquipment.includes(e) && e !== 'none'
    );
    
    if (requiredEquipment.length > 0 && missingEquipment.length > 0) {
      score -= SCORING_WEIGHTS.EQUIPMENT_MATCH;
      reasonCodes.push('equipment_unavailable');
    } else if (requiredEquipment.length === 0 || requiredEquipment.includes('none')) {
      score += SCORING_WEIGHTS.EQUIPMENT_MATCH;
      reasonCodes.push('no_equipment_needed');
    } else {
      score += SCORING_WEIGHTS.EQUIPMENT_MATCH;
      reasonCodes.push('has_needed_equipment');
    }
  }
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));
  
  return { score, reasonCodes };
}

/**
 * Generate program recommendations for a patient
 */
export async function generateProgramRecommendations(
  patientId: string,
  assessmentId: number,
  specialistId?: string,
  limit: number = 5
): Promise<ProgramRecommendationResult[]> {
  // To be implemented - similar approach to exercise recommendations
  // but evaluating whole programs based on the exercises they contain
  // and overall program attributes
  
  return [];
}

// Type definitions
export interface RecommendationResult {
  exercise: Exercise;
  score: number;
  reasonCodes: string[];
}

export interface ProgramRecommendationResult {
  program: any; // Replace with proper Program type
  score: number;
  reasonCodes: string[];
  matchingExercises?: Exercise[];
}