/**
 * ACSM-ACS Exercise Guidelines for Cancer Survivors
 * Based on the 2019 ACSM Roundtable Consensus Statement
 * 
 * This file contains the shared guidelines data used by both server and client
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

  // Additional cancer types
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
  }
};

/**
 * Exercise Safety Rules by Cancer Type
 * Classifies exercise characteristics as safe/caution/avoid for each cancer type
 * Based on ACSM-ACS 2019 Roundtable Guidelines
 */
export const EXERCISE_SAFETY_RULES: Record<string, {
  avoid: string[];
  caution: string[];
  preferred: string[];
  intensityMax: number;
  durationMax: number;
}> = {
  breast: {
    avoid: ["heavy-overhead", "heavy-pushing", "high-impact-upper", "extreme-arm-extension"],
    caution: ["resistance-upper", "overhead-movements", "pushing-movements", "pulling-heavy"],
    preferred: ["seated", "breathing", "walking", "lower-body", "postural", "gentle-mobility", "resistance-bands"],
    intensityMax: 6,
    durationMax: 30
  },
  prostate: {
    avoid: ["high-impact", "jumping", "heavy-squats"],
    caution: ["prolonged-standing", "heavy-resistance", "high-intensity"],
    preferred: ["seated", "balance", "pelvic-floor", "walking", "light-resistance", "cycling"],
    intensityMax: 7,
    durationMax: 40
  },
  hematologic: {
    avoid: ["high-intensity", "contact", "group-class", "crowded-gym"],
    caution: ["resistance-heavy", "prolonged-cardio", "balance-standing"],
    preferred: ["home-based", "seated", "breathing", "gentle-yoga", "walking-outdoors", "light-mobility"],
    intensityMax: 5,
    durationMax: 20
  },
  colorectal: {
    avoid: ["heavy-core", "crunches", "sit-ups", "heavy-lifting", "valsalva"],
    caution: ["twisting", "bending", "abdominal-pressure"],
    preferred: ["walking", "gentle-core", "upper-body", "balance", "breathing", "pelvic-tilts"],
    intensityMax: 6,
    durationMax: 30
  },
  lung: {
    avoid: ["high-intensity", "breath-holding", "extreme-temperatures"],
    caution: ["prolonged-cardio", "high-elevation", "dusty-environments"],
    preferred: ["breathing-exercises", "interval-training", "walking", "posture", "thoracic-mobility", "seated-cardio"],
    intensityMax: 5,
    durationMax: 20
  },
  bone_mets: {
    avoid: ["high-impact", "jumping", "twisting", "heavy-resistance", "contact-sports"],
    caution: ["any-resistance", "balance-unsupported"],
    preferred: ["seated", "supported-standing", "aquatic", "gentle-stretching", "breathing"],
    intensityMax: 4,
    durationMax: 15
  },
  general: {
    avoid: [],
    caution: ["high-intensity"],
    preferred: ["walking", "resistance-bands", "balance", "stretching", "breathing"],
    intensityMax: 7,
    durationMax: 45
  }
};

/**
 * Get safety rules for a specific cancer type
 */
export function getSafetyRulesForCancer(cancerType: string): typeof EXERCISE_SAFETY_RULES.general {
  const normalizedCancer = cancerType.toLowerCase().replace(/[_\s-]/g, '');
  
  for (const [key, rules] of Object.entries(EXERCISE_SAFETY_RULES)) {
    if (normalizedCancer.includes(key.replace(/_/g, '')) || key.replace(/_/g, '').includes(normalizedCancer)) {
      return rules;
    }
  }
  
  return EXERCISE_SAFETY_RULES.general;
}

/**
 * Comorbidity factors that affect exercise recommendations
 * Each factor can adjust the tier level and add specific safety flags
 */
export const COMORBIDITY_FACTORS = {
  diabetes: {
    adjustTier: -1, // Reduce tier level by 1
    flags: ["monitor blood sugar", "include foot care"]
  },
  heart_disease: {
    adjustTier: -1, 
    flags: ["avoid HIIT", "limit isometric holds"]
  },
  osteoarthritis: {
    adjustTier: 0, // No tier adjustment
    flags: ["avoid deep squats", "include joint-friendly modes"]
  },
  anxiety: {
    adjustTier: 0,
    flags: ["build confidence gradually"]
  },
  depression: {
    adjustTier: 0,
    flags: ["include social components when possible", "focus on enjoyable activities"]
  },
  osteoporosis: {
    adjustTier: -1,
    flags: ["no twisting under load", "no jumping"]
  },
  lung_disease: {
    adjustTier: -1,
    flags: ["monitor breathing", "use RPE scale", "include rest intervals"]
  },
  hypertension: {
    adjustTier: -1,
    flags: ["monitor blood pressure", "avoid Valsalva maneuver"]
  },
  peripheral_neuropathy: {
    adjustTier: -1,
    flags: ["ensure proper footwear", "emphasize balance exercises", "avoid uneven surfaces"]
  },
  lymphedema: {
    adjustTier: -1,
    flags: ["wear compression garment during exercise", "start resistance very low", "monitor affected limb"]
  }
};