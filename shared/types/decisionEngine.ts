export type SafetyStatus = "GREEN" | "AMBER" | "RED";
export type PlanVariant = "MAIN" | "EASIER" | "RESET";
export type CapacityBand = "HIGH" | "MED" | "LOW";

export type SymptomScore010 = number;

export type RedFlagKey =
  | "CHEST_PAIN"
  | "FAINTING"
  | "SEVERE_BREATHLESSNESS_REST"
  | "FEVER_INFECTION"
  | "UNCONTROLLED_VOMITING"
  | "NEW_NEURO_SYMPTOMS"
  | "SUDDEN_SWELLING_SEVERE"
  | "OTHER_MEDICAL_URGENT";

export interface TodayCheckInInput {
  dateISO: string;
  fatigue010: SymptomScore010;
  pain010: SymptomScore010;
  nausea010?: SymptomScore010;
  sleep010?: SymptomScore010;
  painLocations?: Array<"SHOULDER"|"NECK"|"BACK"|"HIP"|"KNEE"|"FOOT"|"OTHER">;
  redFlags?: Partial<Record<RedFlagKey, boolean>>;
}

export interface TreatmentTimelineInput {
  surgeryDateISO?: string;
  chemoCycleDay?: number;
  chemoWeek?: number;
  radiotherapyActive?: boolean;
  hormoneTherapyActive?: boolean;
}

export interface UserSafetyProfile {
  phase: "PREHAB" | "IN_TREATMENT" | "POST_TREATMENT";
  lymphLoadRisk?: "LOW" | "MODERATE" | "HIGH";
  postOpShoulderRisk?: "NONE" | "LEFT" | "RIGHT" | "BILATERAL";
  boneRisk?: "NONE" | "LOW" | "HIGH";
  neuropathyRisk?: "NONE" | "MILD" | "MODERATE" | "HIGH";
  hasPortOrLine?: boolean;
}

export interface UserPreferences {
  sessionMinutesTarget?: number;
  equipmentAvailable?: Array<"NONE"|"BAND"|"DB_LIGHT"|"DB_MED"|"CHAIR">;
  prefersWalking?: boolean;
}

export interface UserProfileInput {
  userId: string;
  safety: UserSafetyProfile;
  preferences?: UserPreferences;
  treatment?: TreatmentTimelineInput;
}

export interface TrendInputs {
  fatigue7dAvg?: number;
  fatigue7dSlope?: number;
  pain7dAvg?: number;
  pain7dSlope?: number;
  last7dSessionsCompleted?: number;
  last3dIntensityPeak?: "VERY_LOW"|"LOW"|"MODERATE"|"HIGH";
  lastResetDayISO?: string;
}

export interface Exercise {
  id: string;
  name: string;
  phase?: string;
  stage?: string;
  type?: string;
  region?: string;
  intensity_tier?: "VERY_LOW"|"LOW"|"MODERATE"|"HIGH";
  equipment?: string | null;
  lymph_safe?: "YES" | "NO" | boolean;
  post_op_shoulder_safe?: "YES" | "NO" | boolean;
  movement_pattern?: string;
  balance_demand?: "LOW" | "MODERATE" | "HIGH";
  tags?: string[];
  movement_type?: string;
  body_focus?: string;
}

export interface WorkoutDose {
  sets: number;
  reps?: number;
  seconds?: number;
  restSeconds?: number;
  rpeCap?: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  dose: WorkoutDose;
}

export interface WorkoutBlock {
  blockKey: string;
  title: string;
  intent: string;
  exercises: WorkoutExercise[];
}

export interface Explainability {
  summary: string;
  safetyReasons: string[];
  capacityDrivers: string[];
  planWhy: string;
  constraintsApplied: string[];
  selectionReasons: string[];
}

export interface TodayPlanOutput {
  dateISO: string;
  safetyStatus: SafetyStatus;
  recommendedVariant: PlanVariant;
  capacityScore: number;
  capacityBand: CapacityBand;
  blocks: WorkoutBlock[];
  explain: Explainability;
  meta: { version: "v1"; generatedAtISO: string };
}

export type MarkerKey = "SIT_TO_STAND" | "SUPPORTED_MARCH" | "SHOULDER_RAISE";
export type MarkerRating = "EASY" | "OK" | "HARD";
export type MarkerSide = "LEFT" | "RIGHT" | "BOTH" | "NOT_SURE";

export interface MarkerResult {
  userId: string;
  dateISO: string;
  markerKey: MarkerKey;
  rating: MarkerRating;
  comfortableReps?: number;
  side?: MarkerSide;
  createdAtISO: string;
}

export interface GenerateTodayPlanInput {
  user: UserProfileInput;
  checkin: TodayCheckInInput;
  trends?: TrendInputs;
  exercises: Exercise[];
  markerSignals?: {
    last7d?: MarkerResult[];
    latest?: Partial<Record<MarkerKey, MarkerResult>>;
  };
}
