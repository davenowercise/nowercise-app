export { BreastCancerPathwayService, PATHWAY_STAGES } from './stage';

export {
  adaptSessionForSymptoms,
  calculateSymptomSeverity,
} from './symptomAdaptation';

export {
  generateExerciseRecommendations,
  generateProgramRecommendations,
  getLatestAssessment,
  getPatientRecommendationTier,
  ensureRecommendations,
  calculateRecommendationTier,
} from './recommendations';

export type {
  RecommendationResult,
  ProgramRecommendationResult,
} from './recommendations';

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
} from './guidelines';

export type {
  StageGuidelineTarget,
  ExerciseTemplate,
  SessionTemplate,
} from './guidelines';
