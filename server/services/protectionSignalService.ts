/**
 * Adaptive Progression Protection v1
 * Inspects recent post-session checkouts and returns a simple protection signal.
 * Deterministic, explainable, recommendation-first.
 */
import { db } from "../db";
import { postSessionCheckouts } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export type ProtectionSignal = "caution" | "steady_progress" | "neutral";

export interface ProtectionSignalResult {
  signal: ProtectionSignal;
  copy?: string;
}

/** Fetch recent checkouts for user, ordered by completedAt desc */
async function getRecentCheckouts(userId: string, limit: number = 5) {
  const rows = await db
    .select({
      howFelt: postSessionCheckouts.howFelt,
      symptomsNow: postSessionCheckouts.symptomsNow,
      completedAt: postSessionCheckouts.completedAt,
    })
    .from(postSessionCheckouts)
    .where(eq(postSessionCheckouts.userId, userId))
    .orderBy(desc(postSessionCheckouts.completedAt))
    .limit(limit);
  return rows;
}

function isConcerning(checkout: { howFelt: string; symptomsNow: string }): boolean {
  return checkout.howFelt === "too_much" || checkout.symptomsNow === "worse";
}

function isSteady(checkout: { howFelt: string; symptomsNow: string }): boolean {
  return (
    checkout.howFelt === "about_right" &&
    (checkout.symptomsNow === "about_same" || checkout.symptomsNow === "better")
  );
}

/**
 * Compute protection signal from recent checkout history.
 * Rules (v1, less sensitive):
 * - CAUTION: most recent symptomsNow=worse, OR last 2 both howFelt=too_much, OR 2 of last 3 have too_much/worse
 * - STEADY_PROGRESS: last 3 mostly about_right with good symptoms
 * - Otherwise: neutral
 */
export async function getProtectionSignal(userId: string): Promise<ProtectionSignalResult> {
  const checkouts = await getRecentCheckouts(userId, 5);
  if (checkouts.length === 0) {
    return { signal: "neutral" };
  }

  const [latest, second] = checkouts;

  // CAUTION rules
  if (latest.symptomsNow === "worse") {
    return {
      signal: "caution",
      copy: "Recent sessions may have been a bit too much. A calmer day may fit better today.",
    };
  }
  if (latest.howFelt === "too_much" && second?.howFelt === "too_much") {
    return {
      signal: "caution",
      copy: "Recent sessions may have been a bit too much. A calmer day may fit better today.",
    };
  }
  // 2 of last 3 checkouts include too_much and/or worse
  const recent3 = checkouts.slice(0, 3);
  if (recent3.length >= 3) {
    const concerningCount = recent3.filter(isConcerning).length;
    if (concerningCount >= 2) {
      return {
        signal: "caution",
        copy: "Recent sessions may have been a bit too much. A calmer day may fit better today.",
      };
    }
  }

  // STEADY_PROGRESS: last 3 mostly about_right with good symptoms
  const recent3 = checkouts.slice(0, 3);
  if (recent3.length >= 3) {
    const steadyCount = recent3.filter(isSteady).length;
    if (steadyCount >= 2) {
      return {
        signal: "steady_progress",
        copy: "Recent sessions look well tolerated. Steady progress is appropriate.",
      };
    }
  }

  return { signal: "neutral" };
}
