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
  COMORBIDITY_SAFETY: 20, // High importance for comorbidity considerations
  COMORBIDITY_BENEFIT: 15, // Bonus for exercises that help with comorbidities
  DISLIKE_PENALTY: -20,
  // New ACSM-ACS guideline weights
  ACSM_AEROBIC_MATCH: 25, // High importance for meeting aerobic recommendations
  ACSM_RESISTANCE_MATCH: 20, // High importance for meeting resistance training recommendations
  ACSM_FLEXIBILITY_MATCH: 15, // Medium importance for flexibility guidelines
  ACSM_BALANCE_MATCH: 15, // Medium importance for balance guidelines
  ACSM_WEEKLY_FREQUENCY: 10 // Importance of meeting weekly frequency guidelines
};

// ACSM-ACS Exercise Guidelines for Cancer Patients
const ACSM_GUIDELINES = {
  // Weekly exercise recommendations
  WEEKLY_AEROBIC: 150, // Minutes of moderate aerobic exercise per week
  WEEKLY_AEROBIC_VIGOROUS: 75, // Minutes of vigorous aerobic exercise per week
  RESISTANCE_SESSIONS: 2, // Resistance training sessions per week (min)
  FLEXIBILITY_FREQUENCY: "most_days", // Flexibility recommendations
  
  // Exercise type classifications
  AEROBIC_TYPES: ["walking", "cycling", "swimming", "cardio", "elliptical", "jogging", "aerobic"],
  RESISTANCE_TYPES: ["strength", "resistance", "weight", "bands", "bodyweight"],
  FLEXIBILITY_TYPES: ["stretching", "yoga", "flexibility", "mobility", "range of motion"],
  BALANCE_TYPES: ["balance", "stability", "tai chi", "yoga"],
  
  // Special considerations by treatment phase
  TREATMENT_PHASE_CONSIDERATIONS: {
    "Pre-Treatment": {
      FOCUS: ["aerobic", "resistance"], // Establish baseline fitness
      INTENSITY_MODIFIER: 1.0 // Normal intensity
    },
    "During Treatment": {
      FOCUS: ["aerobic", "resistance"], // Maintain function
      INTENSITY_MODIFIER: 0.7 // Reduced intensity
    },
    "Post-Treatment": {
      FOCUS: ["aerobic", "resistance", "flexibility"], // Regain function
      INTENSITY_MODIFIER: 0.8 // Slightly reduced intensity
    },
    "Recovery": {
      FOCUS: ["aerobic", "resistance", "flexibility", "balance"], // Comprehensive approach
      INTENSITY_MODIFIER: 0.9 // Nearly normal intensity
    }
  } as Record<string, { FOCUS: string[], INTENSITY_MODIFIER: number }>
};

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
  
  // Check comorbidities
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
    
    const hasHighRiskComorbidity = comorbidities.some(c => 
      highRiskComorbidities.includes(c.toLowerCase().replace(/\s+/g, '_')));
    const hasModerateRiskComorbidity = comorbidities.some(c => 
      moderateRiskComorbidities.includes(c.toLowerCase().replace(/\s+/g, '_')));
    
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
  }
  
  // Check treatment stage with ACSM-specific recommendations
  if (patientProfile.treatmentStage) {
    const treatmentPhase = patientProfile.treatmentStage;
    
    if (treatmentPhase === 'During Treatment' || treatmentPhase === 'inTreatment') {
      riskFlags.push('active_treatment');
      acsmGuidelines.push('reduce_exercise_intensity');
      acsmGuidelines.push('monitor_fatigue_closely');
      
      // Apply ACSM treatment phase considerations
      if (ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase]) {
        const intensity = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase].INTENSITY_MODIFIER;
        acsmGuidelines.push(`intensity_modifier_${intensity.toFixed(1)}`);
      }
    } else if (treatmentPhase === 'Pre-Treatment') {
      acsmGuidelines.push('establish_baseline_fitness');
      acsmGuidelines.push('focus_on_strength_and_function');
    } else if (treatmentPhase === 'Post-Treatment' || treatmentPhase === 'Recovery') {
      acsmGuidelines.push('gradual_return_to_activity');
      acsmGuidelines.push('focus_on_rebuilding_strength');
    }
  }
  
  // Apply special ACSM considerations for older adults
  if (patientProfile.age && patientProfile.age >= 65) {
    acsmGuidelines.push('include_balance_exercises');
    acsmGuidelines.push('focus_on_functional_movement');
    
    if (patientProfile.age >= 75) {
      riskFlags.push('advanced_age');
      acsmGuidelines.push('emphasize_seated_exercises');
    }
  }
  
  // Calculate tier based on all factors, incorporating ACSM guidelines
  // Tier 1 (Gentle): Multiple risk factors, significant limitations
  // Tier 2 (Moderate): Some limitations or risk factors
  // Tier 3 (Progressive): Few or no limitations, good condition
  // Tier 4 (Challenging): No significant limitations, excellent condition
  
  if (riskFlags.length >= 3 || painLevel >= 6 || mobilityStatus <= 1 || energyLevel <= 1) {
    tier = 1; // Gentle
    acsmGuidelines.push('low_intensity_aerobic');
    acsmGuidelines.push('seated_or_supported_exercises');
  } else if (riskFlags.length >= 1 || painLevel >= 4 || mobilityStatus <= 2 || energyLevel <= 3) {
    tier = 2; // Moderate
    acsmGuidelines.push('moderate_intensity_aerobic');
    acsmGuidelines.push('light_resistance_training');
  } else if (riskFlags.length === 0 && painLevel <= 2 && mobilityStatus >= 3 && energyLevel >= 4) {
    tier = 3; // Progressive
    acsmGuidelines.push('moderate_to_vigorous_aerobic');
    acsmGuidelines.push('progressive_resistance_training');
    acsmGuidelines.push('include_flexibility_work');
  }
  
  // Exceptional conditions for Tier 4
  if (riskFlags.length === 0 && painLevel === 0 && mobilityStatus >= 4 && energyLevel >= 5) {
    tier = 4; // Challenging
    acsmGuidelines.push('vigorous_aerobic_training');
    acsmGuidelines.push('comprehensive_resistance_program');
    acsmGuidelines.push('advanced_flexibility_and_balance');
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