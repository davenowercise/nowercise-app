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
  PatientProfile,
  Program
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
  
  // Get all programs from the database
  const allPrograms = await db.select().from(programs);
  
  // Get exercises in each program
  const scoredPrograms: ProgramRecommendationResult[] = [];
  
  for (const program of allPrograms) {
    // Get workouts for this program
    const programWorkoutData = await db
      .select({
        workout: programWorkouts,
        exercise: exercises
      })
      .from(programWorkouts)
      .innerJoin(exercises, eq(programWorkouts.exerciseId, exercises.id))
      .where(eq(programWorkouts.programId, program.id));
    
    if (programWorkoutData.length === 0) {
      // Skip programs without workouts
      continue;
    }
    
    // Extract just the exercises
    const programExercises = programWorkoutData.map(data => data.exercise);
    
    // Score each exercise in the program
    const scoredExercises = programExercises.map(exercise => {
      const { score, reasonCodes } = scoreExerciseForPatient(exercise, patientProfile, assessment);
      return { exercise, score, reasonCodes };
    });
    
    // Calculate overall program score based on:
    // 1. Average of exercise scores
    // 2. Energy level match
    // 3. Duration appropriateness
    
    // 1. Calculate average exercise score
    const totalExerciseScore = scoredExercises.reduce((sum, item) => sum + item.score, 0);
    const averageExerciseScore = totalExerciseScore / scoredExercises.length;
    
    // 2. Determine if program difficulty matches patient's energy level
    const patientEnergyLevel = assessment.energyLevel || 3;
    const programEnergyLevel = Math.round(
      programExercises.reduce((sum, ex) => sum + (ex.energyLevel || 3), 0) / programExercises.length
    );
    const energyDifference = Math.abs(programEnergyLevel - patientEnergyLevel);
    
    let finalScore = averageExerciseScore;
    const programReasonCodes: string[] = [];
    
    // Energy level matching
    if (energyDifference === 0) {
      finalScore += 10;
      programReasonCodes.push('perfect_energy_match');
    } else if (energyDifference === 1) {
      finalScore += 5;
      programReasonCodes.push('good_energy_match');
    } else if (energyDifference >= 3) {
      finalScore -= 15;
      programReasonCodes.push('energy_mismatch');
    }
    
    // 3. Duration appropriateness - shorter programs for those with lower energy
    if (program.duration <= 2 && patientEnergyLevel <= 3) {
      finalScore += 10;
      programReasonCodes.push('appropriate_short_duration');
    } else if (program.duration >= 6 && patientEnergyLevel >= 7) {
      finalScore += 10;
      programReasonCodes.push('appropriate_long_duration');
    }
    
    // Treatment stage appropriateness
    if (patientProfile.treatmentStage) {
      // During active treatment, shorter programs are better
      if (patientProfile.treatmentStage === 'inTreatment' && program.duration <= 4) {
        finalScore += 10;
        programReasonCodes.push('suitable_during_treatment');
      } 
      // Post-treatment, more comprehensive programs can be better
      else if (patientProfile.treatmentStage === 'postTreatment' && program.duration >= 4) {
        finalScore += 8;
        programReasonCodes.push('suitable_post_treatment');
      }
      // In remission, can handle longer programs
      else if (patientProfile.treatmentStage === 'remission' && program.duration >= 6) {
        finalScore += 5;
        programReasonCodes.push('suitable_for_remission');
      }
    }
    
    // Calculate overall program compatibility score
    // Find which exercises are most compatible with the patient
    const highlyCompatibleExercises = scoredExercises
      .filter(ex => ex.score >= 70)
      .map(ex => ex.exercise);
    
    // Find common reason codes that are positive
    const positiveReasonCodes = scoredExercises
      .flatMap(ex => ex.reasonCodes)
      .filter(code => !code.includes('mismatch') && !code.includes('unavailable') && !code.includes('conflict') && !code.includes('disliked'));
    
    // Count occurences of each reason code
    const reasonCodeCounts: Record<string, number> = {};
    positiveReasonCodes.forEach(code => {
      reasonCodeCounts[code] = (reasonCodeCounts[code] || 0) + 1;
    });
    
    // Add the most common positive reason codes to program reasons
    Object.entries(reasonCodeCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .forEach(([code]) => {
        if (!programReasonCodes.includes(code)) {
          programReasonCodes.push(code);
        }
      });
    
    // Ensure score is between 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    scoredPrograms.push({
      program,
      score: finalScore,
      reasonCodes: programReasonCodes,
      matchingExercises: highlyCompatibleExercises
    });
  }
  
  // Sort by score (highest first) and limit to requested number
  const recommendedPrograms = scoredPrograms
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Store recommendations in database
  for (const recommendation of recommendedPrograms) {
    await db.insert(programRecommendations).values({
      patientId,
      assessmentId,
      programId: recommendation.program.id,
      recommendationScore: recommendation.score,
      reasonCodes: recommendation.reasonCodes,
      specialistId: specialistId
    });
  }
  
  return recommendedPrograms;
}

/**
 * Get the most recent assessment for a patient
 */
export async function getLatestAssessment(patientId: string): Promise<PhysicalAssessment | undefined> {
  const assessments = await db
    .select()
    .from(physicalAssessments)
    .where(eq(physicalAssessments.userId, patientId))
    .orderBy(desc(physicalAssessments.createdAt))
    .limit(1);
  
  return assessments[0];
}

/**
 * Checks if there are existing recommendations for a patient
 * If none exist and an assessment is available, it generates new recommendations
 */
export async function ensureRecommendations(patientId: string, specialistId?: string): Promise<{
  exerciseRecommendations: RecommendationResult[];
  programRecommendations: ProgramRecommendationResult[];
}> {
  // Check for existing exercise recommendations
  const existingExerciseRecs = await db
    .select({
      recommendation: exerciseRecommendations,
      exercise: exercises
    })
    .from(exerciseRecommendations)
    .innerJoin(exercises, eq(exerciseRecommendations.exerciseId, exercises.id))
    .where(eq(exerciseRecommendations.patientId, patientId))
    .limit(1);

  // Check for existing program recommendations
  const existingProgramRecs = await db
    .select({
      recommendation: programRecommendations,
      program: programs
    })
    .from(programRecommendations)
    .innerJoin(programs, eq(programRecommendations.programId, programs.id))
    .where(eq(programRecommendations.patientId, patientId))
    .limit(1);

  // If we already have recommendations, return empty arrays
  // (The actual recommendations will be fetched by the storage methods)
  if (existingExerciseRecs.length > 0 || existingProgramRecs.length > 0) {
    return {
      exerciseRecommendations: [],
      programRecommendations: []
    };
  }

  // No recommendations exist, so we need to generate them
  // First, get the latest assessment
  const latestAssessment = await getLatestAssessment(patientId);
  
  if (!latestAssessment) {
    // We need an assessment to generate recommendations
    return {
      exerciseRecommendations: [],
      programRecommendations: []
    };
  }

  // Generate both types of recommendations
  const exerciseRecs = await generateExerciseRecommendations(patientId, latestAssessment.id, specialistId);
  const programRecs = await generateProgramRecommendations(patientId, latestAssessment.id, specialistId);

  return {
    exerciseRecommendations: exerciseRecs,
    programRecommendations: programRecs
  };
}

// Type definitions
export interface RecommendationResult {
  exercise: Exercise;
  score: number;
  reasonCodes: string[];
}

export interface ProgramRecommendationResult {
  program: Program;
  score: number;
  reasonCodes: string[];
  matchingExercises?: Exercise[];
}