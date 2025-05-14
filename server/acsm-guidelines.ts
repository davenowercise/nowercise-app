/**
 * ACSM-ACS Exercise Guidelines for Cancer Survivors
 * Based on the 2019 ACSM Roundtable Consensus Statement
 */

// ACSM-ACS Exercise Guidelines for Cancer Survivors
export const ACSM_GUIDELINES = {
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
  
  // General exercise goals for cancer survivors
  EXERCISE_GOALS: {
    AEROBIC: "At least 30 minutes of moderate-intensity aerobic exercise 3x/week",
    STRENGTH: "Moderate-intensity strength training 2x/week", 
    SUPERVISION: "Supervised exercise if treatment effects impact safety"
  },
  
  // FITT for Aerobic Exercise (Post-Treatment)
  AEROBIC_FITT: {
    FREQUENCY: "3-5 times per week",
    INTENSITY: {
      MODERATE: "40-60% HR reserve, 50-70% HR max, RPE 11-14/20",
      PROGRESSION: "Meet frequency and duration goals before increasing intensity"
    },
    TYPE: "Large muscle group activities (walking, cycling, swimming)",
    TIME: "20-30 minutes continuous; deconditioned patients may need shorter bouts with rest intervals"
  },
  
  // FITT for Resistance Exercise (Post-Treatment)
  RESISTANCE_FITT: {
    FREQUENCY: "2-3 days per week with minimum 48 hours between sessions",
    INTENSITY: {
      LOAD: "60-80% 1RM or allow for 6-15 reps",
      PROGRESSION: "Increase weight when able to perform >15 reps"
    },
    TYPE: "8-10 exercises of major muscle groups; machines or free weights", 
    TIME: "1-3 sets of 8-12 reps, ≥60s rest between sets"
  },
  
  // FITT for Flexibility Exercise (Post-Treatment)
  FLEXIBILITY_FITT: {
    FREQUENCY: "2-3 days per week, up to daily",
    INTENSITY: "Stretch to point of tightness or slight discomfort (not pain)",
    TYPE: "Static stretches (passive/active) for all major muscle groups; tai chi and yoga",
    TIME: "Hold each stretch for 10-30 seconds"
  },
  
  // Specific recommendations for cancer treatment symptoms
  SYMPTOM_SPECIFIC: {
    CANCER_RELATED_FATIGUE: {
      AEROBIC: "20-30 min, 3x/week, moderate intensity (RPE 11-13/20)",
      RESISTANCE: "6-10 exercises, 1-3 sets, 8-12 reps, 2-3 days/week (RPE 11-13/20)",
      PROGRESSION: "Start low, progress slow, prioritize consistency"
    },
    MUSCLE_WEAKNESS: {
      RESISTANCE: "6-10 exercises, 1-3 sets, 8-12 reps, 2-3 days/week, moderate intensity (RPE 12-14/20)",
      AEROBIC: "150 min/week, moderate intensity (RPE 12-14/20)",
      PROGRESSION: "Start at 60% 1RM, gradually increase to 70-80% 1RM"
    },
    PHYSICAL_DECONDITIONING: {
      AEROBIC: "3-5 days/week, start with 5-10 min sessions, build to 30 min, moderate intensity (RPE 11-13/20)",
      RESISTANCE: "2 days/week, low intensity progressing to moderate",
      PROGRESSION: "Start at short intervals, gradually build volume before intensity"
    },
    ANXIETY: {
      AEROBIC: "3-5 days/week, 20-30 min, moderate intensity (RPE 11-13/20)",
      MIND_BODY: "Consider yoga, tai chi, qi gong, or rhythmic activities",
      GROUP_SETTING: "Consider group exercise settings when appropriate"
    }
  },
  
  // Treatment stage considerations
  TREATMENT_PHASE_CONSIDERATIONS: {
    "Pre-Treatment": {
      FOCUS: ["aerobic", "resistance"], // Establish baseline fitness
      GOAL: "Improve cardiorespiratory fitness",
      APPROACH: "Linear progression",
      INTENSITY_MODIFIER: 1.0 // Normal intensity
    },
    "During Treatment": {
      FOCUS: ["aerobic", "resistance"], // Maintain function
      GOAL: "Maintain function, manage symptoms",
      APPROACH: "As tolerated, non-linear approach",
      INTENSITY_MODIFIER: 0.7 // Reduced intensity
    },
    "Post-Surgery": {
      FOCUS: ["flexibility", "aerobic"], // Restore ROM
      GOAL: "Restore range of motion, regain function",
      APPROACH: "Increasing ADLs, ensure full healing",
      INTENSITY_MODIFIER: 0.6 // Greatly reduced intensity
    },
    "Post-Treatment": {
      FOCUS: ["aerobic", "resistance", "flexibility"], // Regain function
      GOAL: "Address consequences of treatment, improve fitness",
      APPROACH: "Linear approach",
      INTENSITY_MODIFIER: 0.8 // Slightly reduced intensity
    },
    "Maintenance Treatment": {
      FOCUS: ["aerobic", "resistance", "flexibility"], // Comprehensive
      GOAL: "Consider side effects of hormonal/targeted therapies",
      APPROACH: "Linear approach",
      INTENSITY_MODIFIER: 0.8 // Slightly reduced intensity
    },
    "Recovery": {
      FOCUS: ["aerobic", "resistance", "flexibility", "balance"], // Comprehensive approach
      GOAL: "Return to optimal function, long-term health",
      APPROACH: "Progressive overload",
      INTENSITY_MODIFIER: 0.9 // Nearly normal intensity
    },
    "Advanced/Palliative": {
      FOCUS: ["functional", "flexibility", "light aerobic"], // Function preservation
      GOAL: "Prioritize quality of life, symptom management",
      APPROACH: "As tolerated, maintenance focus",
      INTENSITY_MODIFIER: 0.5 // Very reduced intensity
    }
  }
};

/**
 * Helper function to map an exercise type to ACSM exercise category
 */
export function mapExerciseToAcsmType(movementType: string): string {
  const lowerCaseType = movementType.toLowerCase();
  
  // Check for aerobic exercises
  if (ACSM_GUIDELINES.AEROBIC_TYPES.some(type => lowerCaseType.includes(type.toLowerCase()))) {
    return 'aerobic';
  }
  
  // Check for resistance exercises
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
  
  // Default to undefined type
  return 'other';
}

// ACSM-ACS Cancer Type Specific Guidelines
export const CANCER_TYPE_GUIDELINES = {
  "breast": {
    "base_tier": 2,
    "considerations": [
      "Lymphedema risk in upper limbs",
      "Post-surgical shoulder mobility limits",
      "Fatigue from hormone therapy"
    ],
    "restrictions": [
      "Avoid heavy resistance on affected side initially",
      "Avoid overhead movements if range of motion is limited"
    ],
    "preferred_modes": [
      "Seated resistance band work",
      "Gentle walking",
      "Breath-led mobility",
      "Postural strengthening"
    ],
    "source": "ACSM Roundtable 2019 – Breast Cancer Guidelines"
  },

  "prostate": {
    "base_tier": 2,
    "considerations": [
      "Bone density monitoring if on hormone therapy",
      "Pelvic floor considerations post-surgery",
      "Fatigue due to ongoing treatment"
    ],
    "restrictions": [
      "Avoid high-impact exercise initially",
      "Limit long periods of standing early on"
    ],
    "preferred_modes": [
      "Light resistance training",
      "Balance drills",
      "Seated aerobic movements"
    ],
    "source": "ACSM Roundtable 2019 – Prostate Cancer Guidelines"
  },

  "hematologic": {
    "base_tier": 1,
    "considerations": [
      "Immune suppression (infection risk)",
      "Anemia-related fatigue",
      "Platelet count monitoring"
    ],
    "restrictions": [
      "Avoid high-traffic spaces",
      "Avoid overexertion",
      "No group training if neutropenic"
    ],
    "preferred_modes": [
      "Seated yoga",
      "Breathing and mobility",
      "Walking at home or outdoors"
    ],
    "source": "ACSM Roundtable 2019 – Hematologic Cancer Guidelines"
  },

  "general": {
    "base_tier": 2,
    "considerations": [
      "Fatigue",
      "Deconditioning",
      "Confidence in movement"
    ],
    "restrictions": [],
    "preferred_modes": [
      "Walking",
      "Resistance bands",
      "Balance and coordination drills"
    ],
    "source": "ACSM/ACS Guidelines – General Post-Treatment Recommendations"
  },

  // Additional cancer types not in provided data but from ACSM guidelines
  "colorectal": {
    "base_tier": 2,
    "considerations": [
      "Core strength after abdominal surgery",
      "Ostomy site protection if applicable",
      "Peripheral neuropathy from chemotherapy"
    ],
    "restrictions": [
      "Avoid heavy lifting (>10 lbs) for 8-12 weeks after surgery",
      "Prevent excessive intra-abdominal pressure"
    ],
    "preferred_modes": [
      "Gentle core strengthening",
      "Progressive walking program",
      "Non-impact balance exercises"
    ],
    "source": "ACSM Roundtable 2019 – Colorectal Cancer Guidelines"
  },

  "lung": {
    "base_tier": 1,
    "considerations": [
      "Respiratory capacity limitations",
      "Poor oxygenation",
      "Fatigue and low exercise tolerance"
    ],
    "restrictions": [
      "Monitor oxygen saturation during exercise",
      "Avoid exercise in extreme temperatures"
    ],
    "preferred_modes": [
      "Breathing exercises and respiratory muscle training",
      "Interval aerobic training",
      "Posture and thoracic mobility"
    ],
    "source": "ACSM Roundtable 2019 – Lung Cancer Guidelines"
  },

  "head_neck": {
    "base_tier": 2,
    "considerations": [
      "Swallowing difficulties",
      "Neck and shoulder mobility",
      "Vestibular effects from treatment"
    ],
    "restrictions": [
      "Avoid excessive neck strain",
      "Monitor hydration during exercise"
    ],
    "preferred_modes": [
      "Neck and shoulder mobility exercises",
      "Balance exercises",
      "Low-intensity progressive resistance"
    ],
    "source": "ACSM Roundtable 2019 – Head & Neck Cancer Guidelines"
  }
};

/**
 * Get cancer type specific exercise guidelines
 */
export function getCancerSpecificGuidelines(cancerType: string | null): string[] {
  if (!cancerType) return [];
  
  // Normalize cancer type for matching
  const normalizedType = cancerType.toLowerCase().trim();
  let matchedType: string = 'general'; // Default to general guidelines
  
  // Determine which guideline type to use
  if (normalizedType.includes('breast')) {
    matchedType = 'breast';
  } 
  else if (normalizedType.includes('prostate')) {
    matchedType = 'prostate';
  } 
  else if (normalizedType.includes('blood') || normalizedType.includes('leukemia') || 
           normalizedType.includes('lymphoma') || normalizedType.includes('hematologic')) {
    matchedType = 'hematologic';
  }
  else if (normalizedType.includes('colon') || normalizedType.includes('colorectal') || 
           normalizedType.includes('rectal')) {
    matchedType = 'colorectal';
  }
  else if (normalizedType.includes('lung')) {
    matchedType = 'lung';
  }
  else if (normalizedType.includes('head') || normalizedType.includes('neck')) {
    matchedType = 'head_neck';
  }
  
  // Get the guidelines for the matched type
  const typeGuidelines = CANCER_TYPE_GUIDELINES[matchedType as keyof typeof CANCER_TYPE_GUIDELINES];
  const guidelines: string[] = [];
  
  // Format the guidelines into a list of strings
  if (typeGuidelines) {
    // Add source information
    guidelines.push(`Source: ${typeGuidelines.source}`);
    
    // Add considerations
    guidelines.push("Considerations:");
    typeGuidelines.considerations.forEach(item => {
      guidelines.push(`- ${item}`);
    });
    
    // Add restrictions if any
    if (typeGuidelines.restrictions.length > 0) {
      guidelines.push("Restrictions:");
      typeGuidelines.restrictions.forEach(item => {
        guidelines.push(`- ${item}`);
      });
    }
    
    // Add preferred exercise modes
    guidelines.push("Recommended Exercise Types:");
    typeGuidelines.preferred_modes.forEach(item => {
      guidelines.push(`- ${item}`);
    });
  }
  
  return guidelines;
}

/**
 * Generates specific FITT recommendations based on patient data and ACSM guidelines
 */
export function generateFittRecommendations(
  assessment: any,
  patientProfile: any,
  riskFlags: string[]
): {
  aerobic: string[],
  resistance: string[],
  flexibility: string[]
} {
  const aerobic: string[] = [];
  const resistance: string[] = [];
  const flexibility: string[] = [];
  
  // Get base FITT recommendations
  const baseAerobicFITT = ACSM_GUIDELINES.AEROBIC_FITT;
  const baseResistanceFITT = ACSM_GUIDELINES.RESISTANCE_FITT;
  const baseFlexibilityFITT = ACSM_GUIDELINES.FLEXIBILITY_FITT;
  
  // Get treatment phase considerations
  const treatmentPhase = patientProfile.treatmentStage || 'Post-Treatment';
  const phaseData = ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS[treatmentPhase as keyof typeof ACSM_GUIDELINES.TREATMENT_PHASE_CONSIDERATIONS];
  const phaseModifier = phaseData?.INTENSITY_MODIFIER || 0.8;
  
  // Build aerobic recommendations
  aerobic.push(`Frequency: ${baseAerobicFITT.FREQUENCY}`);
  
  // Adjust intensity based on treatment phase and risk flags
  let intensityModifier = phaseModifier;
  if (riskFlags.includes('low_energy') || riskFlags.includes('high_risk_comorbidity')) {
    intensityModifier *= 0.8; // Further reduce for high risk or low energy
  }
  
  // Customize aerobic recommendations based on patient's condition
  const energyLevel = assessment.energyLevel || 3;
  if (energyLevel <= 2) {
    // For very low energy, adjust recommendations
    aerobic.push(`Intensity: Lower end of moderate range (RPE 11-12)`);
    aerobic.push(`Type: Walking or stationary cycling`);
    aerobic.push(`Time: Start with 5-10 minute sessions, multiple times per day`);
    aerobic.push(`Note: Prioritize consistency over intensity or duration`);
  } else {
    aerobic.push(`Intensity: ${baseAerobicFITT.INTENSITY.MODERATE}`);
    aerobic.push(`Type: ${baseAerobicFITT.TYPE}`);
    aerobic.push(`Time: ${baseAerobicFITT.TIME}`);
  }
  
  // Build resistance recommendations
  resistance.push(`Frequency: ${baseResistanceFITT.FREQUENCY}`);
  
  // Customize resistance training based on patient's condition
  const painLevel = assessment.painLevel || 0;
  if (painLevel >= 4) {
    resistance.push(`Intensity: Start with very light weights or body weight`);
    resistance.push(`Type: Focus on pain-free movements, avoiding painful areas`);
    resistance.push(`Time: 1 set of 8-10 reps, increase sets before increasing weight`);
  } else {
    resistance.push(`Intensity: ${baseResistanceFITT.INTENSITY.LOAD}`);
    resistance.push(`Type: ${baseResistanceFITT.TYPE}`);
    resistance.push(`Time: ${baseResistanceFITT.TIME}`);
  }
  
  // Build flexibility recommendations
  flexibility.push(`Frequency: ${baseFlexibilityFITT.FREQUENCY}`);
  flexibility.push(`Intensity: ${baseFlexibilityFITT.INTENSITY}`);
  flexibility.push(`Type: ${baseFlexibilityFITT.TYPE}`);
  flexibility.push(`Time: ${baseFlexibilityFITT.TIME}`);
  
  // Add notes for special conditions
  if (treatmentPhase === 'Post-Surgery') {
    flexibility.push(`Note: Consult with healthcare provider about specific ROM restrictions`);
  }
  
  return { aerobic, resistance, flexibility };
}

/**
 * Helper function to get the exercise tier level for a patient during onboarding
 * @param cancerType The patient's cancer type
 * @param symptoms Current symptoms the patient is experiencing
 * @param confidenceScore The patient's self-reported exercise confidence (1-10)
 * @param energyScore The patient's self-reported energy level (1-10)
 * @returns The recommended exercise tier (1-4) and considerations
 */
export function getClientOnboardingTier(
  cancerType: string | null,
  symptoms: string[] = [],
  confidenceScore: number = 5,
  energyScore: number = 5
): { tier: number; considerations: string[] } {
  // Default to most conservative tier
  let baseTier = 1;
  
  // Get base tier from cancer type if available
  if (cancerType) {
    const normalizedType = cancerType.toLowerCase().trim();
    
    // Determine cancer type
    if (normalizedType.includes('breast')) {
      baseTier = CANCER_TYPE_GUIDELINES.breast.base_tier;
    }
    else if (normalizedType.includes('prostate')) {
      baseTier = CANCER_TYPE_GUIDELINES.prostate.base_tier;
    }
    else if (normalizedType.includes('blood') || normalizedType.includes('leukemia') || 
            normalizedType.includes('lymphoma') || normalizedType.includes('hematologic')) {
      baseTier = CANCER_TYPE_GUIDELINES.hematologic.base_tier;
    }
    else if (normalizedType.includes('colon') || normalizedType.includes('colorectal') || 
            normalizedType.includes('rectal')) {
      baseTier = CANCER_TYPE_GUIDELINES.colorectal.base_tier;
    }
    else if (normalizedType.includes('lung')) {
      baseTier = CANCER_TYPE_GUIDELINES.lung.base_tier;
    }
    else if (normalizedType.includes('head') || normalizedType.includes('neck')) {
      baseTier = CANCER_TYPE_GUIDELINES.head_neck.base_tier;
    }
  }
  
  // Adjust tier based on symptoms (more symptoms = more conservative tier)
  const severeSymptomsCount = symptoms.filter(symptom => 
    ['severe fatigue', 'severe pain', 'dizziness', 'chest pain', 'difficulty breathing', 
     'bone pain', 'recent surgery', 'infection'].includes(symptom.toLowerCase())
  ).length;
  
  // Reduce tier if severe symptoms are present
  if (severeSymptomsCount > 0) {
    baseTier = Math.max(1, baseTier - severeSymptomsCount);
  }
  
  // Adjust for energy and confidence
  const combinedScore = (energyScore + confidenceScore) / 2;
  
  // Potentially increase tier if energy/confidence is high
  if (combinedScore >= 8 && severeSymptomsCount === 0) {
    baseTier = Math.min(4, baseTier + 1);
  }
  // Potentially decrease tier if energy/confidence is low
  else if (combinedScore <= 3) {
    baseTier = Math.max(1, baseTier - 1);
  }
  
  // Get considerations
  const considerations = getCancerSpecificGuidelines(cancerType);
  
  return { tier: baseTier, considerations };
}