import exerciseDataset from "../engine/data/exerciseDecisionDataset.json";

type SafetyStatus = "GREEN" | "YELLOW" | "RED";
type SessionLevel = "VERY_LOW" | "LOW" | "MEDIUM";
type IntensityTier = "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH";

interface SafetyBlueprint {
  lymphNodeRemoved?: boolean;
  lymphRegion?: string;
  postOpShoulderLimit?: boolean;
  neuropathy?: boolean;
  boneRisk?: boolean;
}

interface TodayStateInput {
  safetyStatus: SafetyStatus;
  sessionLevel: SessionLevel;
  readinessScore: number;
  sideEffects: string[];
  energy: number;
  pain: number;
  confidence: number;
}

interface ExerciseData {
  id: string;
  name: string;
  phase: string[];
  stage: string;
  type: string;
  region: string;
  intensity: IntensityTier;
  equipment: string;
  lymphSafe: boolean;
  postOpShoulderSafe: boolean;
  movementPattern: string;
  videoUrl?: string;
  notes: string;
}

interface SessionItem {
  order: number;
  exerciseId: string;
  source: "CATALOG" | "DB";
  name: string;
  dosageType: "TIME" | "REPS";
  durationSeconds?: number;
  reps?: number;
  sets: number;
  rpeTarget?: number;
  notes: string;
}

interface GeneratedSession {
  date: string;
  safetyStatus: SafetyStatus;
  sessionLevel: SessionLevel;
  focusTags: string[];
  explainWhy: string;
  totalDurationMin: number;
  items: SessionItem[];
}

const INTENSITY_ORDER: IntensityTier[] = ["VERY_LOW", "LOW", "MEDIUM", "HIGH"];
const exercises = exerciseDataset as ExerciseData[];

function getIntensityCap(level: SessionLevel): IntensityTier {
  switch (level) {
    case "VERY_LOW": return "VERY_LOW";
    case "LOW": return "LOW";
    case "MEDIUM": return "MEDIUM";
  }
}

function isIntensityAllowed(exerciseIntensity: IntensityTier, cap: IntensityTier): boolean {
  return INTENSITY_ORDER.indexOf(exerciseIntensity) <= INTENSITY_ORDER.indexOf(cap);
}

function selectFocusTags(state: TodayStateInput, blueprint: SafetyBlueprint): string[] {
  const { energy, pain, sideEffects } = state;
  
  if (energy <= 4) return ["circulation", "mobility"];
  if (pain >= 6) return ["comfort_mobility", "downshift"];
  if (blueprint.postOpShoulderLimit || blueprint.lymphNodeRemoved) {
    return ["shoulder_mobility", "circulation"];
  }
  if (sideEffects.includes("nausea") || sideEffects.includes("sleep_poor")) {
    return ["circulation", "downshift"];
  }
  return ["mobility", "gentle_strength"];
}

function filterExercises(
  level: SessionLevel,
  blueprint: SafetyBlueprint,
  sideEffects: string[]
): ExerciseData[] {
  const cap = getIntensityCap(level);
  const hasDizziness = sideEffects.includes("dizziness_mild");
  const hasNeuropathy = sideEffects.includes("neuropathy_flare") || blueprint.neuropathy;
  const hasBoneRisk = blueprint.boneRisk;
  const hasShoulderLimit = blueprint.postOpShoulderLimit;
  const hasLymphRisk = blueprint.lymphNodeRemoved;

  return exercises.filter(ex => {
    if (!isIntensityAllowed(ex.intensity, cap)) return false;
    
    if (hasLymphRisk && !ex.lymphSafe) return false;
    if (hasShoulderLimit && !ex.postOpShoulderSafe) return false;
    
    if (hasDizziness) {
      const avoidPatterns = ["BALANCE", "FLOOR_TO_STAND", "FAST_TRANSITION"];
      if (avoidPatterns.some(p => ex.movementPattern.includes(p))) return false;
    }
    
    if (hasNeuropathy) {
      const avoidPatterns = ["BALANCE", "SINGLE_LEG"];
      if (avoidPatterns.some(p => ex.movementPattern.includes(p))) return false;
    }
    
    if (hasBoneRisk) {
      if (ex.movementPattern.includes("IMPACT") || ex.movementPattern.includes("JUMP")) return false;
    }
    
    return true;
  });
}

function selectExercisesByType(
  filtered: ExerciseData[],
  type: string,
  count: number,
  exclude: Set<string>
): ExerciseData[] {
  const candidates = filtered.filter(ex => ex.type === type && !exclude.has(ex.id));
  return candidates.slice(0, count);
}

function buildBreathingItem(order: number): SessionItem {
  const breathing = exercises.find(e => e.type === "BREATHING") || {
    id: "breathing-reset",
    name: "Breathing Reset",
  };
  return {
    order,
    exerciseId: breathing.id,
    source: "CATALOG",
    name: breathing.name || "Breathing Reset",
    dosageType: "TIME",
    durationSeconds: 60,
    sets: 1,
    notes: "Deep belly breaths. 4 seconds in, 6 seconds out.",
  };
}

function buildCirculationItem(order: number, durationSeconds: number): SessionItem {
  const circulation = exercises.find(e => 
    e.type === "CARDIO" || e.movementPattern.includes("MARCH")
  ) || { id: "seated-march", name: "Seated Marches" };
  return {
    order,
    exerciseId: circulation.id,
    source: "CATALOG",
    name: circulation.name || "Gentle Circulation",
    dosageType: "TIME",
    durationSeconds,
    sets: 1,
    notes: "Keep it comfortable. Breathe naturally.",
  };
}

function buildMobilityItems(
  filtered: ExerciseData[],
  count: number,
  startOrder: number,
  level: SessionLevel
): SessionItem[] {
  const mobility = selectExercisesByType(filtered, "MOBILITY", count, new Set());
  return mobility.map((ex, i) => ({
    order: startOrder + i,
    exerciseId: ex.id,
    source: "CATALOG" as const,
    name: ex.name,
    dosageType: "TIME" as const,
    durationSeconds: level === "VERY_LOW" ? 30 : 45,
    sets: 1,
    notes: ex.notes || "Move within comfort. No forcing.",
  }));
}

function buildStrengthItems(
  filtered: ExerciseData[],
  count: number,
  startOrder: number,
  level: SessionLevel,
  excludePatterns: Set<string>
): SessionItem[] {
  const strength = filtered
    .filter(ex => ex.type === "STRENGTH" && !excludePatterns.has(ex.movementPattern))
    .slice(0, count);

  const setsPerLevel = { VERY_LOW: 1, LOW: 2, MEDIUM: 2 };
  const repsPerLevel = { VERY_LOW: 6, LOW: 8, MEDIUM: 10 };

  return strength.map((ex, i) => {
    excludePatterns.add(ex.movementPattern);
    return {
      order: startOrder + i,
      exerciseId: ex.id,
      source: "CATALOG" as const,
      name: ex.name,
      dosageType: "REPS" as const,
      reps: repsPerLevel[level],
      sets: setsPerLevel[level],
      rpeTarget: level === "VERY_LOW" ? 3 : 4,
      notes: ex.notes || "Comfortable range. Stop if sharp pain.",
    };
  });
}

function buildDownshiftItem(order: number, durationSeconds: number): SessionItem {
  return {
    order,
    exerciseId: "downshift",
    source: "CATALOG",
    name: "Calm Down / Easy Stretch",
    dosageType: "TIME",
    durationSeconds,
    sets: 1,
    notes: "Let your body settle. Slow breathing.",
  };
}

function generateExplainWhy(
  state: TodayStateInput,
  focusTags: string[]
): string {
  const { safetyStatus, energy, pain, sideEffects } = state;
  
  if (safetyStatus === "RED") {
    return "We're pausing your regular session today for safety. Please check with your medical team before continuing with exercise.";
  }

  const drivers: string[] = [];
  
  if (energy <= 4) drivers.push("lower energy");
  if (pain >= 6) drivers.push("some discomfort");
  if (sideEffects.includes("nausea")) drivers.push("nausea");
  if (sideEffects.includes("dizziness_mild")) drivers.push("mild dizziness");
  if (sideEffects.includes("sleep_poor")) drivers.push("poor sleep");

  const focusText = focusTags.map(t => t.replace(/_/g, " ")).join(" and ");

  if (drivers.length === 0) {
    return `You're in a good place today. This session focuses on ${focusText} to support your ongoing progress.`;
  }

  const driverText = drivers.slice(0, 2).join(" and ");
  return `We're keeping things gentle today because of ${driverText}. This session focuses on ${focusText} to support your body comfortably.`;
}

function estimateDuration(items: SessionItem[]): number {
  let totalSeconds = 0;
  for (const item of items) {
    if (item.durationSeconds) {
      totalSeconds += item.durationSeconds * item.sets;
    } else if (item.reps) {
      totalSeconds += item.reps * item.sets * 4;
    }
  }
  return Math.round(totalSeconds / 60);
}

export function generateSession(
  date: string,
  state: TodayStateInput,
  blueprint: SafetyBlueprint
): GeneratedSession {
  const { safetyStatus, sessionLevel, pain, confidence, sideEffects } = state;

  if (safetyStatus === "RED") {
    const items: SessionItem[] = [buildBreathingItem(1)];
    items[0].notes = "Only if comfortable. Focus on calm breathing.";
    
    return {
      date,
      safetyStatus,
      sessionLevel: "VERY_LOW",
      focusTags: ["pause", "rest"],
      explainWhy: generateExplainWhy(state, ["pause", "rest"]),
      totalDurationMin: 1,
      items,
    };
  }

  const focusTags = selectFocusTags(state, blueprint);
  const filtered = filterExercises(sessionLevel, blueprint, sideEffects);
  const items: SessionItem[] = [];
  let order = 1;
  const usedPatterns = new Set<string>();

  items.push(buildBreathingItem(order++));

  if (sessionLevel === "VERY_LOW") {
    items.push(buildCirculationItem(order++, 120));
    const mobilityItems = buildMobilityItems(filtered, 2, order, sessionLevel);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    if (pain <= 5 && confidence >= 4) {
      const strengthItems = buildStrengthItems(filtered, 1, order, sessionLevel, usedPatterns);
      items.push(...strengthItems);
      order += strengthItems.length;
    }
    
    items.push(buildDownshiftItem(order++, 60));
  } else if (sessionLevel === "LOW") {
    items.push(buildCirculationItem(order++, 180));
    const mobilityItems = buildMobilityItems(filtered, 3, order, sessionLevel);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    const strengthItems = buildStrengthItems(filtered, 2, order, sessionLevel, usedPatterns);
    items.push(...strengthItems);
    order += strengthItems.length;

    items.push(buildDownshiftItem(order++, 90));
  } else {
    items.push(buildCirculationItem(order++, 210));
    const mobilityItems = buildMobilityItems(filtered, 3, order, sessionLevel);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    const strengthItems = buildStrengthItems(filtered, 3, order, sessionLevel, usedPatterns);
    items.push(...strengthItems);
    order += strengthItems.length;

    items.push(buildDownshiftItem(order++, 90));
  }

  return {
    date,
    safetyStatus,
    sessionLevel,
    focusTags,
    explainWhy: generateExplainWhy(state, focusTags),
    totalDurationMin: estimateDuration(items),
    items,
  };
}

export async function getUserSafetyBlueprint(userId: string): Promise<SafetyBlueprint> {
  return {
    lymphNodeRemoved: false,
    lymphRegion: undefined,
    postOpShoulderLimit: false,
    neuropathy: false,
    boneRisk: false,
  };
}
