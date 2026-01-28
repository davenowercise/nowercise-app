export type Phase = "PREHAB" | "IN_TREATMENT" | "POST_TREATMENT";
export type Stage = "EARLY" | "MID" | "LATE";
export type SafetyFlag = "GREEN" | "AMBER" | "RED";
export type SessionType = "STRENGTH" | "MOBILITY" | "AEROBIC" | "RECOVERY";
export type DoseBias = "LOWER_DOSE" | "NORMAL";

export interface Symptoms {
  fatigue: number; // 0-10
  pain: number; // 0-10
  anxiety: number; // 0-10
}

export interface BlockState {
  blockId: string;
  weekInBlock: number;
  sessionsCompletedInBlock: number;
}

export interface TodayPlanInput {
  userId?: string;
  phase: Phase;
  stage: Stage;
  dayOfWeek: number;
  symptoms: Symptoms;
  blockState?: BlockState;
}

export interface RepRange {
  min: number;
  max: number;
}

export interface ExerciseOutput {
  id: string;
  name: string;
  setsSuggested: number;
  repsSuggested: number | RepRange;
  repRange?: RepRange;
  notes?: string;
}

export interface SessionOutput {
  title: string;
  sessionType: SessionType;
  exercises: ExerciseOutput[];
}

export interface Caps {
  intensityRPEMax: number;
  durationMinutesMax: number;
}

export interface TodayPlanOutput {
  safetyFlag: SafetyFlag;
  session: SessionOutput;
  caps: Caps;
  adaptationsApplied: string[];
  reasons: string[];
  meta: {
    phase: Phase;
    stage: Stage;
    blockId: string;
    dayOfWeek: number;
  };
}

export interface SafetyGateResult {
  safetyFlag: SafetyFlag;
  reasons: string[];
  suggestedBias: DoseBias;
}
