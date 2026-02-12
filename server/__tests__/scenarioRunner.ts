import type { CheckinMode, LastAdjustment } from "./scenarioFixtures";
import { decideMode } from "../services/sessionGeneratorService";

export type EngineResult = {
  mode: CheckinMode;
  explanation: string;
  modeDecision: { finalMode: CheckinMode; checkinMode: CheckinMode; capFromLastSession: CheckinMode; explanation: string };
  reasons?: string[];
};

/**
 * Runs the real adaptive engine for a scenario day.
 * Calls decideMode() from sessionGeneratorService (no DB required).
 */
export function runEngineForDay(input: {
  checkinMode: CheckinMode;
  lastAdjustmentFromPrevSession?: LastAdjustment;
}): EngineResult {
  const result = decideMode(input.checkinMode, input.lastAdjustmentFromPrevSession);
  return {
    mode: result.finalMode,
    explanation: result.explanation,
    modeDecision: {
      finalMode: result.finalMode,
      checkinMode: result.checkinMode,
      capFromLastSession: result.capFromLastSession,
      explanation: result.explanation,
    },
    reasons: result.reasons,
  };
}
