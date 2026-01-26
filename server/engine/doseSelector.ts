import { Phase, SafetyFlag, Caps, ExerciseOutput } from './types';
import { Block, BlockExercise } from './blocks/blockTypes';

export interface DoseResult {
  exercises: ExerciseOutput[];
  caps: Caps;
  adaptations: string[];
}

function getPhraseCaps(phase: Phase, safetyFlag: SafetyFlag): Caps {
  const baseCaps: Record<Phase, Caps> = {
    PREHAB: { intensityRPEMax: 7, durationMinutesMax: 40 },
    IN_TREATMENT: { intensityRPEMax: 6, durationMinutesMax: 25 },
    POST_TREATMENT: { intensityRPEMax: 7, durationMinutesMax: 45 },
  };

  const caps = { ...baseCaps[phase] };

  if (safetyFlag === "RED") {
    caps.intensityRPEMax = Math.min(caps.intensityRPEMax, 4);
    caps.durationMinutesMax = Math.min(caps.durationMinutesMax, 15);
  } else if (safetyFlag === "AMBER") {
    caps.intensityRPEMax = Math.min(caps.intensityRPEMax - 1, 5);
    caps.durationMinutesMax = Math.min(caps.durationMinutesMax - 10, caps.durationMinutesMax);
  }

  return caps;
}

function selectDoseForExercise(
  exercise: BlockExercise,
  safetyFlag: SafetyFlag
): { setsSuggested: number; repsSuggested: number; notes?: string } {
  const { setRange, repRange } = exercise;

  if (safetyFlag === "GREEN") {
    const setsSuggested = Math.round((setRange.min + setRange.max) / 2);
    const repsSuggested = repRange.max;
    return { setsSuggested, repsSuggested };
  }

  if (safetyFlag === "AMBER") {
    const setsSuggested = setRange.min;
    const repsSuggested = repRange.min;
    return {
      setsSuggested,
      repsSuggested,
      notes: "Stay toward the lower end today"
    };
  }

  const setsSuggested = 1;
  const repsSuggested = repRange.min;
  return {
    setsSuggested,
    repsSuggested,
    notes: "Recovery focus - minimal effort"
  };
}

export function buildSessionFromBlock(
  block: Block,
  safetyFlag: SafetyFlag,
  phase: Phase
): DoseResult {
  const adaptations: string[] = [];
  const exercises: ExerciseOutput[] = [];

  for (const exercise of block.exercises) {
    const dose = selectDoseForExercise(exercise, safetyFlag);
    
    const exerciseOutput: ExerciseOutput = {
      id: exercise.id,
      name: exercise.name,
      setsSuggested: dose.setsSuggested,
      repsSuggested: dose.repsSuggested,
      repRange: exercise.repRange,
    };

    if (dose.notes) {
      exerciseOutput.notes = dose.notes;
    } else if (exercise.notes) {
      exerciseOutput.notes = exercise.notes;
    }

    exercises.push(exerciseOutput);
  }

  if (safetyFlag === "AMBER") {
    adaptations.push("Reduced sets due to elevated symptoms");
    adaptations.push("Kept reps at lower end of range");
  } else if (safetyFlag === "RED") {
    adaptations.push("Switched to recovery-focused session");
    adaptations.push("Minimal sets and reps for gentle movement only");
  } else {
    adaptations.push("Full session with standard dose");
  }

  const caps = getPhraseCaps(phase, safetyFlag);

  return {
    exercises,
    caps,
    adaptations,
  };
}
