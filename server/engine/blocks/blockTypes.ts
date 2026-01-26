import { Phase, Stage, SessionType, RepRange } from '../types';

export interface BlockExercise {
  id: string;
  name: string;
  setRange: RepRange;
  repRange: RepRange;
  notes?: string;
}

export interface Block {
  id: string;
  title: string;
  phase: Phase;
  stageMin?: Stage;
  stageMax?: Stage;
  daysPerWeekTarget: number;
  sessionType: SessionType;
  exercises: BlockExercise[];
  isRecoveryBlock?: boolean;
}
