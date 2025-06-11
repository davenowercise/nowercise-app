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
  patients, 
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
import { storage } from './storage';
import { 
  ACSM_GUIDELINES, 
  CANCER_TYPE_GUIDELINES, 
  getCancerSpecificGuidelines,
  generateFittRecommendations
} from './acsm-guidelines';

// We now import ACSM_GUIDELINES from './acsm-guidelines'

// Define interface for treatment phase considerations to help with type checking
interface TreatmentPhaseData {
  FOCUS: string[];
  GOAL: string;
  APPROACH: string;
  INTENSITY_MODIFIER: number;
}

// Define weighted scoring factors for exercise matching
const SCORING_WEIGHTS = {
  ENERGY_LEVEL_MATCH: 25,
  CANCER_TYPE_MATCH: 20,
  TREATMENT_STAGE_MATCH: 15,
  BODY_FOCUS_MATCH: 10, 
  PREFERENCES_MATCH: 10,
  ACCESSIBILITY_MATCH: 10,
  EQUIPMENT_MATCH: 5,
  COMORBIDITY_SAFETY: 20, // High importance for comorbidity considerations
  COMORBIDITY_BENEFIT: 15, // Bonus for exercises that help with comorbidities
  COMORBIDITY_MATCH: 18, // ACSM-specific comorbidity guidelines match
  DISLIKE_PENALTY: -20,
  // New ACSM-ACS guideline weights
  ACSM_AEROBIC_MATCH: 25, // High importance for meeting aerobic recommendations
  ACSM_RESISTANCE_MATCH: 20, // High importance for meeting resistance training recommendations
  ACSM_FLEXIBILITY_MATCH: 15, // Medium importance for flexibility guidelines
  ACSM_BALANCE_MATCH: 15, // Medium importance for balance guidelines
  ACSM_WEEKLY_FREQUENCY: 10 // Importance of meeting weekly frequency guidelines
};

// Using the TreatmentPhaseData interface with the imported ACSM_GUIDELINES

// Define types for comorbidity guidelines
type ExerciseGuideline = {
  safe: string[];
  caution: string[];
  avoid: string[];
};

type ComorbidityGuidelines = {
  [key: string]: ExerciseGuideline;
};

// Define comorbidity exercise safety mappings
/**
 * Helper function to map an exercise type to ACSM exercise category
 */
function mapExerciseToAcsmType(movementType: string): string {
  const lowerCaseType = movementType.toLowerCase();
  
  // Check for aerobic exercises
  if (ACSM_GUIDELINES.AEROBIC_TYPES.some(type => lowerCaseType.includes(type.toLowerCase()))) {
    return 'aerobic';
  }
  
  // Check for resistance training
  if (ACSM_GUIDELINES.RESISTANCE_TYPES.some(type => lowerCaseType.includes(type.toLowerCase()))) {
    return 'resistance';
  }
  
  // Check for flexibility exercises
  if (ACSM_GUIDELINES.FLEXIBILITY_TYPES.some(type => lowerCaseType.includes(type.toLowerCase()))) {
    return 'flexibility';
  }
  
  // Check for balance exercises
  if (ACSM_GUIDELINES.BALANCE_TYPES.some(type => lowerCaseType.includes(type.toLowerCase()))) {
    return 'balance';
  }
  
  // Default to "other" if no match
  return 'other';
}

const COMORBIDITY_EXERCISE_GUIDELINES: ComorbidityGuidelines = {
  'diabetes': {
    safe: ['walking', 'swimming', 'cycling', 'strength_training', 'yoga', 'tai_chi'],
    caution: ['high_intensity', 'plyometrics'],
    avoid: ['prolonged_endurance']
  },
  'hypertension': {
    safe: ['walking', 'swimming', 'cycling', 'yoga', 'tai_chi'],
    caution: ['moderate_strength_training', 'jogging'],
    avoid: ['heavy_weightlifting', 'high_intensity']
  },
  'heart_disease': {
    safe: ['walking', 'light_cycling', 'swimming', 'light_strength_training'],
    caution: ['moderate_intensity', 'jogging'],
    avoid: ['high_intensity', 'heavy_weightlifting', 'sprints']
  },
  'osteoporosis': {
    safe: ['walking', 'light_strength_training', 'yoga', 'tai_chi', 'swimming'],
    caution: ['jogging', 'low_impact'],
    avoid: ['high_impact', 'jumping', 'contact_sports']
  },
  'arthritis': {
    safe: ['swimming', 'water_exercises', 'cycling', 'walking', 'tai_chi'],
    caution: ['light_strength_training', 'yoga'],
    avoid: ['high_impact', 'heavy_weightlifting']
  },
  'respiratory_conditions': {
    safe: ['walking', 'light_cycling', 'tai_chi', 'swimming'],
    caution: ['moderate_intensity', 'yoga'],
    avoid: ['high_intensity', 'cold_weather_exercise']
  },
  'neuropathy': {
    safe: ['walking', 'swimming', 'stationary_cycling', 'seated_exercises'],
    caution: ['balance_exercises', 'light_strength_training'],
    avoid: ['high_impact', 'complex_balance_challenges']
  }
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
 * Score an exercise based on how well it matches a patient's needs,
 * incorporating ACSM-ACS guidelines for cancer patients
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
  
  // ACSM-ACS Guidelines integration
  // 1. Check for treatment phase recommendations from ACSM
  if (patientProfile.treatmentStage && exercise.movementType) {
    const treatmentPhase = patientProfile.treatmentStage;
    if (ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase]) {
      const phaseRecommendations = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase];
      
      // Check if the exercise type is recommended for this treatment phase
      const exerciseType = mapExerciseToAcsmType(exercise.movementType);
      if (phaseRecommendations.FOCUS.includes(exerciseType)) {
        score += SCORING_WEIGHTS.TREATMENT_STAGE_MATCH;
        reasonCodes.push('acsm_treatment_phase_match');
      }
      
      // Apply treatment phase intensity modifier
      const modifier = phaseRecommendations.INTENSITY_MODIFIER;
      if (exercise.energyLevel && exercise.energyLevel * modifier <= patientEnergyLevel) {
        score += SCORING_WEIGHTS.ENERGY_LEVEL_MATCH / 2;
        reasonCodes.push('acsm_intensity_appropriate');
      }
    }
  }
  
  // 2. Check if the exercise type matches ACSM recommendations
  if (exercise.movementType) {
    // Use our ACSM exercise type mapping helper
    const exerciseType = mapExerciseToAcsmType(exercise.movementType);
    
    // Score different exercise types according to ACSM guidelines
    switch (exerciseType) {
      case 'aerobic':
        score += SCORING_WEIGHTS.ACSM_AEROBIC_MATCH;
        reasonCodes.push('acsm_aerobic_recommendation');
        
        // Check if weekly aerobic minutes would be met with this exercise
        // (This is a simplified version - a real implementation would track total minutes)
        if (exercise.duration && exercise.duration >= 20) {
          score += SCORING_WEIGHTS.ACSM_WEEKLY_FREQUENCY;
          reasonCodes.push('acsm_aerobic_duration_guideline');
        }
        break;
        
      case 'resistance':
        score += SCORING_WEIGHTS.ACSM_RESISTANCE_MATCH;
        reasonCodes.push('acsm_resistance_recommendation');
        
        // ACSM recommends at least 2 resistance sessions per week
        // Add bonus for meeting this guideline (simplified approach)
        score += SCORING_WEIGHTS.ACSM_WEEKLY_FREQUENCY / 2;
        reasonCodes.push('acsm_resistance_frequency_guideline');
        break;
        
      case 'flexibility':
        score += SCORING_WEIGHTS.ACSM_FLEXIBILITY_MATCH;
        reasonCodes.push('acsm_flexibility_recommendation');
        break;
        
      case 'balance':
        // Add extra weight for balance if patient is older or has mobility issues
        const balanceImportance = (assessment.mobilityStatus !== null && assessment.mobilityStatus <= 2) || 
                                 (patientProfile.age && patientProfile.age > 65) ? 
                                 SCORING_WEIGHTS.ACSM_BALANCE_MATCH * 1.5 : 
                                 SCORING_WEIGHTS.ACSM_BALANCE_MATCH;
        
        score += balanceImportance;
        reasonCodes.push('acsm_balance_recommendation');
        break;
        
      default:
        // Other exercise types still get scored but without ACSM bonuses
        break;
    }
    
    // ACSM guidelines for older adults (65+)
    if (patientProfile.age && patientProfile.age >= 65) {
      // For older adults, ACSM recommends multicomponent exercises
      // that combine different types (e.g., balance and strength)
      const hasMultipleTypes = exercise.bodyFocus && 
                              Array.isArray(exercise.bodyFocus) && 
                              exercise.bodyFocus.length >= 2;
      
      if (hasMultipleTypes) {
        score += SCORING_WEIGHTS.ACSM_BALANCE_MATCH / 2;
        reasonCodes.push('acsm_multicomponent_older_adult');
      }
    }
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
  if (assessment.mobilityStatus !== null && assessment.mobilityStatus !== undefined) {
    // Check if exercise is appropriate for patient's mobility
    // mobilityStatus: 0=low, 1=limited, 2=moderate, 3=good, 4=excellent
    if (assessment.mobilityStatus <= 1 && 
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
  
  // Check for comorbidity considerations with ACSM-ACS guidelines
  if (patientProfile.comorbidities && Array.isArray(patientProfile.comorbidities) && patientProfile.comorbidities.length > 0) {
    const comorbidities = patientProfile.comorbidities as string[];
    const movementType = (exercise.movementType || '').toLowerCase();
    const exerciseType = mapExerciseToAcsmType(movementType);
    
    // Track if this exercise has any safety concerns
    let hasSafetyIssue = false;
    let hasBenefit = false;
    let hasContraindication = false;
    
    // Check ACSM-specific comorbidity considerations
    const hasCardioRisk = comorbidities.some(c => [
      'heart_disease', 'cardiovascular_disease', 'arrhythmia', 'hypertension'
    ].includes(c.toLowerCase().replace(/\s+/g, '_')));
    
    const hasBoneRisk = comorbidities.some(c => [
      'osteoporosis', 'bone_metastases', 'severe_arthritis'
    ].includes(c.toLowerCase().replace(/\s+/g, '_')));
    
    const hasBalanceRisk = comorbidities.some(c => [
      'peripheral_neuropathy', 'balance_disorders', 'dizziness'
    ].includes(c.toLowerCase().replace(/\s+/g, '_')));
    
    // Apply ACSM guidelines for cardiac risk factors
    if (hasCardioRisk) {
      if (exerciseType === 'aerobic') {
        // ACSM recommends moderate intensity aerobic exercise for cardiac patients
        // But warns against high intensity for those with cardiac risks
        if (exercise.energyLevel && exercise.energyLevel >= 4) {
          score -= SCORING_WEIGHTS.COMORBIDITY_MATCH;
          reasonCodes.push('acsm_high_intensity_cardiac_risk');
          hasSafetyIssue = true;
        } else {
          score += SCORING_WEIGHTS.COMORBIDITY_MATCH;
          reasonCodes.push('acsm_appropriate_cardiac_intensity');
          hasBenefit = true;
        }
      }
    }
    
    // Apply ACSM guidelines for bone health risks
    if (hasBoneRisk) {
      if (exerciseType === 'resistance') {
        // ACSM recommends resistance training but modified for bone health concerns
        score += SCORING_WEIGHTS.COMORBIDITY_MATCH / 2;
        reasonCodes.push('acsm_bone_health_resistance');
        hasBenefit = true;
      }
      
      // Check if high-impact which should be avoided with osteoporosis
      if (movementType.includes('jump') || movementType.includes('high_impact') || 
          movementType.includes('plyometric')) {
        score -= SCORING_WEIGHTS.COMORBIDITY_MATCH * 2;
        reasonCodes.push('acsm_high_impact_bone_risk');
        hasContraindication = true;
      }
    }
    
    // Apply ACSM guidelines for balance/stability risks
    if (hasBalanceRisk) {
      if (exerciseType === 'balance') {
        // Balance training is beneficial but must be supervised/supported
        if (exercise.precautions && exercise.precautions.toLowerCase().includes('support')) {
          score += SCORING_WEIGHTS.COMORBIDITY_MATCH;
          reasonCodes.push('acsm_supported_balance_training');
          hasBenefit = true;
        } else {
          // Potentially beneficial but needs modification
          score += SCORING_WEIGHTS.COMORBIDITY_MATCH / 2;
          reasonCodes.push('acsm_balance_needs_support');
          hasSafetyIssue = true;
        }
      }
    }
    
    // Continue with standard comorbidity guidelines
    for (const comorbidity of comorbidities) {
      const normalizedComorbidity = comorbidity.toLowerCase().replace(/\s+/g, '_');
      if (COMORBIDITY_EXERCISE_GUIDELINES[normalizedComorbidity]) {
        const guidelines = COMORBIDITY_EXERCISE_GUIDELINES[normalizedComorbidity];
        
        // Check if this movement type is in the "safe" list for this comorbidity
        if (guidelines.safe.some((type: string) => movementType.includes(type))) {
          score += SCORING_WEIGHTS.COMORBIDITY_BENEFIT / comorbidities.length;
          hasBenefit = true;
        }
        
        // Check if this movement type requires caution for this comorbidity
        if (guidelines.caution.some((type: string) => movementType.includes(type))) {
          score -= SCORING_WEIGHTS.COMORBIDITY_SAFETY / 2 / comorbidities.length;
          hasSafetyIssue = true;
        }
        
        // Check if this movement type should be avoided for this comorbidity
        if (guidelines.avoid.some((type: string) => movementType.includes(type))) {
          score -= SCORING_WEIGHTS.COMORBIDITY_SAFETY / comorbidities.length;
          hasContraindication = true;
        }
      }
    }
    
    // Add relevant reason codes
    if (hasBenefit) {
      reasonCodes.push('comorbidity_benefit');
    }
    
    if (hasSafetyIssue) {
      reasonCodes.push('comorbidity_caution');
    }
    
    if (hasContraindication) {
      reasonCodes.push('comorbidity_contraindication');
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
    
    // Treatment stage appropriateness based on ACSM-ACS guidelines
    if (patientProfile.treatmentStage) {
      const treatmentPhase = patientProfile.treatmentStage;
      
      // Get treatment phase from standardized naming or map from our application-specific names
      let acsmTreatmentPhase = treatmentPhase;
      if (treatmentPhase === 'inTreatment') acsmTreatmentPhase = 'During Treatment';
      if (treatmentPhase === 'postTreatment') acsmTreatmentPhase = 'Post-Treatment';
      if (treatmentPhase === 'remission') acsmTreatmentPhase = 'Recovery';
      if (treatmentPhase === 'preTreatment') acsmTreatmentPhase = 'Pre-Treatment';
      
      // See if ACSM provides specific guidelines for this phase
      if (ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[acsmTreatmentPhase]) {
        const phaseGuidelines = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[acsmTreatmentPhase];
        
        // Apply treatment phase intensity modifier from ACSM
        const intensityModifier = phaseGuidelines.INTENSITY_MODIFIER;
        
        // Use program's energy level range for evaluation
        const programEnergyLevel = program.energyLevelMax || 
                                  (program.energyLevelMin ? program.energyLevelMin + 1 : 3);
                                  
        if (programEnergyLevel * intensityModifier <= patientEnergyLevel + 1) {
          finalScore += 12;
          programReasonCodes.push('acsm_appropriate_intensity_phase');
        }
        
        // Check if program focus matches ACSM recommended focus for this phase
        const recommendedFocus = phaseGuidelines.FOCUS;
        let focusMatchCount = 0;
        
        // Count how many exercises in the program match the ACSM focus for this phase
        for (const ex of scoredExercises) {
          if (ex.exercise.movementType) {
            const exerciseType = mapExerciseToAcsmType(ex.exercise.movementType);
            if (recommendedFocus.includes(exerciseType)) {
              focusMatchCount++;
            }
          }
        }
        
        // Score based on program alignment with ACSM focus recommendations
        if (focusMatchCount >= scoredExercises.length * 0.6) {
          // At least 60% of exercises match ACSM focus areas for this treatment phase
          finalScore += 15;
          programReasonCodes.push('acsm_treatment_phase_focus_match');
        } else if (focusMatchCount >= scoredExercises.length * 0.3) {
          // At least 30% match ACSM focus
          finalScore += 7;
          programReasonCodes.push('acsm_partial_phase_focus_match');
        }
      }
      
      // ACSM specific duration guidelines by treatment phase
      if (acsmTreatmentPhase === 'During Treatment' && program.duration <= 4) {
        finalScore += 10;
        programReasonCodes.push('acsm_suitable_during_treatment');
      }
      else if (acsmTreatmentPhase === 'Post-Treatment' && program.duration >= 4) {
        finalScore += 8;
        programReasonCodes.push('acsm_suitable_post_treatment');
      }
      else if (acsmTreatmentPhase === 'Recovery' && program.duration >= 6) {
        finalScore += 5;
        programReasonCodes.push('acsm_suitable_for_recovery');
      }
      else if (acsmTreatmentPhase === 'Pre-Treatment' && program.duration >= 3 && program.duration <= 5) {
        finalScore += 10;
        programReasonCodes.push('acsm_suitable_pre_treatment');
      }
    }
    
    // Check comorbidity considerations at program level
    if (patientProfile.comorbidities && Array.isArray(patientProfile.comorbidities) && patientProfile.comorbidities.length > 0) {
      const comorbidities = patientProfile.comorbidities as string[];
      
      // Track comorbidity-related issues in the program
      let programHasBeneficialExercises = false;
      let programHasContraindicatedExercises = false;
      let programHasCautionExercises = false;
      
      // Count comorbidity-specific exercise matches
      let beneficialExerciseCount = 0;
      let cautionExerciseCount = 0;
      let contraindicatedExerciseCount = 0;
      
      // Check each exercise against comorbidity guidelines
      for (const ex of scoredExercises) {
        if (ex.reasonCodes.includes('comorbidity_benefit')) {
          beneficialExerciseCount++;
          programHasBeneficialExercises = true;
        }
        
        if (ex.reasonCodes.includes('comorbidity_caution')) {
          cautionExerciseCount++;
          programHasCautionExercises = true;
        }
        
        if (ex.reasonCodes.includes('comorbidity_contraindication')) {
          contraindicatedExerciseCount++;
          programHasContraindicatedExercises = true;
        }
      }
      
      // Adjust program score based on comorbidity considerations
      if (programHasBeneficialExercises) {
        const benefitRatio = beneficialExerciseCount / scoredExercises.length;
        finalScore += 15 * benefitRatio;
        programReasonCodes.push('comorbidity_friendly_program');
      }
      
      if (programHasContraindicatedExercises) {
        const contraindicationRatio = contraindicatedExerciseCount / scoredExercises.length;
        finalScore -= 20 * contraindicationRatio;
        programReasonCodes.push('comorbidity_contraindicated_program');
      }
      
      // Note caution but don't heavily penalize
      if (programHasCautionExercises && !programHasContraindicatedExercises) {
        programReasonCodes.push('comorbidity_caution_program');
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

// Simple in-memory cache for tier calculation results
const tierResultCache = new Map<string, { tier: number; riskFlags: string[]; acsmGuidelines: string[] }>();

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
 * Retrieves the tier, risk flags, and ACSM guidelines for a patient
 * Uses caching to avoid recalculating for the same patient
 */
export async function getPatientRecommendationTier(
  patientId: string, 
  forceRecalculate: boolean = false
): Promise<{ 
  tier: number; 
  riskFlags: string[];
  acsmGuidelines: string[];
} | undefined> {
  // Simple caching mechanism with a 2-hour expiry
  const cacheKey = `tier_${patientId}`;
  const cachedTierResult = tierResultCache.get(cacheKey);
  
  if (cachedTierResult && !forceRecalculate) {
    return cachedTierResult;
  }
  
  // Get latest assessment and patient profile
  const latestAssessment = await getLatestAssessment(patientId);
  if (!latestAssessment) {
    return undefined;
  }
  
  const patientProfile = await storage.getPatientProfile(patientId);
  if (!patientProfile) {
    return undefined;
  }
  
  // Calculate tier with ACSM guidelines
  const tierResult = calculateRecommendationTier(latestAssessment, patientProfile);
  
  // Cache the result for future use
  tierResultCache.set(cacheKey, tierResult);
  
  return tierResult;
}

/**
 * Checks if there are existing recommendations for a patient
 * If none exist and an assessment is available, it generates new recommendations
 */
export async function ensureRecommendations(patientId: string, specialistId?: string): Promise<{
  exerciseRecommendations: RecommendationResult[];
  programRecommendations: ProgramRecommendationResult[];
  tier?: number;
  riskFlags?: string[];
  acsmGuidelines?: string[];
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

  // Get patient profile for ACSM guideline assessment
  const patientProfile = await storage.getPatientProfile(patientId);
  
  if (!patientProfile) {
    // We need a patient profile for tier calculation
    return {
      exerciseRecommendations: [],
      programRecommendations: []
    };
  }
  
  // Calculate tier and get ACSM guidelines based on assessment and patient profile
  const tierResult = calculateRecommendationTier(latestAssessment, patientProfile);
  
  // Generate both types of recommendations
  const exerciseRecs = await generateExerciseRecommendations(patientId, latestAssessment.id, specialistId);
  const programRecs = await generateProgramRecommendations(patientId, latestAssessment.id, specialistId);

  return {
    exerciseRecommendations: exerciseRecs,
    programRecommendations: programRecs,
    tier: tierResult.tier,
    riskFlags: tierResult.riskFlags,
    acsmGuidelines: tierResult.acsmGuidelines
  };
}

// Smart Exercise Prescription for Review, incorporating ACSM-ACS guidelines
export function calculateRecommendationTier(
  assessment: PhysicalAssessment,
  patientProfile: PatientProfile
): { tier: number; riskFlags: string[]; acsmGuidelines: string[] } {
  // Default to tier 2 (moderate)
  let tier = 2;
  const riskFlags: string[] = [];
  const acsmGuidelines: string[] = [];
  
  // Calculate tier based on various factors
  const energyLevel = assessment.energyLevel || 3;
  const painLevel = assessment.painLevel || 0;
  const mobilityStatus = assessment.mobilityStatus || 2;
  
  // Track risk flags
  if (painLevel >= 5) {
    riskFlags.push('high_pain_level');
  }
  
  if (mobilityStatus <= 1) {
    riskFlags.push('limited_mobility');
  }
  
  if (energyLevel <= 2) {
    riskFlags.push('low_energy');
  }
  
  // Check comorbidities and cancer treatment symptoms
  if (patientProfile.comorbidities && Array.isArray(patientProfile.comorbidities)) {
    const comorbidities = patientProfile.comorbidities as string[];
    
    // Certain comorbidities increase risk - expanded based on ACSM guidelines
    const highRiskComorbidities = [
      'heart_disease', 'cardiovascular_disease', 'arrhythmia', 'hypertension',
      'respiratory_conditions', 'copd', 'pulmonary_disease',
      'osteoporosis', 'bone_metastases', 'severe_arthritis',
      'peripheral_neuropathy', 'balance_disorders'
    ];
    const moderateRiskComorbidities = [
      'diabetes', 'mild_arthritis', 'lymphedema', 'obesity'
    ];
    
    // Cancer treatment specific symptoms from ACSM-ACS guidelines
    const cancerSymptoms = [
      'cancer_related_fatigue', 'muscle_weakness', 'physical_deconditioning', 'anxiety'
    ];
    
    const hasHighRiskComorbidity = comorbidities.some(c => 
      highRiskComorbidities.includes(c.toLowerCase().replace(/\s+/g, '_')));
    const hasModerateRiskComorbidity = comorbidities.some(c => 
      moderateRiskComorbidities.includes(c.toLowerCase().replace(/\s+/g, '_')));
    
    // Check for cancer treatment specific symptoms
    const hasCancerFatigue = comorbidities.some(c => 
      c.toLowerCase().includes('fatigue') || c.toLowerCase().includes('low energy'));
    const hasMuscleWeakness = comorbidities.some(c => 
      c.toLowerCase().includes('muscle') && (c.toLowerCase().includes('weakness') || c.toLowerCase().includes('loss')));
    const hasDeconditioning = comorbidities.some(c => 
      c.toLowerCase().includes('deconditioning') || c.toLowerCase().includes('poor fitness'));
    const hasAnxiety = comorbidities.some(c => 
      c.toLowerCase().includes('anxiety') || c.toLowerCase().includes('depression') || c.toLowerCase().includes('stress'));
    
    if (hasHighRiskComorbidity) {
      riskFlags.push('high_risk_comorbidity');
      // Add specific ACSM guidelines based on comorbidity
      acsmGuidelines.push('monitor_vitals_during_exercise');
      acsmGuidelines.push('avoid_high_impact_activities');
    }
    
    if (hasModerateRiskComorbidity) {
      riskFlags.push('moderate_risk_comorbidity');
      acsmGuidelines.push('gradual_progression');
    }
    
    // Multiple comorbidities increase risk
    if (comorbidities.length >= 2) {
      riskFlags.push('multiple_comorbidities');
      acsmGuidelines.push('frequent_rest_periods');
    }
    
    // Apply ACSM-ACS specific recommendations for cancer treatment symptoms
    if (hasCancerFatigue) {
      acsmGuidelines.push('cancer_related_fatigue');
      acsmGuidelines.push('moderate_aerobic_20_30_min');
      acsmGuidelines.push('start_low_progress_slow');
      acsmGuidelines.push('light_resistance_training');
      acsmGuidelines.push('monitor_rpe_11_13_scale');
    }
    
    if (hasMuscleWeakness) {
      acsmGuidelines.push('muscle_weakness');
      acsmGuidelines.push('resistance_training_2_3_days');
      acsmGuidelines.push('8_12_reps_major_muscle_groups');
      acsmGuidelines.push('moderate_intensity_rpe_12_14');
    }
    
    if (hasDeconditioning) {
      acsmGuidelines.push('physical_deconditioning');
      acsmGuidelines.push('aerobic_3_5_days_week');
      acsmGuidelines.push('start_5_10_min_build_to_30');
      acsmGuidelines.push('moderate_intensity_rpe_11_13');
    }
    
    if (hasAnxiety) {
      acsmGuidelines.push('anxiety_depression');
      acsmGuidelines.push('aerobic_3_5_days_week');
      acsmGuidelines.push('moderate_30_min_sessions');
      acsmGuidelines.push('rhythm_based_activities');
    }
  }
  
  // Check treatment stage with ACSM-specific recommendations
  if (patientProfile.treatmentStage) {
    const treatmentPhase = patientProfile.treatmentStage;
    
    if (treatmentPhase === 'During Treatment' || treatmentPhase === 'inTreatment') {
      riskFlags.push('active_treatment');
      acsmGuidelines.push('reduce_exercise_intensity');
      acsmGuidelines.push('monitor_fatigue_closely');
      
      // ACSM-ACS specific guidance for active treatment phase
      acsmGuidelines.push('acsm_during_treatment');
      acsmGuidelines.push('moderate_intensity_aerobic_150min_week');
      acsmGuidelines.push('resistance_training_2_3_weekly');
      acsmGuidelines.push('flexibility_exercises_daily');
      
      // Apply ACSM treatment phase considerations
      if (ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase]) {
        const intensity = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase].INTENSITY_MODIFIER;
        acsmGuidelines.push(`intensity_modifier_${intensity.toFixed(1)}`);
      }
    } else if (treatmentPhase === 'Pre-Treatment') {
      acsmGuidelines.push('establish_baseline_fitness');
      acsmGuidelines.push('focus_on_strength_and_function');
      acsmGuidelines.push('acsm_pre_treatment');
      acsmGuidelines.push('prepare_body_for_treatment_stress');
    } else if (treatmentPhase === 'Post-Treatment' || treatmentPhase === 'Recovery') {
      acsmGuidelines.push('gradual_return_to_activity');
      acsmGuidelines.push('focus_on_rebuilding_strength');
      acsmGuidelines.push('acsm_post_treatment');
      acsmGuidelines.push('build_towards_general_population_guidelines');
      acsmGuidelines.push('address_cancer_specific_limitations');
    }
  }
  
  // Apply special ACSM considerations for older adults
  if (patientProfile.age && patientProfile.age >= 65) {
    acsmGuidelines.push('include_balance_exercises');
    acsmGuidelines.push('focus_on_functional_movement');
    acsmGuidelines.push('acsm_older_adults');
    
    // ACSM-ACS specific guidance for older adults with cancer
    acsmGuidelines.push('multicomponent_exercise_program');
    acsmGuidelines.push('falls_prevention_exercises');
    
    if (patientProfile.age >= 75) {
      riskFlags.push('advanced_age');
      acsmGuidelines.push('emphasize_seated_exercises');
      acsmGuidelines.push('shorter_exercise_durations');
      acsmGuidelines.push('more_frequent_rest_periods');
    }
  }
  
  // Cancer-specific considerations based on ACSM-ACS guidelines
  if (patientProfile.cancerType) {
    const cancerType = patientProfile.cancerType.toLowerCase();
    
    // Add cancer-specific ACSM guidelines
    acsmGuidelines.push(`acsm_cancer_${cancerType}`);
    
    // Breast cancer specific considerations
    if (cancerType.includes('breast')) {
      acsmGuidelines.push('progressive_upper_body_exercises');
      acsmGuidelines.push('lymphedema_precautions');
    }
    
    // Prostate cancer specific considerations
    if (cancerType.includes('prostate')) {
      acsmGuidelines.push('pelvic_floor_exercises');
      acsmGuidelines.push('avoid_high_impact_if_incontinence');
    }
    
    // Lung cancer specific considerations
    if (cancerType.includes('lung')) {
      acsmGuidelines.push('breathing_exercises');
      acsmGuidelines.push('oxygen_saturation_monitoring');
      riskFlags.push('respiratory_consideration');
    }
    
    // Colorectal cancer specific considerations
    if (cancerType.includes('colon') || cancerType.includes('rectal') || cancerType.includes('colorectal')) {
      acsmGuidelines.push('core_stabilization_exercises');
      acsmGuidelines.push('stoma_protection_if_applicable');
    }
  }
  
  // Calculate tier based on all factors, incorporating ACSM guidelines
  // Tier 1 (Gentle): Multiple risk factors, significant limitations
  // Tier 2 (Moderate): Some limitations or risk factors
  // Tier 3 (Progressive): Few or no limitations, good condition
  // Tier 4 (Challenging): No significant limitations, excellent condition
  
  // Apply ACSM-ACS tier-based exercise recommendations
  if (riskFlags.length >= 3 || painLevel >= 6 || mobilityStatus <= 1 || energyLevel <= 1) {
    tier = 1; // Gentle
    acsmGuidelines.push('low_intensity_aerobic');
    acsmGuidelines.push('seated_or_supported_exercises');
    
    // ACSM-ACS guidelines for Tier 1 (high risk/significant limitations)
    acsmGuidelines.push('acsm_tier_1');
    acsmGuidelines.push('supervised_exercise_recommended');
    acsmGuidelines.push('rpe_scale_3_4');
    acsmGuidelines.push('start_with_5_10_minutes');
    
  } else if (riskFlags.length >= 1 || painLevel >= 4 || mobilityStatus <= 2 || energyLevel <= 3) {
    tier = 2; // Moderate
    acsmGuidelines.push('moderate_intensity_aerobic');
    acsmGuidelines.push('light_resistance_training');
    
    // ACSM-ACS guidelines for Tier 2 (moderate risk/some limitations)
    acsmGuidelines.push('acsm_tier_2');
    acsmGuidelines.push('rpe_scale_4_6');
    acsmGuidelines.push('20_30_minutes_aerobic');
    acsmGuidelines.push('light_to_moderate_resistance');
    
  } else if (riskFlags.length === 0 && painLevel <= 2 && mobilityStatus >= 3 && energyLevel >= 4) {
    tier = 3; // Progressive
    acsmGuidelines.push('moderate_to_vigorous_aerobic');
    acsmGuidelines.push('progressive_resistance_training');
    acsmGuidelines.push('include_flexibility_work');
    
    // ACSM-ACS guidelines for Tier 3 (low risk/few limitations)
    acsmGuidelines.push('acsm_tier_3');
    acsmGuidelines.push('rpe_scale_5_7');
    acsmGuidelines.push('30_60_minutes_aerobic');
    acsmGuidelines.push('moderate_to_vigorous_resistance');
    acsmGuidelines.push('progress_towards_general_guidelines');
  }
  
  // Exceptional conditions for Tier 4
  if (riskFlags.length === 0 && painLevel === 0 && mobilityStatus >= 4 && energyLevel >= 5) {
    tier = 4; // Challenging
    acsmGuidelines.push('vigorous_aerobic_training');
    acsmGuidelines.push('comprehensive_resistance_program');
    acsmGuidelines.push('advanced_flexibility_and_balance');
    
    // ACSM-ACS guidelines for Tier 4 (very low risk/no limitations)
    acsmGuidelines.push('acsm_tier_4');
    acsmGuidelines.push('rpe_scale_6_8');
    acsmGuidelines.push('general_population_exercise_guidelines');
    acsmGuidelines.push('high_intensity_interval_training_optional');
  }
  
  return { tier, riskFlags, acsmGuidelines };
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