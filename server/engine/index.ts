export { BreastCancerPathwayService, PATHWAY_STAGES } from './stage';

export { getTodayPlan } from './getTodayPlan';
export { evaluateSafetyGate } from './safetyGate';
export { buildSessionFromBlock } from './doseSelector';
export { BLOCKS_CATALOG, getBlockById, getBlocksForPhase, getBlocksForPhaseAndStage, getRecoveryBlockForPhase, getDefaultBlockForPhase, getDefaultBlockForPhaseAndStage } from './blocks/blocksCatalog';

export type {
  Phase,
  Stage,
  SafetyFlag,
  SessionType,
  DoseBias,
  Symptoms,
  BlockState,
  TodayPlanInput,
  TodayPlanOutput,
  RepRange,
  ExerciseOutput,
  SessionOutput,
  Caps,
  SafetyGateResult,
} from './types';

export type { Block, BlockExercise } from './blocks/blockTypes';

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
