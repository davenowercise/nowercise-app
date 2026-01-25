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
  capToStageCeiling,
} from '../guidelines';

export type { StageGuidelineTarget } from '../guidelines';

export {
  ACSM_GUIDELINES,
  mapExerciseToAcsmType,
  CANCER_TYPE_GUIDELINES,
  getCancerSpecificGuidelines,
  generateFittRecommendations,
  COMORBIDITY_FACTORS,
  getClientOnboardingTier,
  generateSessionRecommendations,
  EXERCISE_SAFETY_RULES,
  filterExercisesByCancerSafety,
  getExerciseLimits,
} from '../acsm-guidelines';

export type {
  ExerciseTemplate,
  SessionTemplate,
} from '../acsm-guidelines';
