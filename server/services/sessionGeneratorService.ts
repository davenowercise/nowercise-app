import exerciseDataset from "../engine/data/exerciseDecisionDataset.json";

type SafetyStatus = "GREEN" | "YELLOW" | "RED";
type SessionLevel = "VERY_LOW" | "LOW" | "MEDIUM";
type IntensityTier = "VERY_LOW" | "LOW" | "MODERATE" | "HIGH";

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
  balanceDemand: "LOW" | "MODERATE" | "HIGH";
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
  videoUrl?: string;
}

interface GeneratedSession {
  date: string;
  safetyStatus: SafetyStatus;
  sessionLevel: SessionLevel;
  focusTags: string[];
  explainWhy: string;
  totalDurationMin: number;
  items: SessionItem[];
  dayType: "ACTIVE" | "REST" | "BREATH_ONLY";
}

const INTENSITY_ORDER: IntensityTier[] = ["VERY_LOW", "LOW", "MODERATE", "HIGH"];

// CRITICAL: Only use exercises with valid video URLs
const allExercises = exerciseDataset as ExerciseData[];
const exercises = allExercises.filter(ex => ex.videoUrl && ex.videoUrl.startsWith("https://"));

console.log(`[SessionGenerator] Loaded ${exercises.length} exercises with video URLs (out of ${allExercises.length} total)`);

function getIntensityCap(level: SessionLevel): IntensityTier {
  switch (level) {
    case "VERY_LOW": return "VERY_LOW";
    case "LOW": return "LOW";
    case "MEDIUM": return "MODERATE";
  }
}

function isIntensityAllowed(exerciseIntensity: IntensityTier, cap: IntensityTier): boolean {
  return INTENSITY_ORDER.indexOf(exerciseIntensity) <= INTENSITY_ORDER.indexOf(cap);
}

function selectFocusTags(state: TodayStateInput, blueprint: SafetyBlueprint): string[] {
  const { energy, pain, sideEffects } = state;
  
  if (energy <= 3) return ["breathing", "gentle_mobility"];
  if (pain >= 6) return ["comfort_mobility", "breathing"];
  if (blueprint.postOpShoulderLimit || blueprint.lymphNodeRemoved) {
    return ["shoulder_mobility", "circulation"];
  }
  if (sideEffects.includes("nausea") || sideEffects.includes("sleep_poor")) {
    return ["circulation", "gentle_mobility"];
  }
  return ["mobility", "gentle_strength"];
}

function filterExercises(
  level: SessionLevel,
  blueprint: SafetyBlueprint,
  sideEffects: string[],
  confidence: number = 5,
  fatigue: number = 5
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
    
    // Balance safety filtering
    if (hasNeuropathy || hasDizziness || confidence <= 3) {
      if (ex.balanceDemand !== "LOW") return false;
    }
    
    // Severe fatigue safeguard
    if (fatigue >= 8) {
      if (ex.balanceDemand === "HIGH") return false;
    }
    
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
  // Shuffle for variety
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildBreathingItem(order: number): SessionItem {
  const breathing = exercises.find(e => e.type === "BREATHING");
  if (!breathing) {
    // Fallback if no breathing exercise with video
    return {
      order,
      exerciseId: "breathing-reset",
      source: "CATALOG",
      name: "Breathing Reset",
      dosageType: "TIME",
      durationSeconds: 60,
      sets: 1,
      notes: "Deep belly breaths. 4 seconds in, 6 seconds out.",
    };
  }
  return {
    order,
    exerciseId: breathing.id,
    source: "CATALOG",
    name: breathing.name,
    dosageType: "TIME",
    durationSeconds: 60,
    sets: 1,
    notes: breathing.notes,
    videoUrl: breathing.videoUrl,
  };
}

function buildMobilityItems(
  filtered: ExerciseData[],
  count: number,
  startOrder: number,
  level: SessionLevel,
  exclude: Set<string>
): SessionItem[] {
  const mobility = selectExercisesByType(filtered, "MOBILITY", count, exclude);
  const durations = { VERY_LOW: 45, LOW: 60, MEDIUM: 75 };
  return mobility.map((ex, i) => {
    exclude.add(ex.id);
    return {
      order: startOrder + i,
      exerciseId: ex.id,
      source: "CATALOG" as const,
      name: ex.name,
      dosageType: "TIME" as const,
      durationSeconds: durations[level],
      sets: 1,
      notes: ex.notes,
      videoUrl: ex.videoUrl,
    };
  });
}

function buildStrengthItems(
  filtered: ExerciseData[],
  count: number,
  startOrder: number,
  level: SessionLevel,
  excludePatterns: Set<string>,
  excludeIds: Set<string>
): SessionItem[] {
  const strength = filtered
    .filter(ex => ex.type === "STRENGTH" && !excludePatterns.has(ex.movementPattern) && !excludeIds.has(ex.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  const setsPerLevel = { VERY_LOW: 1, LOW: 2, MEDIUM: 2 };
  const repsPerLevel = { VERY_LOW: 6, LOW: 8, MEDIUM: 10 };

  return strength.map((ex, i) => {
    excludePatterns.add(ex.movementPattern);
    excludeIds.add(ex.id);
    return {
      order: startOrder + i,
      exerciseId: ex.id,
      source: "CATALOG" as const,
      name: ex.name,
      dosageType: "REPS" as const,
      reps: repsPerLevel[level],
      sets: setsPerLevel[level],
      rpeTarget: level === "VERY_LOW" ? 3 : 4,
      notes: ex.notes,
      videoUrl: ex.videoUrl,
    };
  });
}

function buildDownshiftItem(order: number, durationSeconds: number): SessionItem {
  // Find a gentle mobility exercise for cool-down
  const coolDown = exercises.find(e => 
    e.type === "MOBILITY" && e.intensity === "VERY_LOW" && e.movementPattern.includes("MOBILITY")
  );
  return {
    order,
    exerciseId: coolDown?.id || "downshift",
    source: "CATALOG",
    name: coolDown?.name || "Calm Down / Easy Stretch",
    dosageType: "TIME",
    durationSeconds,
    sets: 1,
    notes: coolDown?.notes || "Let your body settle. Slow breathing.",
    videoUrl: coolDown?.videoUrl,
  };
}

function generateExplainWhy(
  state: TodayStateInput,
  focusTags: string[]
): string {
  const { safetyStatus, energy, pain, sideEffects, confidence } = state;
  
  if (safetyStatus === "RED") {
    return "We're pausing your regular session today for safety. Please check with your medical team before continuing with exercise.";
  }

  const drivers: string[] = [];
  
  if (energy <= 3) drivers.push("lower energy");
  if (pain >= 6) drivers.push("some discomfort");
  if (confidence <= 3) drivers.push("wanting to take it easy");
  if (sideEffects.includes("nausea")) drivers.push("nausea");
  if (sideEffects.includes("dizziness_mild")) drivers.push("mild dizziness");
  if (sideEffects.includes("sleep_poor")) drivers.push("poor sleep");

  const focusText = focusTags.map(t => t.replace(/_/g, " ")).join(" and ");

  if (drivers.length === 0) {
    return `Based on how you're feeling today, your body is ready for gentle, steady movement. This session focuses on ${focusText}.`;
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
      totalSeconds += item.reps * item.sets * 5 + (item.sets - 1) * 15;
    }
  }
  return Math.round(totalSeconds / 60);
}

export function generateSession(
  date: string,
  state: TodayStateInput,
  blueprint: SafetyBlueprint
): GeneratedSession {
  const { safetyStatus, sessionLevel, pain, confidence, sideEffects, energy } = state;
  const fatigue = 10 - energy;

  // RED status = rest day
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
      dayType: "BREATH_ONLY",
    };
  }

  // Very low energy or high pain = breath + gentle mobility only
  if (energy <= 3 || pain >= 6) {
    const focusTags = ["breathing", "gentle_mobility"];
    const filtered = filterExercises("VERY_LOW", blueprint, sideEffects, confidence, fatigue);
    const items: SessionItem[] = [];
    const usedIds = new Set<string>();
    let order = 1;

    items.push(buildBreathingItem(order++));
    const mobilityItems = buildMobilityItems(filtered, 2, order, "VERY_LOW", usedIds);
    items.push(...mobilityItems);

    return {
      date,
      safetyStatus,
      sessionLevel: "VERY_LOW",
      focusTags,
      explainWhy: generateExplainWhy(state, focusTags),
      totalDurationMin: estimateDuration(items),
      items,
      dayType: "ACTIVE",
    };
  }

  const focusTags = selectFocusTags(state, blueprint);
  const filtered = filterExercises(sessionLevel, blueprint, sideEffects, confidence, fatigue);
  const items: SessionItem[] = [];
  let order = 1;
  const usedPatterns = new Set<string>();
  const usedIds = new Set<string>();

  // Always start with breathing
  items.push(buildBreathingItem(order++));

  if (sessionLevel === "VERY_LOW") {
    const mobilityItems = buildMobilityItems(filtered, 3, order, sessionLevel, usedIds);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    if (pain <= 5 && confidence >= 4) {
      const strengthItems = buildStrengthItems(filtered, 1, order, sessionLevel, usedPatterns, usedIds);
      items.push(...strengthItems);
      order += strengthItems.length;
    }
    
    items.push(buildDownshiftItem(order++, 60));
  } else if (sessionLevel === "LOW") {
    const mobilityItems = buildMobilityItems(filtered, 3, order, sessionLevel, usedIds);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    const strengthItems = buildStrengthItems(filtered, 2, order, sessionLevel, usedPatterns, usedIds);
    items.push(...strengthItems);
    order += strengthItems.length;

    items.push(buildDownshiftItem(order++, 60));
  } else {
    const mobilityItems = buildMobilityItems(filtered, 4, order, sessionLevel, usedIds);
    items.push(...mobilityItems);
    order += mobilityItems.length;

    const strengthItems = buildStrengthItems(filtered, 3, order, sessionLevel, usedPatterns, usedIds);
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
    dayType: "ACTIVE",
  };
}

// Generate a rest day session (breathing only)
export function generateRestDaySession(date: string): GeneratedSession {
  return {
    date,
    safetyStatus: "GREEN",
    sessionLevel: "VERY_LOW",
    focusTags: ["rest", "recovery"],
    explainWhy: "Today is a rest day. Rest is an important part of recovery — it's when your body rebuilds and grows stronger.",
    totalDurationMin: 0,
    items: [],
    dayType: "REST",
  };
}

// Generate 7-day plan based on check-in state
interface WeeklyPlanDay {
  date: string;
  dayNumber: number;
  dayName: string;
  templateType: "ACTIVE" | "REST" | "BREATH_POSTURE";
  session?: GeneratedSession;
  completed: boolean;
}

export function generate7DayPlan(
  startDate: string,
  state: TodayStateInput,
  blueprint: SafetyBlueprint
): WeeklyPlanDay[] {
  const days: WeeklyPlanDay[] = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // 7-day pattern: Active, Active, Rest, Active, Active, Active, Rest
  const dayTemplates: ("ACTIVE" | "REST" | "BREATH_POSTURE")[] = [
    "ACTIVE", "ACTIVE", "REST", "ACTIVE", "BREATH_POSTURE", "ACTIVE", "REST"
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    
    const templateType = dayTemplates[i];
    let session: GeneratedSession | undefined;

    if (templateType === "ACTIVE") {
      session = generateSession(dateStr, state, blueprint);
    } else if (templateType === "BREATH_POSTURE") {
      // Light breath + posture day
      const breathItem = buildBreathingItem(1);
      const postureExercise = exercises.find(e => 
        e.name.toLowerCase().includes("posture") || 
        (e.type === "MOBILITY" && e.intensity === "VERY_LOW")
      );
      
      const items: SessionItem[] = [breathItem];
      if (postureExercise) {
        items.push({
          order: 2,
          exerciseId: postureExercise.id,
          source: "CATALOG",
          name: postureExercise.name,
          dosageType: "TIME",
          durationSeconds: 60,
          sets: 1,
          notes: postureExercise.notes,
          videoUrl: postureExercise.videoUrl,
        });
      }
      
      session = {
        date: dateStr,
        safetyStatus: "GREEN",
        sessionLevel: "VERY_LOW",
        focusTags: ["breathing", "posture"],
        explainWhy: "A light day focused on breathing and posture. These small movements support your recovery without adding strain.",
        totalDurationMin: estimateDuration(items),
        items,
        dayType: "BREATH_ONLY",
      };
    } else {
      session = generateRestDaySession(dateStr);
    }

    days.push({
      date: dateStr,
      dayNumber: i + 1,
      dayName: dayNames[dayOfWeek],
      templateType,
      session,
      completed: false,
    });
  }

  return days;
}

// Adjust session based on today's check-in
export function adjustSessionForCheckin(
  baseSession: GeneratedSession,
  energy: number,
  pain: number,
  confidence: number,
  sideEffects: string[]
): GeneratedSession {
  // Deep copy
  const session = JSON.parse(JSON.stringify(baseSession)) as GeneratedSession;
  
  // Energy low: reduce to breath + mobility only
  if (energy <= 3) {
    session.items = session.items.filter(item => 
      item.dosageType === "TIME" || 
      exercises.find(e => e.id === item.exerciseId)?.type === "BREATHING"
    ).slice(0, 3);
    session.explainWhy = "Your energy is lower today, so we've simplified your session to gentle movements and breathing.";
    session.totalDurationMin = estimateDuration(session.items);
    return session;
  }

  // High pain: remove strength, keep mobility
  if (pain >= 6) {
    session.items = session.items.filter(item => {
      const ex = exercises.find(e => e.id === item.exerciseId);
      return ex?.type !== "STRENGTH";
    });
    session.explainWhy = "We've adjusted today's session to focus on comfort and gentle movement, given the discomfort you're feeling.";
    session.totalDurationMin = estimateDuration(session.items);
    return session;
  }

  // Low confidence: prefer seated/supported, fewer exercises
  if (confidence <= 3) {
    session.items = session.items.filter(item => {
      const ex = exercises.find(e => e.id === item.exerciseId);
      return !ex || ex.balanceDemand === "LOW";
    }).slice(0, 4);
    session.explainWhy = "We've kept today's session simple with supported movements, so you can feel steady and confident.";
    session.totalDurationMin = estimateDuration(session.items);
    return session;
  }

  return session;
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

export function adjustSessionLevelForFeedback(
  originalLevel: SessionLevel,
  needsLighter: boolean
): SessionLevel {
  if (!needsLighter) return originalLevel;
  
  if (originalLevel === "MEDIUM") return "LOW";
  if (originalLevel === "LOW") return "VERY_LOW";
  return "VERY_LOW";
}

export async function generateSessionWithFeedbackAdjustment(
  date: string,
  state: TodayStateInput,
  blueprint: SafetyBlueprint,
  userId: string
): Promise<GeneratedSession> {
  const { needsLighterSession } = await import("./userStateService");
  const needsLighter = await needsLighterSession(userId);
  
  const adjustedLevel = adjustSessionLevelForFeedback(state.sessionLevel, needsLighter);
  const adjustedState = { ...state, sessionLevel: adjustedLevel };
  
  const session = generateSession(date, adjustedState, blueprint);
  
  if (needsLighter && session.explainWhy) {
    session.explainWhy = "Adjusted to be gentler based on your recent feedback. " + session.explainWhy;
  }
  
  return session;
}

// Get available video exercises count for debugging
export function getVideoExerciseCount(): { total: number; withVideo: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  for (const ex of exercises) {
    byType[ex.type] = (byType[ex.type] || 0) + 1;
  }
  return {
    total: allExercises.length,
    withVideo: exercises.length,
    byType,
  };
}
