import { 
  TRAINING_STAGES, 
  SESSION_TYPES, 
  type TrainingStage, 
  type SessionType, 
  type WeeklyTemplate,
  type PatientProgressionBackbone,
  type SessionLog
} from "@shared/schema";

import {
  AEROBIC_TARGET_RANGE,
  STRENGTH_TARGET,
  BENEFIT_THRESHOLD,
  STAGE_GUIDELINE_TARGETS,
  getStageAerobicTargetRange,
  getStageStrengthTarget,
  adjustTargetsForContext,
  getGuidelineZoneDescription,
  getGuidelineExplanation,
  exceedsStageCeiling,
  capToStageCeiling,
  type StageGuidelineTarget
} from './guidelines';

// Re-export guidelines for external use
export {
  AEROBIC_TARGET_RANGE,
  STRENGTH_TARGET,
  BENEFIT_THRESHOLD,
  STAGE_GUIDELINE_TARGETS,
  getStageAerobicTargetRange,
  getStageStrengthTarget,
  adjustTargetsForContext,
  getGuidelineZoneDescription,
  getGuidelineExplanation,
  exceedsStageCeiling,
  capToStageCeiling
};

/**
 * Helper to resolve training stage to string name for guideline lookups
 * Handles both numeric enum values and string literals
 */
export function resolveStageToName(stage: TrainingStage | string | number | undefined | null): string {
  if (stage === undefined || stage === null) return 'FOUNDATIONS';
  
  // If already a valid string key, return it
  if (typeof stage === 'string' && STAGE_GUIDELINE_TARGETS[stage]) {
    return stage;
  }
  
  // Map numeric values to string names
  const numericMap: Record<number, string> = {
    0: 'FOUNDATIONS',
    1: 'BUILD_1',
    2: 'BUILD_2',
    3: 'GROW',
    4: 'MAINTAIN'
  };
  
  if (typeof stage === 'number' && numericMap[stage]) {
    return numericMap[stage];
  }
  
  // Try to parse as number if it's a numeric string
  if (typeof stage === 'string') {
    const parsed = parseInt(stage, 10);
    if (!isNaN(parsed) && numericMap[parsed]) {
      return numericMap[parsed];
    }
  }
  
  // Default fallback
  return 'FOUNDATIONS';
}

// Stage configuration with ACSM-aligned safe progression parameters
export interface StageConfig {
  name: string;
  description: string;
  sessionsPerWeek: number;
  minutesPerSession: number;
  setsPerExercise: number;
  repsPerSet: number;
  intensityMax: number; // 1-10 RPE
  restDays: number;
  weeklyTemplate: WeeklyTemplate;
}

// Default stage configurations (conservative, cancer-safe progression)
export const STAGE_CONFIGS: Record<TrainingStage, StageConfig> = {
  [TRAINING_STAGES.FOUNDATIONS]: {
    name: "Foundations",
    description: "Building confidence with gentle, short sessions",
    sessionsPerWeek: 2,
    minutesPerSession: 10,
    setsPerExercise: 1,
    repsPerSet: 8,
    intensityMax: 3,
    restDays: 5,
    weeklyTemplate: {
      monday: SESSION_TYPES.STRENGTH,
      tuesday: SESSION_TYPES.REST,
      wednesday: SESSION_TYPES.REST,
      thursday: SESSION_TYPES.AEROBIC,
      friday: SESSION_TYPES.REST,
      saturday: SESSION_TYPES.REST,
      sunday: SESSION_TYPES.REST
    }
  },
  [TRAINING_STAGES.BUILD_1]: {
    name: "Build 1",
    description: "Adding a third session with optional micro-movement",
    sessionsPerWeek: 3,
    minutesPerSession: 12,
    setsPerExercise: 2,
    repsPerSet: 8,
    intensityMax: 4,
    restDays: 4,
    weeklyTemplate: {
      monday: SESSION_TYPES.STRENGTH,
      tuesday: SESSION_TYPES.REST,
      wednesday: SESSION_TYPES.MIND_BODY,
      thursday: SESSION_TYPES.REST,
      friday: SESSION_TYPES.AEROBIC,
      saturday: SESSION_TYPES.OPTIONAL,
      sunday: SESSION_TYPES.REST
    }
  },
  [TRAINING_STAGES.BUILD_2]: {
    name: "Build 2",
    description: "Slightly longer sessions with varied focus",
    sessionsPerWeek: 3,
    minutesPerSession: 15,
    setsPerExercise: 2,
    repsPerSet: 10,
    intensityMax: 5,
    restDays: 4,
    weeklyTemplate: {
      monday: SESSION_TYPES.STRENGTH,
      tuesday: SESSION_TYPES.REST,
      wednesday: SESSION_TYPES.MIXED,
      thursday: SESSION_TYPES.REST,
      friday: SESSION_TYPES.AEROBIC,
      saturday: SESSION_TYPES.OPTIONAL,
      sunday: SESSION_TYPES.REST
    }
  },
  [TRAINING_STAGES.GROW]: {
    name: "Grow",
    description: "Four sessions with modest increases in duration",
    sessionsPerWeek: 4,
    minutesPerSession: 18,
    setsPerExercise: 2,
    repsPerSet: 12,
    intensityMax: 6,
    restDays: 3,
    weeklyTemplate: {
      monday: SESSION_TYPES.STRENGTH,
      tuesday: SESSION_TYPES.AEROBIC,
      wednesday: SESSION_TYPES.REST,
      thursday: SESSION_TYPES.MIXED,
      friday: SESSION_TYPES.REST,
      saturday: SESSION_TYPES.MIND_BODY,
      sunday: SESSION_TYPES.REST
    }
  },
  [TRAINING_STAGES.MAINTAIN]: {
    name: "Maintain",
    description: "Stable routine with flexibility for how you feel",
    sessionsPerWeek: 4,
    minutesPerSession: 20,
    setsPerExercise: 3,
    repsPerSet: 12,
    intensityMax: 6,
    restDays: 3,
    weeklyTemplate: {
      monday: SESSION_TYPES.STRENGTH,
      tuesday: SESSION_TYPES.AEROBIC,
      wednesday: SESSION_TYPES.REST,
      thursday: SESSION_TYPES.MIXED,
      friday: SESSION_TYPES.REST,
      saturday: SESSION_TYPES.MIND_BODY,
      sunday: SESSION_TYPES.OPTIONAL
    }
  }
};

// Get stage name from stage number
export function getStageName(stage: TrainingStage): string {
  return STAGE_CONFIGS[stage]?.name || "Unknown";
}

// Get stage config for a given stage
export function getStageConfig(stage: TrainingStage): StageConfig {
  return STAGE_CONFIGS[stage] || STAGE_CONFIGS[TRAINING_STAGES.FOUNDATIONS];
}

// Get today's day of week as template key
export function getDayKey(date: Date = new Date()): keyof WeeklyTemplate {
  const days: (keyof WeeklyTemplate)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  return days[date.getDay()];
}

// Get today's planned session type from backbone
export function getTodaysPlannedSession(
  backbone: PatientProgressionBackbone | null,
  date: Date = new Date()
): SessionType {
  if (!backbone?.weeklyTemplate) {
    const defaultConfig = STAGE_CONFIGS[TRAINING_STAGES.FOUNDATIONS];
    const dayKey = getDayKey(date);
    return defaultConfig.weeklyTemplate[dayKey];
  }
  
  const dayKey = getDayKey(date);
  return backbone.weeklyTemplate[dayKey] as SessionType;
}

// Symptom severity levels
export type SymptomSeverity = 'green' | 'amber' | 'red';

// Symptom snapshot for session
export interface SymptomSnapshot {
  fatigue: number; // 1-10
  pain: number; // 1-10
  anxiety: number; // 1-10
  lowMood: boolean;
  qolLimits: boolean;
}

// Calculate symptom severity from snapshot
export function calculateSymptomSeverity(symptoms: SymptomSnapshot): SymptomSeverity {
  const hasSevereSymptom = 
    symptoms.fatigue >= 8 || 
    symptoms.pain >= 8 || 
    symptoms.anxiety >= 8;
  
  const hasModerateSymptom = 
    symptoms.fatigue >= 5 || 
    symptoms.pain >= 5 || 
    symptoms.anxiety >= 5 ||
    symptoms.lowMood ||
    symptoms.qolLimits;
  
  if (hasSevereSymptom) return 'red';
  if (hasModerateSymptom) return 'amber';
  return 'green';
}

// Session adaptation result
export interface AdaptedSession {
  originalType: SessionType;
  adaptedType: SessionType;
  wasAdapted: boolean;
  adaptationReason: string | null;
  durationMultiplier: number; // 0.5 = half duration, 1.0 = full
  intensityMultiplier: number; // 0.5 = very gentle, 1.0 = standard
  suggestions: string[];
}

// Adapt today's planned session based on symptoms
export function adaptSessionForSymptoms(
  plannedType: SessionType,
  symptoms: SymptomSnapshot,
  backbone: PatientProgressionBackbone | null
): AdaptedSession {
  const severity = calculateSymptomSeverity(symptoms);
  const stageConfig = getStageConfig(backbone?.trainingStage as TrainingStage || TRAINING_STAGES.FOUNDATIONS);
  
  // Default: no adaptation needed
  const result: AdaptedSession = {
    originalType: plannedType,
    adaptedType: plannedType,
    wasAdapted: false,
    adaptationReason: null,
    durationMultiplier: 1.0,
    intensityMultiplier: 1.0,
    suggestions: []
  };
  
  // Rest days stay as rest
  if (plannedType === SESSION_TYPES.REST) {
    return result;
  }
  
  // GREEN symptoms: follow the plan with minor adjustments
  if (severity === 'green') {
    result.suggestions.push(`Today's ${plannedType} session as planned`);
    return result;
  }
  
  // AMBER symptoms: modify the plan gently
  if (severity === 'amber') {
    result.wasAdapted = true;
    result.durationMultiplier = 0.75;
    result.intensityMultiplier = 0.75;
    
    // Keep the planned type but make it gentler
    if (plannedType === SESSION_TYPES.STRENGTH) {
      result.suggestions.push("Gentler strength focus with seated options");
      result.adaptationReason = "Modified for how you're feeling today";
      
      // If anxiety is high, add mind-body finisher
      if (symptoms.anxiety >= 5) {
        result.suggestions.push("Adding calm breathing at the end");
      }
    } else if (plannedType === SESSION_TYPES.AEROBIC) {
      result.suggestions.push("Light walking or gentle movement");
      result.adaptationReason = "Scaled down for comfort";
      
      if (symptoms.fatigue >= 5) {
        result.suggestions.push("Shorter bursts with more rest");
      }
    } else if (plannedType === SESSION_TYPES.MIXED) {
      // Convert to the type that addresses current symptoms
      if (symptoms.anxiety >= 5) {
        result.adaptedType = SESSION_TYPES.MIND_BODY;
        result.suggestions.push("Focusing on calming movement today");
        result.adaptationReason = "Prioritizing what your body needs";
      } else if (symptoms.fatigue >= 5) {
        result.adaptedType = SESSION_TYPES.AEROBIC;
        result.durationMultiplier = 0.5;
        result.suggestions.push("Short, gentle movement to help with energy");
        result.adaptationReason = "Adapted for fatigue";
      } else {
        result.suggestions.push("Lighter mixed session");
        result.adaptationReason = "Gentler approach today";
      }
    }
    
    return result;
  }
  
  // RED symptoms: significantly scale down or suggest rest
  if (severity === 'red') {
    result.wasAdapted = true;
    result.durationMultiplier = 0.5;
    result.intensityMultiplier = 0.5;
    
    // Suggest rest or very minimal movement
    if (symptoms.fatigue >= 8 || symptoms.pain >= 8) {
      result.adaptedType = SESSION_TYPES.REST;
      result.suggestions.push("Rest is movement medicine too");
      result.suggestions.push("A 3-minute breathing exercise if you feel like it");
      result.adaptationReason = "Your body is asking for rest today - that's okay";
    } else if (symptoms.anxiety >= 8) {
      result.adaptedType = SESSION_TYPES.MIND_BODY;
      result.durationMultiplier = 0.3;
      result.suggestions.push("Just 5 minutes of calm breathing");
      result.suggestions.push("Gentle stretches if it feels right");
      result.adaptationReason = "Focusing on calming your nervous system";
    } else {
      // Keep type but heavily scaled
      result.suggestions.push("Very gentle, very short - only if you want to");
      result.suggestions.push("It's completely okay to skip today");
      result.adaptationReason = "Significantly scaled down for how you feel";
    }
    
    return result;
  }
  
  return result;
}

/**
 * Apply guideline ceilings to adapted session
 * Ensures symptom modifiers never push volume ABOVE the guideline-linked ceiling
 */
export function applyGuidelineCeilings(
  adapted: AdaptedSession,
  backbone: PatientProgressionBackbone | null,
  currentWeeklyMinutes: number = 0,
  currentWeeklyStrengthSessions: number = 0
): AdaptedSession & { ceilingApplied: boolean; ceilingMessage: string | null } {
  const stageName = resolveStageToName(backbone?.trainingStage);
  const stageConfig = getStageConfig(backbone?.trainingStage as TrainingStage || TRAINING_STAGES.FOUNDATIONS);
  
  // Get the ceiling for this stage
  const aerobicCeiling = getStageAerobicTargetRange(stageName);
  const strengthCeiling = getStageStrengthTarget(stageName);
  
  // Calculate proposed session minutes
  const baseMinutes = stageConfig.minutesPerSession;
  const proposedMinutes = baseMinutes * adapted.durationMultiplier;
  const newTotalMinutes = currentWeeklyMinutes + proposedMinutes;
  
  // Check if adding this session would exceed ceiling
  let ceilingApplied = false;
  let ceilingMessage: string | null = null;
  let finalDurationMultiplier = adapted.durationMultiplier;
  
  // If we're approaching the weekly ceiling, cap the session
  if (newTotalMinutes > aerobicCeiling.max) {
    const remainingMinutes = Math.max(0, aerobicCeiling.max - currentWeeklyMinutes);
    if (remainingMinutes <= 5) {
      // Suggest rest instead
      ceilingApplied = true;
      ceilingMessage = "You've reached a healthy amount of movement for your current stage this week. Rest is valuable too.";
      return {
        ...adapted,
        adaptedType: SESSION_TYPES.REST,
        wasAdapted: true,
        adaptationReason: "Weekly ceiling reached - time to rest",
        durationMultiplier: 0,
        suggestions: [...adapted.suggestions, "Consider a gentle stretch or breathing exercise if you want to move"],
        ceilingApplied,
        ceilingMessage
      };
    } else {
      // Cap to remaining minutes
      finalDurationMultiplier = remainingMinutes / baseMinutes;
      ceilingApplied = true;
      ceilingMessage = "Session adjusted to stay within your weekly target range.";
    }
  }
  
  // Check strength session ceiling
  const isStrengthSession = adapted.adaptedType === SESSION_TYPES.STRENGTH || 
    adapted.adaptedType === SESSION_TYPES.MIXED;
  
  if (isStrengthSession && currentWeeklyStrengthSessions >= strengthCeiling.max) {
    ceilingApplied = true;
    ceilingMessage = "You've done your strength sessions for the week. Let's focus on something different.";
    
    // Convert to aerobic or mind-body
    return {
      ...adapted,
      adaptedType: SESSION_TYPES.AEROBIC,
      wasAdapted: true,
      adaptationReason: "Switching from strength (weekly ceiling reached)",
      suggestions: [...adapted.suggestions, "Light movement instead of strength today"],
      durationMultiplier: finalDurationMultiplier,
      ceilingApplied,
      ceilingMessage
    };
  }
  
  return {
    ...adapted,
    durationMultiplier: finalDurationMultiplier,
    ceilingApplied,
    ceilingMessage
  };
}

/**
 * Get weekly volume summary for ceiling calculations
 */
export interface WeeklyVolumeSummary {
  totalAerobicMinutes: number;
  totalStrengthSessions: number;
  remainingAerobicMinutes: number;
  remainingStrengthSessions: number;
  percentOfCeiling: number;
  isAtCeiling: boolean;
  gentleMessage: string;
}

export function calculateWeeklyVolume(
  sessionLogs: SessionLog[],
  backbone: PatientProgressionBackbone | null
): WeeklyVolumeSummary {
  const stageName = resolveStageToName(backbone?.trainingStage);
  const aerobicCeiling = getStageAerobicTargetRange(stageName);
  const strengthCeiling = getStageStrengthTarget(stageName);
  
  // Sum up completed sessions this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekLogs = sessionLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startOfWeek && log.sessionCompleted;
  });
  
  // Calculate totals (using actual duration if available, otherwise estimate)
  const stageConfig = getStageConfig(backbone?.trainingStage as TrainingStage || TRAINING_STAGES.FOUNDATIONS);
  
  let totalAerobicMinutes = 0;
  let totalStrengthSessions = 0;
  
  thisWeekLogs.forEach(log => {
    const duration = log.actualDuration || stageConfig.minutesPerSession;
    const type = log.actualType as string;
    
    if (type === SESSION_TYPES.STRENGTH) {
      totalStrengthSessions++;
      totalAerobicMinutes += Math.round(duration * 0.3); // Strength has some aerobic component
    } else if (type === SESSION_TYPES.AEROBIC) {
      totalAerobicMinutes += duration;
    } else if (type === SESSION_TYPES.MIXED) {
      totalStrengthSessions += 0.5; // Half counts as strength
      totalAerobicMinutes += Math.round(duration * 0.7);
    } else if (type === SESSION_TYPES.MIND_BODY) {
      totalAerobicMinutes += Math.round(duration * 0.5); // Light intensity
    }
  });
  
  const remainingAerobicMinutes = Math.max(0, aerobicCeiling.max - totalAerobicMinutes);
  const remainingStrengthSessions = Math.max(0, strengthCeiling.max - totalStrengthSessions);
  const percentOfCeiling = Math.round((totalAerobicMinutes / aerobicCeiling.max) * 100);
  const isAtCeiling = totalAerobicMinutes >= aerobicCeiling.max || totalStrengthSessions >= strengthCeiling.max;
  
  let gentleMessage = "";
  if (isAtCeiling) {
    gentleMessage = "You've reached a healthy amount of movement for this week. Rest and recovery are just as important.";
  } else if (percentOfCeiling >= 75) {
    gentleMessage = "You're approaching your weekly ceiling - listen to your body about how much more feels right.";
  } else if (percentOfCeiling >= 50) {
    gentleMessage = "Good progress this week. Keep moving at your own pace.";
  } else {
    gentleMessage = "Every bit of movement counts. Do what feels right today.";
  }
  
  return {
    totalAerobicMinutes: Math.round(totalAerobicMinutes),
    totalStrengthSessions: Math.round(totalStrengthSessions),
    remainingAerobicMinutes: Math.round(remainingAerobicMinutes),
    remainingStrengthSessions: Math.round(remainingStrengthSessions),
    percentOfCeiling,
    isAtCeiling,
    gentleMessage
  };
}

// Default backbone for new patients
export function createDefaultBackbone(userId: string): Omit<PatientProgressionBackbone, 'id' | 'createdAt' | 'updatedAt'> {
  const foundationsConfig = STAGE_CONFIGS[TRAINING_STAGES.FOUNDATIONS];
  const today = new Date().toISOString().split('T')[0];
  
  return {
    userId,
    trainingStage: TRAINING_STAGES.FOUNDATIONS,
    weeklyTemplate: foundationsConfig.weeklyTemplate,
    targetSessionsPerWeek: foundationsConfig.sessionsPerWeek,
    targetMinutesPerSession: foundationsConfig.minutesPerSession,
    targetSetsPerExercise: foundationsConfig.setsPerExercise,
    targetRepsPerSet: foundationsConfig.repsPerSet,
    currentWeekNumber: 1,
    stageStartDate: today,
    lastProgressionDate: null,
    consecutiveGoodWeeks: 0,
    medicalHoldActive: false,
    holdReason: null
  };
}

// Progression decision for weekly review
export interface ProgressionDecision {
  decision: 'progress' | 'hold' | 'deload';
  reason: string;
  newStage: TrainingStage;
  minutesChange: number;
  sessionsChange: number;
  setsChange: number;
  gentleMessage: string;
}

// Weekly review data
export interface WeeklyReviewData {
  sessionsPlanned: number;
  sessionsCompleted: number;
  averageRpe: number;
  redSymptomDays: number;
  amberSymptomDays: number;
  treatmentPhaseChanged: boolean;
}

// Evaluate week and decide on progression
export function evaluateWeeklyProgression(
  currentBackbone: PatientProgressionBackbone,
  reviewData: WeeklyReviewData
): ProgressionDecision {
  const currentStage = currentBackbone.trainingStage as TrainingStage;
  const currentConfig = getStageConfig(currentStage);
  const completionRate = reviewData.sessionsPlanned > 0 
    ? (reviewData.sessionsCompleted / reviewData.sessionsPlanned) * 100 
    : 0;
  
  // Medical hold active - always hold
  if (currentBackbone.medicalHoldActive) {
    return {
      decision: 'hold',
      reason: 'Medical hold is active',
      newStage: currentStage,
      minutesChange: 0,
      sessionsChange: 0,
      setsChange: 0,
      gentleMessage: "We're keeping your programme steady while your medical team advises. This is the right thing to do."
    };
  }
  
  // Treatment phase just changed - hold
  if (reviewData.treatmentPhaseChanged) {
    return {
      decision: 'hold',
      reason: 'Treatment phase recently changed',
      newStage: currentStage,
      minutesChange: 0,
      sessionsChange: 0,
      setsChange: 0,
      gentleMessage: "Your treatment has changed, so we're keeping things steady to see how your body responds. Very sensible approach."
    };
  }
  
  // Check for DELOAD conditions
  // Very low adherence + frequent red days suggests current load is too much
  if (completionRate < 40 && reviewData.redSymptomDays >= 3) {
    const newStage = Math.max(0, currentStage - 1) as TrainingStage;
    const newConfig = getStageConfig(newStage);
    
    return {
      decision: 'deload',
      reason: 'Low completion with frequent severe symptoms',
      newStage,
      minutesChange: newConfig.minutesPerSession - currentConfig.minutesPerSession,
      sessionsChange: newConfig.sessionsPerWeek - currentConfig.sessionsPerWeek,
      setsChange: newConfig.setsPerExercise - currentConfig.setsPerExercise,
      gentleMessage: "We're gently stepping back your programme. This isn't failure - it's wisdom. Your body is telling us what it needs right now."
    };
  }
  
  // Check for HOLD conditions
  // Mixed adherence, symptoms manageable but variable
  if (completionRate >= 40 && completionRate < 70) {
    return {
      decision: 'hold',
      reason: 'Building consistency at current level',
      newStage: currentStage,
      minutesChange: 0,
      sessionsChange: 0,
      setsChange: 0,
      gentleMessage: "You're building good habits. We'll keep the same level this week to help you feel confident and consistent."
    };
  }
  
  // High RPE suggests current level is challenging enough
  if (reviewData.averageRpe >= 7) {
    return {
      decision: 'hold',
      reason: 'Current level is appropriately challenging',
      newStage: currentStage,
      minutesChange: 0,
      sessionsChange: 0,
      setsChange: 0,
      gentleMessage: "Your effort levels show this is a good challenge for you. We'll stay here to let your body adapt."
    };
  }
  
  // Check for PROGRESS conditions
  // Good completion, manageable RPE, not too many red days
  if (
    completionRate >= 70 &&
    reviewData.averageRpe <= 5 &&
    reviewData.redSymptomDays <= 1 &&
    currentStage < TRAINING_STAGES.MAINTAIN
  ) {
    const newStage = (currentStage + 1) as TrainingStage;
    const newConfig = getStageConfig(newStage);
    
    return {
      decision: 'progress',
      reason: 'Consistent completion with manageable effort',
      newStage,
      minutesChange: newConfig.minutesPerSession - currentConfig.minutesPerSession,
      sessionsChange: newConfig.sessionsPerWeek - currentConfig.sessionsPerWeek,
      setsChange: newConfig.setsPerExercise - currentConfig.setsPerExercise,
      gentleMessage: "Because you've been moving steadily and your body has been responding well, we're gently nudging your programme forward. You can always scale down if needed."
    };
  }
  
  // Default: hold steady
  return {
    decision: 'hold',
    reason: 'Maintaining current progress',
    newStage: currentStage,
    minutesChange: 0,
    sessionsChange: 0,
    setsChange: 0,
    gentleMessage: "You're doing great at your current level. We'll continue building your foundation."
  };
}

// Generate gentle progression message based on decision
export function getProgressionMessage(decision: ProgressionDecision): string {
  return decision.gentleMessage;
}

// Get stage display info for UI
export function getStageDisplayInfo(stage: TrainingStage): {
  name: string;
  description: string;
  weeklyOverview: string;
} {
  const config = getStageConfig(stage);
  return {
    name: config.name,
    description: config.description,
    weeklyOverview: `${config.sessionsPerWeek} sessions, ~${config.minutesPerSession} minutes each`
  };
}

// Check if patient is choosing significantly different sessions than planned
export interface PatternAnalysis {
  isDeviatingFromPlan: boolean;
  deviationCount: number;
  totalSessions: number;
  suggestion: string | null;
}

export function analyzeSessionPatterns(sessionLogs: SessionLog[]): PatternAnalysis {
  if (sessionLogs.length < 4) {
    return {
      isDeviatingFromPlan: false,
      deviationCount: 0,
      totalSessions: sessionLogs.length,
      suggestion: null
    };
  }
  
  const completedSessions = sessionLogs.filter(s => s.sessionCompleted);
  const deviations = completedSessions.filter(s => 
    s.plannedType && s.actualType && s.plannedType !== s.actualType
  );
  
  const deviationRate = completedSessions.length > 0 
    ? deviations.length / completedSessions.length 
    : 0;
  
  if (deviationRate > 0.5 && completedSessions.length >= 4) {
    return {
      isDeviatingFromPlan: true,
      deviationCount: deviations.length,
      totalSessions: completedSessions.length,
      suggestion: "We've noticed you often choose different exercises than planned. That's completely okay! We'll adjust your weekly template to better match what works for you."
    };
  }
  
  return {
    isDeviatingFromPlan: false,
    deviationCount: deviations.length,
    totalSessions: completedSessions.length,
    suggestion: null
  };
}
