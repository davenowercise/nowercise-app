import { SessionOutput, Symptoms, SafetyFlag, RepRange } from './types';

export {
  calculateSymptomSeverity,
} from '../progression-backbone';

export interface SymptomAdaptationResult {
  session: SessionOutput;
  reasons: string[];
  safetyOverride?: SafetyFlag;
}

function appendNote(existing: string | undefined, addition: string): string {
  if (!existing) return addition;
  if (existing.includes(addition)) return existing;
  return `${existing} ${addition}`;
}

function resolveRepRange(
  repsSuggested: number | RepRange,
  repRange?: RepRange
): RepRange | undefined {
  if (repRange) return repRange;
  if (typeof repsSuggested === 'object') {
    return repsSuggested;
  }
  return undefined;
}

function clampReps(repsSuggested: number, min: number, max?: number): number {
  if (max !== undefined) {
    return Math.max(min, Math.min(repsSuggested, max));
  }
  return Math.max(min, repsSuggested);
}

export function adaptSessionForSymptoms(
  session: SessionOutput,
  symptoms: Symptoms
): SymptomAdaptationResult {
  const reasons: string[] = [];
  let safetyOverride: SafetyFlag | undefined;

  const fatigue = Math.max(0, Math.min(symptoms.fatigue, 10));
  const pain = Math.max(0, Math.min(symptoms.pain, 10));
  const anxiety = Math.max(0, Math.min(symptoms.anxiety, 10));

  const hasSevere = fatigue >= 8 || pain >= 8;
  const hasModerate = fatigue >= 6 || pain >= 6 || anxiety >= 7;
  const hasMild = fatigue >= 4 || pain >= 4 || anxiety >= 5;

  if (hasSevere) {
    safetyOverride = "RED";
  } else if (hasModerate) {
    safetyOverride = "AMBER";
  }

  const adaptedExercises = session.exercises.map((exercise) => {
    const adapted = { ...exercise };
    const range = resolveRepRange(adapted.repsSuggested, adapted.repRange);

    if (fatigue >= 8) {
      adapted.setsSuggested = 1;
      if (typeof adapted.repsSuggested === 'number') {
        const current = adapted.repsSuggested;
        const target = Math.max(1, Math.floor(current * 0.5));
        const min = range?.min ?? 1;
        const max = range?.max;
        adapted.repsSuggested = clampReps(target, min, max);
      }
      adapted.notes = appendNote(adapted.notes, "Keep it very light and stop early if needed.");
    } else if (fatigue >= 6) {
      adapted.setsSuggested = Math.max(1, adapted.setsSuggested - 1);
      if (typeof adapted.repsSuggested === 'number') {
        const current = adapted.repsSuggested;
        const target = Math.max(1, Math.floor(current * 0.7));
        const min = range?.min ?? 1;
        const max = range?.max;
        adapted.repsSuggested = clampReps(target, min, max);
      }
      adapted.notes = appendNote(adapted.notes, "Ease back on effort today.");
    }

    if (pain >= 8) {
      if (typeof adapted.repsSuggested === 'number') {
        const current = adapted.repsSuggested;
        const target = Math.max(1, Math.floor(current * 0.5));
        const min = range?.min ?? 1;
        const max = range?.max;
        adapted.repsSuggested = clampReps(target, min, max);
      }
      adapted.notes = appendNote(adapted.notes, "Stay in a pain-free range and move slowly.");
    } else if (pain >= 6) {
      if (typeof adapted.repsSuggested === 'number') {
        const current = adapted.repsSuggested;
        const target = Math.max(1, Math.floor(current * 0.7));
        const min = range?.min ?? 1;
        const max = range?.max;
        adapted.repsSuggested = clampReps(target, min, max);
      }
      adapted.notes = appendNote(adapted.notes, "Prioritize comfort and range of motion.");
    }

    if (anxiety >= 7) {
      adapted.notes = appendNote(adapted.notes, "Slow the tempo and add extra rest between sets.");
    } else if (anxiety >= 5) {
      adapted.notes = appendNote(adapted.notes, "Steady breathing and smooth tempo.");
    }

    return adapted;
  });

  if (fatigue >= 8) {
    reasons.push("High fatigue - reduced sets and reps to keep effort gentle.");
  } else if (fatigue >= 6) {
    reasons.push("Moderate fatigue - trimmed sets and reps slightly.");
  }

  if (pain >= 8) {
    reasons.push("High pain - staying in a pain-free range with low volume.");
  } else if (pain >= 6) {
    reasons.push("Moderate pain - lowering volume and emphasizing range of motion.");
  }

  if (anxiety >= 7) {
    reasons.push("Elevated anxiety - added slower pacing and longer rests.");
  } else if (anxiety >= 5) {
    reasons.push("Mild anxiety - reinforced steady breathing and tempo.");
  }

  if (!reasons.length && hasMild) {
    reasons.push("Symptoms noted - keep a steady, comfortable pace.");
  }

  return {
    session: {
      ...session,
      exercises: adaptedExercises,
    },
    reasons,
    safetyOverride,
  };
}
