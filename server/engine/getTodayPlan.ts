import { TodayPlanInput, TodayPlanOutput, SafetyFlag } from './types';
import { evaluateSafetyGate } from './safetyGate';
import { buildSessionFromBlock } from './doseSelector';
import { Block } from './blocks/blockTypes';
import {
  getBlockById,
  getDefaultBlockForPhase,
  getRecoveryBlockForPhase,
} from './blocks/blocksCatalog';

function selectBlock(
  phase: TodayPlanInput['phase'],
  stage: TodayPlanInput['stage'],
  dayOfWeek: number,
  blockState: TodayPlanInput['blockState'],
  safetyFlag: SafetyFlag
): Block {
  if (safetyFlag === "RED") {
    const recoveryBlock = getRecoveryBlockForPhase(phase);
    if (recoveryBlock) {
      return recoveryBlock;
    }
  }

  if (blockState?.blockId) {
    const existingBlock = getBlockById(blockState.blockId);
    if (existingBlock && existingBlock.phase === phase) {
      return existingBlock;
    }
  }

  const defaultBlock = getDefaultBlockForPhase(phase);
  if (defaultBlock) {
    return defaultBlock;
  }

  throw new Error(`No block found for phase: ${phase}`);
}

export function getTodayPlan(input: TodayPlanInput): TodayPlanOutput {
  const { phase, stage, dayOfWeek, symptoms, blockState } = input;

  const safetyResult = evaluateSafetyGate(symptoms);
  const { safetyFlag, reasons } = safetyResult;

  const block = selectBlock(phase, stage, dayOfWeek, blockState, safetyFlag);

  const doseResult = buildSessionFromBlock(block, safetyFlag, phase);

  const session = {
    title: block.title,
    sessionType: block.sessionType,
    exercises: doseResult.exercises,
  };

  return {
    safetyFlag,
    session,
    caps: doseResult.caps,
    adaptationsApplied: doseResult.adaptations,
    reasons,
    meta: {
      phase,
      stage,
      blockId: block.id,
      dayOfWeek,
    },
  };
}
