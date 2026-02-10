import type { Exercise } from "../types";

type FilterResult = { exercises: Exercise[]; constraintsApplied: string[] };

export function applyPainFilters(exercises: Exercise[], pain010: number): FilterResult {
  const constraintsApplied: string[] = [];
  if (pain010 < 7) {
    return { exercises, constraintsApplied };
  }

  const before = exercises.length;
  const filtered = exercises.filter(ex => {
    const type = ex.type?.toUpperCase();
    return ex.intensity_tier !== "HIGH" && type !== "STRENGTH";
  });
  if (filtered.length !== before) {
    constraintsApplied.push("High pain filter");
  }

  return { exercises: filtered, constraintsApplied };
}
