import { TodayPlanInput, TodayPlanOutput, SafetyFlag, Stage } from './types';
import { evaluateSafetyGate } from './safetyGate';
import { buildSessionFromBlock } from './doseSelector';
import { Block } from './blocks/blockTypes';
import {
  getBlockById,
  getDefaultBlockForPhaseAndStage,
  getRecoveryBlockForPhase,
} from './blocks/blocksCatalog';

function selectBlock(
  phase: TodayPlanInput['phase'],
  stage: TodayPlanInput['stage'],
  dayOfWeek: number,
  blockState: TodayPlanInput['blockState'],
  safetyFlag: SafetyFlag
): { block: Block; selectionReasons: string[] } {
  const selectionReasons: string[] = [];

  if (safetyFlag === "RED") {
    const recoveryBlock = getRecoveryBlockForPhase(phase);
    if (recoveryBlock) {
      selectionReasons.push(`Selected recovery block due to RED safety flag`);
      return { block: recoveryBlock, selectionReasons };
    }
  }

  if (blockState?.blockId) {
    const existingBlock = getBlockById(blockState.blockId);
    if (existingBlock && existingBlock.phase === phase) {
      selectionReasons.push(`Continuing with assigned block: ${existingBlock.title}`);
      return { block: existingBlock, selectionReasons };
    }
  }

  const defaultBlock = getDefaultBlockForPhaseAndStage(phase, stage);
  if (defaultBlock) {
    selectionReasons.push(`Selected block for ${phase} phase, ${stage} stage`);
    return { block: defaultBlock, selectionReasons };
  }

  throw new Error(`No block found for phase: ${phase}, stage: ${stage}`);
}

export function getTodayPlan(input: TodayPlanInput): TodayPlanOutput {
  const { phase, stage, dayOfWeek, symptoms, blockState } = input;

  const safetyResult = evaluateSafetyGate(symptoms);
  const { safetyFlag, reasons: safetyReasons } = safetyResult;

  const { block, selectionReasons } = selectBlock(phase, stage, dayOfWeek, blockState, safetyFlag);

  const doseResult = buildSessionFromBlock(block, safetyFlag, phase);

  const session = {
    title: block.title,
    sessionType: block.sessionType,
    exercises: doseResult.exercises,
  };

  const allReasons = [...safetyReasons, ...selectionReasons];

  return {
    safetyFlag,
    session,
    caps: doseResult.caps,
    adaptationsApplied: doseResult.adaptations,
    reasons: allReasons,
    meta: {
      phase,
      stage,
      blockId: block.id,
      dayOfWeek,
    },
  };
}
