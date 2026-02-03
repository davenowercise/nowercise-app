import { db } from "../db";
import { sql } from "drizzle-orm";
import { getUtcDateKey } from "../utils/dateKey";

export interface TodayCheckinStatus {
  todayKey: string;
  checkin: any | null;
  hasCheckedInToday: boolean;
  checkinDateKey: string | null;
}

export async function getTodayCheckinStatus(userId: string): Promise<TodayCheckinStatus> {
  const todayKey = getUtcDateKey();
  const result = await db.execute(sql`
    SELECT *
    FROM daily_checkins
    WHERE user_id = ${userId} AND date = ${todayKey}
    ORDER BY updated_at DESC NULLS LAST, created_at DESC
    LIMIT 1
  `);

  const checkin = (result.rows[0] as any) || null;
  const checkinDateKey = checkin?.date ?? null;
  const hasCheckedInToday = !!checkin;

  console.log("[CHECKIN-STATUS]", {
    userId,
    todayKey,
    checkinDateKey,
    hasCheckedInToday,
  });

  return { todayKey, checkin, hasCheckedInToday, checkinDateKey };
}
