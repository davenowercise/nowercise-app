/**
 * International Physical Activity Guidelines for Cancer Survivors
 * 
 * Based on alignment of ACS/ACSM/ASCO and WHO guidelines for people
 * living with and beyond cancer. These are long-term DIRECTIONS,
 * not pass/fail tests.
 */

// Aerobic target range (minutes per week)
export const AEROBIC_TARGET_RANGE = {
  // 150–300 minutes/week of moderate-intensity aerobic activity
  MODERATE_MIN: 150,
  MODERATE_MAX: 300,
  // 75–150 minutes/week of vigorous activity
  VIGOROUS_MIN: 75,
  VIGOROUS_MAX: 150,
  // For combination: 1 minute vigorous = 2 minutes moderate
  VIGOROUS_TO_MODERATE_RATIO: 2,
} as const;

// Strength training target
export const STRENGTH_TARGET = {
  // Muscle-strengthening on ≥2 days/week
  MIN_DAYS_PER_WEEK: 2,
} as const;

// Lower "meaningful benefit" anchor - based on evidence that even
// ~90 min/week can provide important symptom benefits
export const BENEFIT_THRESHOLD = {
  // Meaningful aerobic benefit threshold (moderate-equivalent minutes)
  AEROBIC_MINUTES_PER_WEEK: 90,
  // Even 1 strength session has benefits
  STRENGTH_SESSIONS_PER_WEEK: 1,
} as const;

// Training stage guideline percentages
// These are CEILINGS and ORIENTATIONS, not strict minimums
export interface StageGuidelineTarget {
  // Percentage range of BENEFIT_THRESHOLD_AEROBIC
  aerobicPercentMin: number;
  aerobicPercentMax: number;
  // Target strength sessions per week
  strengthSessionsMin: number;
  strengthSessionsMax: number;
  // Description for UI
  aim: string;
  guidelineRelationship: 'below' | 'approaching' | 'within';
}

export const STAGE_GUIDELINE_TARGETS: Record<string, StageGuidelineTarget> = {
  FOUNDATIONS: {
    aerobicPercentMin: 30,
    aerobicPercentMax: 50,
    strengthSessionsMin: 0,
    strengthSessionsMax: 1,
    aim: 'Get moving safely and consistently',
    guidelineRelationship: 'below',
  },
  BUILD_1: {
    aerobicPercentMin: 50,
    aerobicPercentMax: 100,
    strengthSessionsMin: 1,
    strengthSessionsMax: 2,
    aim: 'Approach meaningful benefit threshold',
    guidelineRelationship: 'approaching',
  },
  BUILD_2: {
    aerobicPercentMin: 100,
    aerobicPercentMax: 167, // ~60-100% of lower guideline (150 min)
    strengthSessionsMin: 2,
    strengthSessionsMax: 2,
    aim: 'Move towards the lower end of full guidelines',
    guidelineRelationship: 'approaching',
  },
  GROW: {
    aerobicPercentMin: 167, // 150 min
    aerobicPercentMax: 250, // ~225 min
    strengthSessionsMin: 2,
    strengthSessionsMax: 3,
    aim: 'Live within the guideline range',
    guidelineRelationship: 'within',
  },
  MAINTAIN: {
    aerobicPercentMin: 100,
    aerobicPercentMax: 250,
    strengthSessionsMin: 2,
    strengthSessionsMax: 3,
    aim: 'Keep within your comfortable home zone',
    guidelineRelationship: 'within',
  },
} as const;

/**
 * Calculate weekly aerobic target range in minutes for a given stage
 */
export function getStageAerobicTargetRange(stage: string): { min: number; max: number } {
  const target = STAGE_GUIDELINE_TARGETS[stage] || STAGE_GUIDELINE_TARGETS.FOUNDATIONS;
  const thresholdMinutes = BENEFIT_THRESHOLD.AEROBIC_MINUTES_PER_WEEK;
  
  return {
    min: Math.round((target.aerobicPercentMin / 100) * thresholdMinutes),
    max: Math.round((target.aerobicPercentMax / 100) * thresholdMinutes),
  };
}

/**
 * Calculate weekly strength target for a given stage
 */
export function getStageStrengthTarget(stage: string): { min: number; max: number } {
  const target = STAGE_GUIDELINE_TARGETS[stage] || STAGE_GUIDELINE_TARGETS.FOUNDATIONS;
  return {
    min: target.strengthSessionsMin,
    max: target.strengthSessionsMax,
  };
}

/**
 * Apply treatment/symptom adjustments to weekly targets
 * Returns adjusted targets (always lowered, never increased)
 */
export function adjustTargetsForContext(
  stage: string,
  context: {
    onActiveChemo?: boolean;
    onRadiation?: boolean;
    recentSurgery?: boolean;
    frequentRedDays?: number; // Count of red symptom days in past week
    poorRecovery?: boolean;
    clinicianFlag?: boolean;
  }
): { aerobicMinutes: { min: number; max: number }; strengthSessions: { min: number; max: number } } {
  const baseAerobic = getStageAerobicTargetRange(stage);
  const baseStrength = getStageStrengthTarget(stage);
  
  let reductionFactor = 1.0;
  
  // Active treatment reductions
  if (context.onActiveChemo) reductionFactor *= 0.5;
  if (context.onRadiation) reductionFactor *= 0.7;
  if (context.recentSurgery) reductionFactor *= 0.4;
  
  // Symptom-based reductions
  if (context.frequentRedDays && context.frequentRedDays >= 3) {
    reductionFactor *= 0.6;
  } else if (context.frequentRedDays && context.frequentRedDays >= 1) {
    reductionFactor *= 0.8;
  }
  
  // Recovery and clinical flags
  if (context.poorRecovery) reductionFactor *= 0.7;
  if (context.clinicianFlag) reductionFactor *= 0.5;
  
  // Ensure we don't go below 10 minutes (micro-sessions still count)
  const adjustedAerobic = {
    min: Math.max(10, Math.round(baseAerobic.min * reductionFactor)),
    max: Math.max(15, Math.round(baseAerobic.max * reductionFactor)),
  };
  
  // Strength sessions - reduce to 0-1 if significant reduction needed
  const adjustedStrength = {
    min: reductionFactor < 0.6 ? 0 : baseStrength.min,
    max: reductionFactor < 0.6 ? Math.min(1, baseStrength.max) : baseStrength.max,
  };
  
  return {
    aerobicMinutes: adjustedAerobic,
    strengthSessions: adjustedStrength,
  };
}

/**
 * Get guideline relationship description for UI
 */
export function getGuidelineZoneDescription(stage: string): {
  zone: 'below' | 'approaching' | 'within';
  shortLabel: string;
  gentleMessage: string;
} {
  const target = STAGE_GUIDELINE_TARGETS[stage] || STAGE_GUIDELINE_TARGETS.FOUNDATIONS;
  
  switch (target.guidelineRelationship) {
    case 'below':
      return {
        zone: 'below',
        shortLabel: 'Building foundation',
        gentleMessage: "You're focusing on building a foundation of safe, consistent movement. That's exactly where we'd expect you to be right now.",
      };
    case 'approaching':
      return {
        zone: 'approaching',
        shortLabel: 'Approaching guideline zone',
        gentleMessage: "You're working towards the range that international guidelines suggest can support recovery. Every bit of movement counts.",
      };
    case 'within':
      return {
        zone: 'within',
        shortLabel: 'Within guideline zone',
        gentleMessage: "You're doing a similar amount of movement to what international guidelines suggest for many people after cancer. Remember: this is a range, not a rule – scaling down is always okay.",
      };
  }
}

/**
 * Get stage-specific UI explanation connecting plan to guidelines
 */
export function getGuidelineExplanation(
  stage: string,
  context: {
    onActiveTreatment?: boolean;
    belowGuidelinesLongTerm?: boolean;
  } = {}
): string {
  const target = STAGE_GUIDELINE_TARGETS[stage] || STAGE_GUIDELINE_TARGETS.FOUNDATIONS;
  
  // During active treatment or in early stages
  if (context.onActiveTreatment || target.guidelineRelationship === 'below') {
    return "International guidelines say that, in the long term, many people living with and beyond cancer benefit from building up towards around 150 minutes of movement per week and 2 strength sessions. Right now, your plan is focused on a much smaller, more realistic slice of that, based on your treatment phase and how you've been feeling.";
  }
  
  // Approaching or within guideline zone
  if (target.guidelineRelationship === 'within' || target.guidelineRelationship === 'approaching') {
    if (context.belowGuidelinesLongTerm) {
      return "Guidelines give a direction of travel, not a pass/fail test. Your plan is individually tailored to what seems realistic and safe for you right now, and even this amount of movement can still be beneficial.";
    }
    return "Your current weekly plan sits in the same range that international guidelines suggest can support fatigue, mood and everyday function for many people after cancer. It's still completely okay to do less, adapt sessions, or rest when you need to.";
  }
  
  // Default gentle message
  return "Your plan is designed around your current capacity and treatment phase. International guidelines are a compass, not a scorecard – what matters most is finding what works for you.";
}

/**
 * Check if proposed weekly volume exceeds stage ceiling
 */
export function exceedsStageCeiling(
  stage: string,
  proposedAerobicMinutes: number,
  proposedStrengthSessions: number
): { exceeds: boolean; aerobicOver: boolean; strengthOver: boolean } {
  const aerobicTarget = getStageAerobicTargetRange(stage);
  const strengthTarget = getStageStrengthTarget(stage);
  
  const aerobicOver = proposedAerobicMinutes > aerobicTarget.max;
  const strengthOver = proposedStrengthSessions > strengthTarget.max;
  
  return {
    exceeds: aerobicOver || strengthOver,
    aerobicOver,
    strengthOver,
  };
}

/**
 * Cap proposed session to stay within stage ceiling
 */
export function capToStageCeiling(
  stage: string,
  proposedAerobicMinutes: number,
  proposedStrengthSessions: number
): { aerobicMinutes: number; strengthSessions: number; wasCapped: boolean } {
  const aerobicTarget = getStageAerobicTargetRange(stage);
  const strengthTarget = getStageStrengthTarget(stage);
  
  const cappedAerobic = Math.min(proposedAerobicMinutes, aerobicTarget.max);
  const cappedStrength = Math.min(proposedStrengthSessions, strengthTarget.max);
  
  return {
    aerobicMinutes: cappedAerobic,
    strengthSessions: cappedStrength,
    wasCapped: cappedAerobic < proposedAerobicMinutes || cappedStrength < proposedStrengthSessions,
  };
}
