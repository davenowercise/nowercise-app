import type { Exercise, GenerateTodayPlanInput, PlanVariant } from "../types";

type FilterResult = { exercises: Exercise[]; constraintsApplied: string[] };

const PHASE_MAP: Record<string, string> = {
  PREHAB: "PREHAB",
  IN_TREATMENT: "IN_TREATMENT",
  POST_TREATMENT: "POST_TREATMENT",
};

const INTENSITY_CAPS: Record<PlanVariant, Array<Exercise["intensity_tier"]>> = {
  RESET: ["VERY_LOW", "LOW"],
  EASIER: ["LOW", "MODERATE"],
  MAIN: ["VERY_LOW", "LOW", "MODERATE"],
};

function normalizeFlag(value?: string | boolean): string | undefined {
  if (typeof value === "boolean") return value ? "YES" : "NO";
  if (!value) return undefined;
  return String(value).toUpperCase();
}

function isEarlyStage(input: GenerateTodayPlanInput): boolean {
  const surgeryDate = input.user.treatment?.surgeryDateISO;
  if (surgeryDate) {
    const days = (Date.now() - new Date(surgeryDate).getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 0 && days <= 42) return true;
  }
  const chemoWeek = input.user.treatment?.chemoWeek;
  if (chemoWeek && chemoWeek <= 2) return true;
  return false;
}

function stageScore(stage?: string): number {
  const normalized = stage ? stage.toUpperCase() : "";
  if (normalized === "EARLY") return 0;
  if (normalized === "MID") return 1;
  if (normalized === "LATE") return 2;
  return 3;
}

export function applySafetyFilters(
  exercises: Exercise[],
  input: GenerateTodayPlanInput,
  variant: PlanVariant
): FilterResult {
  const constraintsApplied: string[] = [];
  const phase = PHASE_MAP[input.user.safety.phase];
  const earlyStage = isEarlyStage(input);
  const equipmentAllowed = input.user.preferences?.equipmentAvailable?.map(item => item.toUpperCase());
  const intensityCap = INTENSITY_CAPS[variant];

  let filtered = exercises.filter(ex => {
    const exPhase = ex.phase?.toUpperCase();
    if (exPhase && exPhase !== "ALL" && exPhase !== phase) return false;
    return true;
  });
  if (filtered.length !== exercises.length) {
    constraintsApplied.push("Phase filter");
  }

  if (earlyStage) {
    const before = filtered.length;
    filtered = filtered.filter(ex => {
      const stage = ex.stage?.toUpperCase();
      return !stage || stage === "ALL" || stage === "EARLY";
    });
    if (filtered.length !== before) {
      constraintsApplied.push("Early stage recovery filter");
    }
  }

  const beforeIntensity = filtered.length;
  filtered = filtered.filter(ex => !ex.intensity_tier || intensityCap.includes(ex.intensity_tier));
  if (filtered.length !== beforeIntensity) {
    constraintsApplied.push("Intensity cap by plan variant");
  }

  const beforeEquipment = filtered.length;
  filtered = filtered.filter(ex => {
    const equipment = ex.equipment?.toUpperCase();
    if (!equipment) return true;
    if (equipmentAllowed && equipmentAllowed.length > 0) {
      return equipment === "NONE" || equipmentAllowed.includes(equipment as any);
    }
    return equipment === "NONE" || equipment === "CHAIR";
  });
  if (filtered.length !== beforeEquipment) {
    constraintsApplied.push("Equipment availability filter");
  }

  if (input.user.safety.lymphLoadRisk === "HIGH") {
    const before = filtered.length;
    filtered = filtered.filter(ex => normalizeFlag(ex.lymph_safe) === "YES");
    if (filtered.length !== before) {
      constraintsApplied.push("Lymph-safe required");
    }
  }

  if (input.user.safety.postOpShoulderRisk && input.user.safety.postOpShoulderRisk !== "NONE") {
    const before = filtered.length;
    filtered = filtered.filter(ex => normalizeFlag(ex.post_op_shoulder_safe) === "YES");
    if (filtered.length !== before) {
      constraintsApplied.push("Post-op shoulder safety filter");
    }
  }

  if (input.user.safety.neuropathyRisk === "MODERATE" || input.user.safety.neuropathyRisk === "HIGH") {
    const before = filtered.length;
    filtered = filtered.filter(ex => ex.balance_demand?.toUpperCase() !== "HIGH");
    if (filtered.length !== before) {
      constraintsApplied.push("Balance demand capped");
    }
  }

  filtered.sort((a, b) => {
    const stageCompare = earlyStage ? 0 : stageScore(a.stage) - stageScore(b.stage);
    if (stageCompare !== 0) return stageCompare;
    const nameCompare = a.name.localeCompare(b.name);
    if (nameCompare !== 0) return nameCompare;
    return a.id.localeCompare(b.id);
  });

  return { exercises: filtered, constraintsApplied };
}
