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
  },

  "melanoma": {
    "base_tier": 2,
    "considerations": [
      "Skin healing post-surgery",
      "Mobility limits if near limbs"
    ],
    "restrictions": [
      "Avoid pressure/friction near excision sites"
    ],
    "preferred_modes": [
      "Gentle stretching",
      "Band mobility",
      "Walking"
    ],
    "source": "ACSM/ESMO Skin Cancer Guidelines"
  },

  "bladder": {
    "base_tier": 2,
    "considerations": [
      "Incontinence management",
      "Fatigue after surgery or chemo"
    ],
    "restrictions": [
      "Pelvic floor sensitivity",
      "Hydration care"
    ],
    "preferred_modes": [
      "Chair-based strength",
      "Walking intervals",
      "Breath-led movement"
    ],
    "source": "ESMO Bladder Cancer Management"
  },

  "kidney": {
    "base_tier": 2,
    "considerations": [
      "Unilateral pain post-nephrectomy",
      "Decreased organ function"
    ],
    "restrictions": [
      "Avoid overexertion early post-op",
      "Monitor fluid regulation"
    ],
    "preferred_modes": [
      "Seated strength",
      "Mobility bands",
      "Gentle walking"
    ],
    "source": "ACSM/ESMO Renal Cancer Adaptations"
  },

  "pancreatic": {
    "base_tier": 1,
    "considerations": [
      "Very high fatigue",
      "Nutritional depletion",
      "Recovery post-surgery"
    ],
    "restrictions": [
      "Prioritise seated activity",
      "Avoid high energy output"
    ],
    "preferred_modes": [
      "Breathing routines",
      "Short walking bouts",
      "Stretch and rest circuits"
    ],
    "source": "ACSM Guidelines – Pancreatic Cancer"
  },

  "liver": {
    "base_tier": 1,
    "considerations": [
      "Fatigue",
      "Abdominal tenderness",
      "Post-surgical fatigue"
    ],
    "restrictions": [
      "Avoid core strain",
      "Minimise supine positioning"
    ],
    "preferred_modes": [
      "Standing balance",
      "Chair mobility",
      "Light resistance bands"
    ],
    "source": "ACSM/ESMO Guidelines – Liver Cancer Exercise Safety"
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
  else if (normalizedType.includes('melanoma') || normalizedType.includes('skin')) {
    matchedType = 'melanoma';
  }
  else if (normalizedType.includes('bladder')) {
    matchedType = 'bladder';
  }
  else if (normalizedType.includes('kidney') || normalizedType.includes('renal')) {
    matchedType = 'kidney';
  }
  else if (normalizedType.includes('pancreatic') || normalizedType.includes('pancreas')) {
    matchedType = 'pancreatic';
  }
  else if (normalizedType.includes('liver') || normalizedType.includes('hepatic')) {
    matchedType = 'liver';
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
/**
 * Comorbidity factors that affect exercise recommendations
 * Each factor can adjust the tier level and add specific safety flags
 */
export const COMORBIDITY_FACTORS = {
  diabetes: {
    adjustTier: -1,
    flags: ['monitor blood sugar', 'include foot care'],
  },
  heart_disease: {
    adjustTier: -1,
    flags: ['avoid HIIT', 'limit isometric holds'],
  },
  osteoarthritis: {
    adjustTier: 0,
    flags: ['avoid deep squats', 'include joint-friendly modes'],
  },
  anxiety: {
    adjustTier: 0,
    flags: ['build confidence gradually'],
  },
  osteoporosis: {
    adjustTier: -1,
    flags: ['no twisting under load', 'no jumping'],
  }
};

export function getClientOnboardingTier(
  cancerType: string | null,
  symptoms: string[] = [],
  confidenceScore: number = 5,
  energyScore: number = 5,
  comorbidities: string[] = []
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
    else if (normalizedType.includes('melanoma') || normalizedType.includes('skin')) {
      baseTier = CANCER_TYPE_GUIDELINES.melanoma.base_tier;
    }
    else if (normalizedType.includes('bladder')) {
      baseTier = CANCER_TYPE_GUIDELINES.bladder.base_tier;
    }
    else if (normalizedType.includes('kidney') || normalizedType.includes('renal')) {
      baseTier = CANCER_TYPE_GUIDELINES.kidney.base_tier;
    }
    else if (normalizedType.includes('pancreatic') || normalizedType.includes('pancreas')) {
      baseTier = CANCER_TYPE_GUIDELINES.pancreatic.base_tier;
    }
    else if (normalizedType.includes('liver') || normalizedType.includes('hepatic')) {
      baseTier = CANCER_TYPE_GUIDELINES.liver.base_tier;
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
  
  // Adjust tier and add flags based on comorbidities
  let comorbidityFlags: string[] = [];
  
  comorbidities.forEach(condition => {
    const normalizedCondition = condition.toLowerCase().replace(/\s+/g, '_');
    const comorbidityFactor = COMORBIDITY_FACTORS[normalizedCondition as keyof typeof COMORBIDITY_FACTORS];
    
    if (comorbidityFactor) {
      // Adjust the tier level
      baseTier = Math.max(1, baseTier + comorbidityFactor.adjustTier);
      
      // Add the condition-specific flags to the list
      comorbidityFlags.push(...comorbidityFactor.flags);
    }
  });
  
  // Get considerations
  const cancerConsiderations = getCancerSpecificGuidelines(cancerType);
  
  // Combine cancer-specific considerations with comorbidity flags
  const considerations = [
    ...cancerConsiderations,
    ...(comorbidityFlags.length > 0 ? ['Additional considerations for comorbidities:'] : []),
    ...comorbidityFlags.map(flag => `- ${flag}`)
  ];
  
  return { tier: baseTier, considerations };
}

/**
 * Session and Exercise Template types
 */
export interface ExerciseTemplate {
  name: string;
  description: string;
  duration: number; // in minutes
  intensity: string;
  type: string;
  suitable_tiers: number[];
}

export interface SessionTemplate {
  name: string;
  description: string;
  duration: number; // in minutes
  suitable_tiers: number[];
  cancer_types: string[];
  exercises: ExerciseTemplate[];
}

/**
 * Exercise templates by tier level
 */
const TIER_BASED_EXERCISES: { [key: number]: ExerciseTemplate[] } = {
  1: [
    {
      name: "Seated Breathing",
      description: "Focused deep breathing while seated to improve oxygen flow and reduce stress",
      duration: 5,
      intensity: "Very Light",
      type: "Breathing",
      suitable_tiers: [1, 2, 3, 4]
    },
    {
      name: "Seated Arm Raises",
      description: "Gentle arm movements while seated to maintain upper body mobility",
      duration: 5,
      intensity: "Light",
      type: "Mobility",
      suitable_tiers: [1, 2]
    },
    {
      name: "Seated Marching",
      description: "Alternate lifting knees while seated to engage core and maintain leg strength",
      duration: 5,
      intensity: "Light",
      type: "Aerobic",
      suitable_tiers: [1, 2]
    },
    {
      name: "Ankle Circles",
      description: "Circular movements of the ankles to improve circulation and joint mobility",
      duration: 3,
      intensity: "Very Light",
      type: "Mobility",
      suitable_tiers: [1, 2, 3]
    }
  ],
  2: [
    {
      name: "Standing Wall Pushes",
      description: "Pushing against a wall while standing to build upper body strength safely",
      duration: 5,
      intensity: "Light to Moderate",
      type: "Resistance",
      suitable_tiers: [2, 3]
    },
    {
      name: "Chair Squats",
      description: "Standing up and sitting down in a controlled manner to strengthen legs",
      duration: 5,
      intensity: "Moderate",
      type: "Resistance",
      suitable_tiers: [2, 3]
    },
    {
      name: "Walking in Place",
      description: "Marching or walking in place to build endurance",
      duration: 10,
      intensity: "Light to Moderate",
      type: "Aerobic",
      suitable_tiers: [2, 3]
    },
    {
      name: "Standing Leg Raises",
      description: "Lifting legs to the side and front while standing to improve balance and strength",
      duration: 5,
      intensity: "Light to Moderate",
      type: "Balance",
      suitable_tiers: [2, 3]
    }
  ],
  3: [
    {
      name: "Walking Intervals",
      description: "Alternating between faster and slower walking to build cardiovascular fitness",
      duration: 15,
      intensity: "Moderate",
      type: "Aerobic",
      suitable_tiers: [3, 4]
    },
    {
      name: "Resistance Band Rows",
      description: "Using resistance bands to strengthen back muscles",
      duration: 8,
      intensity: "Moderate",
      type: "Resistance",
      suitable_tiers: [3, 4]
    },
    {
      name: "Standing Balance Exercises",
      description: "Single leg balance with progression to dynamic movements",
      duration: 5,
      intensity: "Moderate",
      type: "Balance",
      suitable_tiers: [3, 4]
    },
    {
      name: "Full Range Stretching",
      description: "Comprehensive stretching routine for major muscle groups",
      duration: 10,
      intensity: "Light",
      type: "Flexibility",
      suitable_tiers: [2, 3, 4]
    }
  ],
  4: [
    {
      name: "Circuit Training",
      description: "Rotating through stations of different exercises with minimal rest",
      duration: 20,
      intensity: "Moderate to High",
      type: "Mixed",
      suitable_tiers: [4]
    },
    {
      name: "Light Jogging",
      description: "Sustained light jogging for cardiovascular endurance",
      duration: 15,
      intensity: "Moderate to High",
      type: "Aerobic",
      suitable_tiers: [4]
    },
    {
      name: "Bodyweight Exercises",
      description: "Squats, lunges, and modified push-ups for whole body strength",
      duration: 15,
      intensity: "Moderate to High",
      type: "Resistance",
      suitable_tiers: [4]
    },
    {
      name: "Dynamic Stretching",
      description: "Movement-based stretching to prepare the body for higher intensity exercise",
      duration: 10,
      intensity: "Moderate",
      type: "Flexibility",
      suitable_tiers: [3, 4]
    }
  ]
};

/**
 * Cancer-specific session templates
 */
const CANCER_SPECIFIC_SESSIONS: { [key: string]: SessionTemplate[] } = {
  "breast": [
    {
      name: "Upper Body Recovery",
      description: "Gentle exercises focused on regaining shoulder mobility and arm strength after surgery",
      duration: 30,
      suitable_tiers: [1, 2],
      cancer_types: ["breast"],
      exercises: [
        {
          name: "Gentle Arm Raises",
          description: "Slowly raising arms to comfortable height with support if needed",
          duration: 5,
          intensity: "Very Light",
          type: "Mobility",
          suitable_tiers: [1, 2]
        },
        {
          name: "Shoulder Circles",
          description: "Small circular movements of shoulders to improve mobility",
          duration: 5,
          intensity: "Very Light",
          type: "Mobility",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Wall Angels",
          description: "Standing against wall while moving arms in a snow angel pattern to improve posture",
          duration: 5,
          intensity: "Light",
          type: "Posture",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Seated Breathing",
          description: "Diaphragmatic breathing with focus on chest expansion",
          duration: 5,
          intensity: "Very Light",
          type: "Breathing",
          suitable_tiers: [1, 2, 3, 4]
        }
      ]
    },
    {
      name: "Lymphedema Prevention",
      description: "Gentle movements to encourage lymphatic drainage and reduce risk of lymphedema",
      duration: 25,
      suitable_tiers: [1, 2, 3],
      cancer_types: ["breast"],
      exercises: [
        {
          name: "Hand Pumps",
          description: "Opening and closing hands to encourage circulation",
          duration: 3,
          intensity: "Very Light",
          type: "Circulation",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Arm Elevation",
          description: "Gentle raising and lowering of arms to encourage lymphatic flow",
          duration: 5,
          intensity: "Light",
          type: "Circulation",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Self-Massage",
          description: "Gentle massage techniques for affected arm",
          duration: 7,
          intensity: "Very Light",
          type: "Self-Care",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Breathing with Arm Movement",
          description: "Coordinated breathing with gentle arm raises",
          duration: 5,
          intensity: "Light",
          type: "Breathing",
          suitable_tiers: [1, 2, 3]
        }
      ]
    }
  ],
  "prostate": [
    {
      name: "Pelvic Floor Strengthening",
      description: "Exercises focused on rebuilding pelvic floor strength post-surgery",
      duration: 20,
      suitable_tiers: [1, 2, 3],
      cancer_types: ["prostate"],
      exercises: [
        {
          name: "Kegel Exercises",
          description: "Contracting and relaxing pelvic floor muscles",
          duration: 5,
          intensity: "Light",
          type: "Pelvic Floor",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Seated Pelvic Tilts",
          description: "Gentle tilting of pelvis while seated to engage core and pelvic floor",
          duration: 5,
          intensity: "Light",
          type: "Core",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Standing Hip Hinges",
          description: "Bending forward at the hips while maintaining a neutral spine",
          duration: 5,
          intensity: "Light to Moderate",
          type: "Movement Pattern",
          suitable_tiers: [2, 3]
        }
      ]
    },
    {
      name: "Bone Health",
      description: "Weight-bearing exercises to help maintain bone density for those on hormone therapy",
      duration: 30,
      suitable_tiers: [2, 3, 4],
      cancer_types: ["prostate"],
      exercises: [
        {
          name: "Standing Heel Raises",
          description: "Rising onto toes to strengthen lower legs and load bones",
          duration: 5,
          intensity: "Light to Moderate",
          type: "Weight-Bearing",
          suitable_tiers: [2, 3, 4]
        },
        {
          name: "Chair-Supported Squats",
          description: "Partial squats using chair for support",
          duration: 5,
          intensity: "Light to Moderate",
          type: "Weight-Bearing",
          suitable_tiers: [2, 3]
        },
        {
          name: "Step-Ups",
          description: "Stepping up and down on a low step to load bones and improve balance",
          duration: 8,
          intensity: "Moderate",
          type: "Weight-Bearing",
          suitable_tiers: [3, 4]
        },
        {
          name: "Walking",
          description: "Steady walking to load bones and improve cardiovascular health",
          duration: 12,
          intensity: "Light to Moderate",
          type: "Weight-Bearing",
          suitable_tiers: [2, 3, 4]
        }
      ]
    }
  ],
  "hematologic": [
    {
      name: "Immune-Safe Breathing",
      description: "Breathing exercises that can be done during periods of neutropenia",
      duration: 15,
      suitable_tiers: [1, 2],
      cancer_types: ["hematologic", "leukemia", "lymphoma"],
      exercises: [
        {
          name: "Diaphragmatic Breathing",
          description: "Deep breathing using the diaphragm to improve lung capacity",
          duration: 5,
          intensity: "Very Light",
          type: "Breathing",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Box Breathing",
          description: "Inhaling, holding, exhaling, and holding for equal counts",
          duration: 5,
          intensity: "Very Light",
          type: "Breathing",
          suitable_tiers: [1, 2, 3, 4]
        },
        {
          name: "Progressive Muscle Relaxation",
          description: "Tensing and relaxing muscle groups to reduce stress",
          duration: 5,
          intensity: "Very Light",
          type: "Relaxation",
          suitable_tiers: [1, 2, 3]
        }
      ]
    },
    {
      name: "Fatigue Management",
      description: "Very short activity bursts designed for those with severe fatigue",
      duration: 15,
      suitable_tiers: [1, 2],
      cancer_types: ["hematologic", "leukemia", "lymphoma"],
      exercises: [
        {
          name: "Seated Marching",
          description: "Very gentle marching movements while seated",
          duration: 3,
          intensity: "Very Light",
          type: "Seated Activity",
          suitable_tiers: [1, 2]
        },
        {
          name: "Ankle Pumps",
          description: "Flexing and pointing feet to improve circulation",
          duration: 2,
          intensity: "Very Light",
          type: "Circulation",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Seated Stretching",
          description: "Gentle stretches that can be performed from a chair or bed",
          duration: 5,
          intensity: "Very Light",
          type: "Flexibility",
          suitable_tiers: [1, 2]
        },
        {
          name: "Rest Period",
          description: "Scheduled rest to prevent overexertion",
          duration: 5,
          intensity: "Rest",
          type: "Recovery",
          suitable_tiers: [1, 2]
        }
      ]
    }
  ],
  "general": [
    {
      name: "Energy Conservation",
      description: "Activity pacing to build endurance while managing cancer-related fatigue",
      duration: 20,
      suitable_tiers: [1, 2, 3],
      cancer_types: ["general"],
      exercises: [
        {
          name: "Seated Exercises",
          description: "Gentle movement while seated to preserve energy",
          duration: 5,
          intensity: "Light",
          type: "Mixed",
          suitable_tiers: [1, 2]
        },
        {
          name: "Standing Activities",
          description: "Brief standing activities with rest periods",
          duration: 5,
          intensity: "Light to Moderate",
          type: "Mixed",
          suitable_tiers: [2, 3]
        },
        {
          name: "Scheduled Rest",
          description: "Intentional rest period to prevent overexertion",
          duration: 3,
          intensity: "Rest",
          type: "Recovery",
          suitable_tiers: [1, 2, 3]
        },
        {
          name: "Walking",
          description: "Short walking bout with emphasis on good posture",
          duration: 7,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3]
        }
      ]
    },
    {
      name: "Mood Enhancement",
      description: "Movement focused on improving mood and reducing anxiety",
      duration: 25,
      suitable_tiers: [2, 3, 4],
      cancer_types: ["general"],
      exercises: [
        {
          name: "Rhythmic Movement",
          description: "Simple movements synchronized to music",
          duration: 10,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3, 4]
        },
        {
          name: "Mindful Walking",
          description: "Walking with focus on surroundings and sensations",
          duration: 10,
          intensity: "Light to Moderate",
          type: "Aerobic",
          suitable_tiers: [2, 3, 4]
        },
        {
          name: "Stretching",
          description: "Full-body stretching routine",
          duration: 5,
          intensity: "Light",
          type: "Flexibility",
          suitable_tiers: [1, 2, 3, 4]
        }
      ]
    }
  ]
};

/**
 * Function to generate session recommendations based on patient tier and cancer type
 * 
 * @param tier Patient's exercise tier (1-4)
 * @param cancerType Patient's cancer type
 * @param symptomLevel Severity of current symptoms (low, moderate, high)
 * @returns Array of recommended session templates
 */
export function generateSessionRecommendations(
  tier: number,
  cancerType: string | null,
  symptomLevel: string = 'moderate'
): SessionTemplate[] {
  const recommendations: SessionTemplate[] = [];
  let normalizedCancerType = 'general';
  
  // Normalize cancer type
  if (cancerType) {
    const lowerCaseType = cancerType.toLowerCase().trim();
    
    if (lowerCaseType.includes('breast')) {
      normalizedCancerType = 'breast';
    } 
    else if (lowerCaseType.includes('prostate')) {
      normalizedCancerType = 'prostate';
    } 
    else if (lowerCaseType.includes('blood') || lowerCaseType.includes('leukemia') || 
            lowerCaseType.includes('lymphoma') || lowerCaseType.includes('hematologic')) {
      normalizedCancerType = 'hematologic';
    }
  }
  
  // Add cancer-specific sessions if available
  if (CANCER_SPECIFIC_SESSIONS[normalizedCancerType]) {
    // Filter sessions based on tier
    const specificSessions = CANCER_SPECIFIC_SESSIONS[normalizedCancerType].filter(
      session => session.suitable_tiers.includes(tier)
    );
    
    // Add appropriate sessions based on symptom level
    if (symptomLevel === 'high') {
      // For high symptoms, add only the shortest sessions
      specificSessions.sort((a, b) => a.duration - b.duration);
      if (specificSessions.length > 0) recommendations.push(specificSessions[0]);
    } else {
      // For moderate or low symptoms, add all appropriate sessions
      recommendations.push(...specificSessions);
    }
  }
  
  // Add general tier-based exercises if we need more recommendations
  if (recommendations.length < 2) {
    // Create a session from tier-based exercises
    const tierExercises = TIER_BASED_EXERCISES[tier] || TIER_BASED_EXERCISES[Math.max(1, tier - 1)];
    
    if (tierExercises) {
      // Adjust exercises based on symptom level
      let exercisesToInclude = tierExercises;
      if (symptomLevel === 'high') {
        // For high symptoms, use shorter, lighter exercises
        exercisesToInclude = tierExercises.filter(ex => 
          ex.intensity.includes('Light') || ex.intensity.includes('Very')
        ).slice(0, 3);
      } else if (symptomLevel === 'moderate') {
        // For moderate symptoms, use a mix
        exercisesToInclude = tierExercises.slice(0, tierExercises.length - 1);
      }
      
      const generalSession: SessionTemplate = {
        name: `Tier ${tier} General Session`,
        description: `Customized exercise session for tier ${tier}`,
        duration: exercisesToInclude.reduce((total, ex) => total + ex.duration, 0),
        suitable_tiers: [tier],
        cancer_types: ['general'],
        exercises: exercisesToInclude
      };
      
      recommendations.push(generalSession);
    }
  }
  
  // Add general sessions if needed
  if (recommendations.length < 2) {
    const generalSessions = CANCER_SPECIFIC_SESSIONS.general.filter(
      session => session.suitable_tiers.includes(tier)
    );
    
    recommendations.push(...generalSessions);
  }
  
  // Return a max of 3 recommendations
  return recommendations.slice(0, 3);
}