import type { Exercise, MarkerResult, MarkerKey, PlanVariant, WorkoutBlock, WorkoutExercise } from "../types";
import { buildDose } from "./buildDose";

type SelectionResult = {
  blocks: WorkoutBlock[];
  selectionReasons: string[];
  constraintsApplied: string[];
};

const BLOCK_TYPE_MAP: Array<{ match: RegExp; type: "BREATHING" | "MOBILITY" | "STRENGTH" }> = [
  { match: /WARM_IN|BREATH_RESET|COOLDOWN/i, type: "BREATHING" },
  { match: /MOBILITY/i, type: "MOBILITY" },
  { match: /STRENGTH/i, type: "STRENGTH" },
];

function resolveBlockType(blockKey: string): "BREATHING" | "MOBILITY" | "STRENGTH" {
  for (const mapping of BLOCK_TYPE_MAP) {
    if (mapping.match.test(blockKey)) return mapping.type;
  }
  return "MOBILITY";
}

function normalize(value?: string | null): string {
  return (value || "").toUpperCase();
}

function getRegionTargets(painLocations: string[]): string[] {
  const targets: string[] = [];
  if (painLocations.includes("SHOULDER") || painLocations.includes("NECK")) targets.push("UPPER");
  if (painLocations.includes("BACK")) targets.push("CORE", "UPPER");
  if (painLocations.includes("KNEE") || painLocations.includes("HIP") || painLocations.includes("FOOT")) targets.push("LOWER");
  return targets;
}

type MarkerSignals = {
  latest?: Partial<Record<MarkerKey, MarkerResult>>;
};

function markerTagMatch(ex: Exercise, markerTag: string, fallbackName: RegExp): boolean {
  const tags = (ex.tags || []).map(tag => tag.toUpperCase());
  if (tags.includes(markerTag)) return true;
  return fallbackName.test(ex.name.toUpperCase());
}

function getMarkerAdjustment(latest?: Partial<Record<MarkerKey, MarkerResult>>) {
  return {
    sitToStand: latest?.SIT_TO_STAND?.rating,
    sitToStandReps: latest?.SIT_TO_STAND?.comfortableReps,
    march: latest?.SUPPORTED_MARCH?.rating,
    marchSide: latest?.SUPPORTED_MARCH?.side,
    shoulder: latest?.SHOULDER_RAISE?.rating,
  };
}

export function selectExercises(
  blocks: Array<Omit<WorkoutBlock, "exercises"> & { exerciseCount: number }>,
  exercises: Exercise[],
  variant: PlanVariant,
  painLocations: string[],
  markerSignals?: MarkerSignals
): SelectionResult {
  const pool = [...exercises];
  const usedIds = new Set<string>();
  const usedPatterns = new Set<string>();
  const selectionReasons: string[] = [];
  const markerReasons: string[] = [];
  const constraintsApplied: string[] = [];
  const regionTargets = getRegionTargets(painLocations.map(normalize));
  const markerAdjustment = getMarkerAdjustment(markerSignals?.latest);

  const scoreExercise = (ex: Exercise, desiredType: string): number => {
    let score = 0;
    if (normalize(ex.type) === desiredType) score += 5;
    if (regionTargets.length > 0 && regionTargets.includes(normalize(ex.region))) score += 3;
    if (variant === "RESET" && normalize(ex.intensity_tier) === "VERY_LOW") score += 2;

    const pattern = normalize(ex.movement_pattern);
    if (markerAdjustment.sitToStand === "HARD" || (markerAdjustment.sitToStandReps != null && markerAdjustment.sitToStandReps <= 2)) {
      if (["SQUAT", "LUNGE", "STEP_UP"].includes(pattern)) score -= 4;
      if (["HIP_HINGE", "BRIDGE", "GLUTE"].includes(pattern)) score += 2;
      if (["SUPPORTED", "BILATERAL"].some(key => pattern.includes(key))) score += 2;
    }
    if (markerAdjustment.sitToStandReps === 5 && markerAdjustment.sitToStand === "EASY") {
      if (normalize(ex.type) === "STRENGTH") score += 2;
    }
    if (markerAdjustment.march === "HARD") {
      if (normalize(ex.balance_demand) === "HIGH") score -= 4;
      if (pattern.includes("SINGLE")) score -= 3;
      if (["BILATERAL", "SUPPORTED"].some(key => pattern.includes(key))) score += 2;
    }
    if (markerAdjustment.shoulder === "HARD") {
      if (["OVERHEAD", "PRESS"].some(key => pattern.includes(key))) score -= 4;
      if (["ROW", "PULL"].some(key => pattern.includes(key))) score += 2;
    }

    return score;
  };

  const blocksResult = blocks.map(block => {
    const selected: WorkoutExercise[] = [];
    const desiredType = resolveBlockType(block.blockKey);
    const isMarkerBlock = block.blockKey.startsWith("MARKER_");

    if (isMarkerBlock) {
      const markerKey = block.blockKey.replace("MARKER_", "");
      const markerPool = pool.filter(ex => {
        if (markerKey === "SIT_TO_STAND") {
          return markerTagMatch(ex, "MARKER_SIT_TO_STAND", /SIT TO STAND/);
        }
        if (markerKey === "SUPPORTED_MARCH") {
          return markerTagMatch(ex, "MARKER_SUPPORTED_MARCH", /MARCH/);
        }
        if (markerKey === "SHOULDER_RAISE") {
          return markerTagMatch(ex, "MARKER_SHOULDER_RAISE", /SHOULDER|WALL SLIDE/);
        }
        return false;
      });
      const marker = markerPool.sort((a, b) => {
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return a.id.localeCompare(b.id);
      })[0];

      if (marker) {
        usedIds.add(marker.id);
        selected.push({
          exerciseId: marker.id,
          name: marker.name,
          dose: buildDose(variant),
        });
      }

      return {
        blockKey: block.blockKey,
        title: block.title,
        intent: block.intent,
        exercises: selected,
      };
    }
    const candidates = pool
      .filter(ex => normalize(ex.type) === desiredType || (desiredType === "BREATHING" && normalize(ex.type) === "MOBILITY"))
      .sort((a, b) => {
        const scoreDiff = scoreExercise(b, desiredType) - scoreExercise(a, desiredType);
        if (scoreDiff !== 0) return scoreDiff;
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        return a.id.localeCompare(b.id);
      });

    for (const ex of candidates) {
      if (selected.length >= block.exerciseCount) break;
      if (usedIds.has(ex.id)) continue;

      const pattern = normalize(ex.movement_pattern);
      if (pattern && usedPatterns.has(pattern)) {
        continue;
      }

      usedIds.add(ex.id);
      if (pattern) usedPatterns.add(pattern);

      const dose = buildDose(variant);
      if (desiredType === "STRENGTH" && (markerAdjustment.sitToStand === "HARD" || (markerAdjustment.sitToStandReps != null && markerAdjustment.sitToStandReps <= 2))) {
        dose.sets = Math.max(1, dose.sets - 1);
      }
      selected.push({
        exerciseId: ex.id,
        name: ex.name,
        dose,
      });

      if (selectionReasons.length < 3) {
        const reasons: string[] = [];
        if (normalize(ex.type) === desiredType) reasons.push(`Type match: ${desiredType}`);
        if (regionTargets.length > 0 && regionTargets.includes(normalize(ex.region))) reasons.push(`Region match: ${ex.region}`);
        if (reasons.length > 0) selectionReasons.push(reasons.join(", "));
      }
    }

    if (selected.length < block.exerciseCount) {
      const remaining = candidates.filter(ex => !usedIds.has(ex.id));
      for (const ex of remaining) {
        if (selected.length >= block.exerciseCount) break;
        usedIds.add(ex.id);
        const pattern = normalize(ex.movement_pattern);
        if (pattern) usedPatterns.add(pattern);
        const dose = buildDose(variant);
        if (desiredType === "STRENGTH" && (markerAdjustment.sitToStand === "HARD" || (markerAdjustment.sitToStandReps != null && markerAdjustment.sitToStandReps <= 2))) {
          dose.sets = Math.max(1, dose.sets - 1);
        }
        selected.push({ exerciseId: ex.id, name: ex.name, dose });
      }
      if (remaining.length > 0) {
        constraintsApplied.push("Movement pattern repeated due to limited pool");
      }
    }

    return {
      blockKey: block.blockKey,
      title: block.title,
      intent: block.intent,
      exercises: selected,
    };
  });

  if (markerAdjustment.sitToStand === "HARD" || (markerAdjustment.sitToStandReps != null && markerAdjustment.sitToStandReps <= 2)) {
    markerReasons.push("Lower-body load adjusted based on comfortable reps today.");
    constraintsApplied.push("Marker-based adaptation applied");
  }
  if (markerAdjustment.sitToStandReps === 5 && markerAdjustment.sitToStand === "EASY") {
    markerReasons.push("Strength progression allowed based on comfortable tolerance.");
    constraintsApplied.push("Marker-based adaptation applied");
  }
  if (markerAdjustment.march === "HARD") {
    markerReasons.push("Prioritised supported balance work due to march marker feedback.");
    constraintsApplied.push("Marker-based adaptation applied");
    if (markerAdjustment.marchSide && markerAdjustment.marchSide !== "NOT_SURE") {
      markerReasons.unshift(`Extra support for ${markerAdjustment.marchSide.toLowerCase()} side today.`);
    }
  }
  if (markerAdjustment.shoulder === "HARD") {
    markerReasons.push("Reduced shoulder loading after marker move felt HARD.");
    constraintsApplied.push("Marker-based adaptation applied");
  }

  const mergedReasons = [...markerReasons, ...selectionReasons];
  return { blocks: blocksResult, selectionReasons: mergedReasons, constraintsApplied };
}
