export type DaySummary = {
  date: string;
  recommendation: { type: "WALK" | "STRENGTH" | "RESET" | "REST"; displayName: string };
  completionStatus: "COMPLETED" | "NOT_STARTED" | "SKIPPED" | "REST";
  completed?: { minutesWalked?: number; exercisesCompleted?: number };
  feedback?: { rpe?: number; pain?: number; difficulty?: "TOO_HARD" | "COMFORTABLE" | "TOO_EASY"; feeling?: string };
  tomorrowAdjustment?: "LIGHTER" | "SAME" | "GENTLE_BUILD" | "REST";
  /** When present (from DB), used for "Why this plan?"; otherwise fallback from derivedMode */
  modeDecision?: { checkinMode?: string; capFromLastSession?: string; finalMode: "REST" | "EASIER" | "MAIN"; explanation: string };
  /** Derived from recommendation for fallback when modeDecision missing */
  derivedMode?: "REST" | "EASIER" | "MAIN";
};

type GeneratedSessionRow = {
  date: string;
  safety_status?: string;
  session_level?: string;
  focus_tags?: string[] | null;
  completed_at?: string | null;
  mode_decision?: { checkinMode?: string; capFromLastSession?: string; finalMode?: string; explanation?: string } | null;
};

type SessionHistoryRow = {
  date: string;
  exercise_list?: unknown;
  feedback?: string | null;
  completed_at?: string | null;
  mode_decision_json?: { checkinMode?: string; capFromLastSession?: string; finalMode?: string; explanation?: string } | null;
};

type UserAdaptiveRow = {
  last_session_feedback?: string | null;
  last_session_feedback_at?: string | null;
  last_session_rpe?: number | null;
  last_session_pain?: number | null;
  last_session_difficulty?: string | null;
  tomorrow_adjustment?: string | null;
};

function normalizeDate(date: string | Date) {
  return new Date(date).toISOString().split("T")[0];
}

function mapRecommendation(session?: GeneratedSessionRow) {
  if (!session) {
    return { type: "STRENGTH" as const, displayName: "Gentle session" };
  }
  if (session.safety_status === "RED") {
    return { type: "REST" as const, displayName: "Recovery day" };
  }
  if (session.session_level === "VERY_LOW") {
    return { type: "RESET" as const, displayName: "Reset day" };
  }
  const tags = (session.focus_tags || []).map(tag => String(tag).toLowerCase());
  if (tags.some(tag => tag.includes("walk"))) {
    return { type: "WALK" as const, displayName: "Gentle walk" };
  }
  return { type: "STRENGTH" as const, displayName: "Gentle strength session" };
}

function mapCompletionStatus(session?: GeneratedSessionRow, history?: SessionHistoryRow) {
  if (session?.safety_status === "RED") return "REST" as const;
  if (history?.completed_at || session?.completed_at) return "COMPLETED" as const;
  return "NOT_STARTED" as const;
}

function mapFeedback(date: string, adaptive?: UserAdaptiveRow) {
  if (!adaptive?.last_session_feedback_at) return undefined;
  const feedbackDate = normalizeDate(adaptive.last_session_feedback_at);
  if (feedbackDate !== date) return undefined;

  let difficulty: "TOO_HARD" | "COMFORTABLE" | "TOO_EASY" | undefined;
  if (adaptive.last_session_difficulty === "TOO_HARD") difficulty = "TOO_HARD";
  else if (adaptive.last_session_difficulty === "TOO_EASY") difficulty = "TOO_EASY";
  else if (adaptive.last_session_difficulty === "JUST_RIGHT") difficulty = "COMFORTABLE";

  return {
    rpe: adaptive.last_session_rpe ?? undefined,
    pain: adaptive.last_session_pain ?? undefined,
    difficulty,
    feeling: adaptive.last_session_feedback ?? undefined,
  };
}

export function buildHistorySummaries(
  dates: string[],
  sessions: GeneratedSessionRow[],
  history: SessionHistoryRow[],
  adaptive?: UserAdaptiveRow
): DaySummary[] {
  const sessionMap = new Map(sessions.map(row => [normalizeDate(row.date), row]));
  const historyMap = new Map(history.map(row => [normalizeDate(row.date), row]));

  return dates.map(date => {
    const session = sessionMap.get(date);
    const historyRow = historyMap.get(date);
    const recommendation = mapRecommendation(session);
    const completionStatus = mapCompletionStatus(session, historyRow);
    const exercisesCompleted = Array.isArray(historyRow?.exercise_list)
      ? historyRow?.exercise_list.length
      : undefined;
    const feedback = mapFeedback(date, adaptive);

    // Always set derivedMode so client fallback never receives undefined
    const derivedMode: "REST" | "EASIER" | "MAIN" =
      recommendation.type === "REST" ? "REST" : recommendation.type === "RESET" ? "EASIER" : "MAIN";

    const fromHistory = historyRow?.mode_decision_json;
    const fromSession = session?.mode_decision;
    const md = (fromHistory?.explanation ? fromHistory : fromSession?.explanation ? fromSession : null) as
      | { checkinMode?: string; capFromLastSession?: string; finalMode?: string; explanation?: string }
      | undefined;
    const modeDecision = md?.explanation
      ? {
          checkinMode: md.checkinMode,
          capFromLastSession: md.capFromLastSession,
          finalMode: (md.finalMode || derivedMode) as "REST" | "EASIER" | "MAIN",
          explanation: md.explanation,
        }
      : undefined;

    return {
      date,
      recommendation,
      completionStatus,
      completed: exercisesCompleted ? { exercisesCompleted } : undefined,
      feedback,
      tomorrowAdjustment: adaptive?.tomorrow_adjustment && normalizeDate(adaptive?.last_session_feedback_at || date) === date
        ? (adaptive.tomorrow_adjustment as DaySummary["tomorrowAdjustment"])
        : undefined,
      modeDecision,
      derivedMode,
    };
  });
}
