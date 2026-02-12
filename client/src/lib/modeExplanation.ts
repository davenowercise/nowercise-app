/**
 * User-friendly copy for "Why this plan?" — supportive, short, no guilt.
 * Never displays raw strings like "TOO_HARD", "TOO_EASY", or internal terms.
 * Uses structured fields first; string matching as fallback only.
 */
export type SessionMode = "REST" | "EASIER" | "MAIN";

export type ModeDecisionInput = {
  checkinMode?: string;
  capFromLastSession?: string;
  finalMode?: string;
  explanation?: string;
} | null | undefined;

export function renderFriendlyExplanation(
  modeDecision?: ModeDecisionInput,
  mode?: SessionMode
): string {
  const md = modeDecision;
  const fm = md?.finalMode;
  const cm = md?.checkinMode;
  const cap = md?.capFromLastSession;
  const raw = md?.explanation;

  // Structured: REST check-in required REST
  if (fm === "REST" && cm === "REST") {
    return "Your check-in says rest is the safest option today.";
  }

  // Structured: cap won (finalMode === cap, cap !== checkin)
  if (fm && cap && fm === cap && cap !== cm) {
    return "We're keeping it gentler today based on your last session.";
  }

  // Structured: MAIN, no cap, TOO_EASY allowed progression
  if (fm === "MAIN" && cap === "MAIN" && cm === "MAIN" && raw?.includes("TOO_EASY")) {
    return "You were feeling good last time, so we'll stick with your usual plan.";
  }

  // Fallback: string matching (for older data without full fields)
  if (raw) {
    if (raw.includes("capped")) return "We're keeping it gentler today based on your last session.";
    if (raw.includes("check-in required REST")) return "Your check-in says rest is the safest option today.";
    if (raw.includes("TOO_EASY")) return "You were feeling good last time, so we'll stick with your usual plan.";
    return "No extra limits today — we'll keep it steady.";
  }

  // Fallback when modeDecision missing (older sessions)
  const fallbackMode = mode ?? "MAIN";
  if (fallbackMode === "REST") return "Today is a recovery day.";
  if (fallbackMode === "EASIER") return "Keeping it gentler today.";
  return "You're good for your usual plan today.";
}

/** @deprecated Use renderFriendlyExplanation */
export const formatModeExplanation = renderFriendlyExplanation;
