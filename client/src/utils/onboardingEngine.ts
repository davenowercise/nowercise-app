/**
 * Nowercise Onboarding Engine
 * Enhanced tier calculator with FITT scaling and session recommendations
 */

import { ACSM_GUIDELINES, CANCER_TYPE_GUIDELINES, COMORBIDITY_FACTORS } from './guidelines';

/**
 * Gets the intensity modifier based on treatment phase
 * @param phase Current treatment phase
 * @returns Intensity modifier (0.0-1.0)
 */
function getPhaseIntensityModifier(phase = "Post-Treatment") {
  const phaseData = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[phase as keyof typeof ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS];
  return phaseData?.INTENSITY_MODIFIER || 0.8; // Default to 0.8 if phase not found
}

/**
 * Returns an array of suggested session names based on tier level
 * @param tier Patient's exercise tier (1-4)
 * @returns Array of session names appropriate for tier
 */
function getSessionPlanByTier(tier: number): string[] {
  const plans: Record<number, string[]> = {
    1: ['Gentle Session 1 – Small Wins Start Here', 'Seated Breathing Flow', 'Balance Basics'],
    2: ['Gentle Session 2 – Balance & Breathe', 'Chair & Band Strength', 'Standing Stretch'],
    3: ['Gentle Session 3 – Steady with Bands', 'Band Circuit', 'Mobility Flow'],
    4: ['Weekly Functional Workout', 'Light Resistance Split', 'Dynamic Balance']
  };
  return plans[tier] || plans[1];
}

/**
 * Enhanced client onboarding function with treatment phase consideration
 * @param cancerType Patient's cancer type
 * @param symptoms Array of reported symptoms
 * @param confidenceScore Self-reported confidence (1-10)
 * @param energyScore Self-reported energy level (1-10)
 * @param comorbidities Array of comorbid conditions
 * @param treatmentPhase Current treatment phase
 * @returns Comprehensive onboarding result with tier and flags
 */
export function getClientOnboardingTier(
  cancerType: string | null = null,
  symptoms: string[] = [],
  confidenceScore: number = 5,
  energyScore: number = 5,
  comorbidities: string[] = [],
  treatmentPhase: string = "Post-Treatment"
): {
  tier: number;
  suggestedSessions: string[];
  flags: string[];
  treatmentPhase: string;
  intensityModifier: number;
  safetyFlag: boolean;
  source: string;
} {
  // Get base tier from cancer type
  let baseTier = 2; // Default to tier 2 (moderate)
  
  const normalizedType = cancerType?.toLowerCase().trim() || "general";
  const matchedType = Object.keys(CANCER_TYPE_GUIDELINES).find(key => 
    normalizedType.includes(key)
  ) || "general";
  
  const guideline = CANCER_TYPE_GUIDELINES[matchedType as keyof typeof CANCER_TYPE_GUIDELINES] || CANCER_TYPE_GUIDELINES["general"];
  baseTier = guideline.base_tier;

  // Check for severe symptoms
  const severeSymptoms = [
    'severe fatigue', 'severe pain', 'dizziness', 'chest pain', 
    'difficulty breathing', 'bone pain', 'recent surgery', 'infection'
  ];
  const hasSevereSymptoms = symptoms.some(symptom => 
    severeSymptoms.includes(symptom.toLowerCase())
  );
  
  // Reduce tier if severe symptoms are present
  if (hasSevereSymptoms) {
    baseTier = Math.max(1, baseTier - 1);
  }
  
  // Calculate combined confidence/energy score
  const avgScore = (confidenceScore + energyScore) / 2;
  
  // Adjust tier based on confidence and energy
  if (avgScore >= 8 && !hasSevereSymptoms) {
    baseTier = Math.min(4, baseTier + 1);
  } else if (avgScore <= 3) {
    baseTier = Math.max(1, baseTier - 1);
  }
  
  // Adjust tier and add flags based on comorbidities
  let comorbidityFlags: string[] = [];
  let safetyFlag = false;
  
  comorbidities.forEach(condition => {
    const normalizedCondition = condition.toLowerCase().replace(/\s+/g, '_');
    const factor = COMORBIDITY_FACTORS[normalizedCondition as keyof typeof COMORBIDITY_FACTORS];
    
    if (factor) {
      // Adjust the tier level
      baseTier = Math.max(1, baseTier + factor.adjustTier);
      
      // Add the condition-specific flags to the list
      comorbidityFlags.push(...factor.flags);
      
      // Flag potential high-risk combinations
      if (factor.adjustTier <= -1 && symptoms.includes('dizziness')) {
        safetyFlag = true;
      }
    }
  });
  
  // Get intensity modifier based on treatment phase
  const intensityModifier = getPhaseIntensityModifier(treatmentPhase);
  
  // Get appropriate session suggestions for tier
  const suggestedSessions = getSessionPlanByTier(baseTier);
  
  // Collect all considerations
  const flags = [
    ...(guideline.considerations || []),
    ...(comorbidityFlags.length > 0 ? ['Comorbidity Considerations:'] : []),
    ...comorbidityFlags.map(flag => `- ${flag}`)
  ];
  
  return {
    tier: baseTier,
    suggestedSessions,
    flags, 
    treatmentPhase,
    intensityModifier,
    safetyFlag,
    source: guideline.source
  };
}