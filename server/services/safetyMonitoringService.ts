import { db } from "../db";
import { sql } from "drizzle-orm";

type EventType = "RED_FLAG" | "YELLOW_FLAG" | "REPEATED_LOW_ENERGY" | "REPEATED_HIGH_PAIN";
type AlertType = "RED_IMMEDIATE" | "PATTERN_WARNING";

interface SafetyEventInput {
  userId: string;
  date: string;
  eventType: EventType;
  source: "CHECKIN" | "SYSTEM_RULE";
  details: Record<string, unknown>;
}

async function createSafetyEvent(input: SafetyEventInput): Promise<number | null> {
  try {
    const result = await db.execute(sql`
      INSERT INTO safety_events (user_id, date, event_type, source, details)
      VALUES (${input.userId}, ${input.date}, ${input.eventType}, ${input.source}, ${JSON.stringify(input.details)}::jsonb)
      ON CONFLICT (user_id, date, event_type) DO NOTHING
      RETURNING id
    `);
    
    if (result.rows.length === 0) return null;
    return (result.rows[0] as any).id;
  } catch (error) {
    console.error("Failed to create safety event:", error);
    return null;
  }
}

async function createCoachAlert(
  userId: string,
  eventId: number,
  alertType: AlertType
): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO coach_alerts (user_id, event_id, alert_type, status)
      VALUES (${userId}, ${eventId}, ${alertType}, 'PENDING')
    `);

    console.log(`[COACH ALERT] ${alertType} for user ${userId} - Event #${eventId}`);

    await db.execute(sql`
      UPDATE coach_alerts SET status = 'SENT' WHERE event_id = ${eventId} AND status = 'PENDING'
    `);
  } catch (error) {
    console.error("Failed to create coach alert:", error);
  }
}

export async function checkImmediateAlerts(
  userId: string,
  date: string,
  safetyStatus: string,
  redFlags: string[]
): Promise<void> {
  if (safetyStatus === "RED" || redFlags.length > 0) {
    const eventId = await createSafetyEvent({
      userId,
      date,
      eventType: "RED_FLAG",
      source: "CHECKIN",
      details: {
        safetyStatus,
        redFlags,
        reason: safetyStatus === "RED" ? "Safety status RED" : `Red flags: ${redFlags.join(", ")}`,
      },
    });

    if (eventId) {
      await createCoachAlert(userId, eventId, "RED_IMMEDIATE");
    }
  }
}

export async function runPatternAnalysis(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const checkins = await db.execute(sql`
    SELECT date, energy, pain, 
           (SELECT safety_status FROM today_states WHERE user_id = daily_checkins.user_id AND date = daily_checkins.date) as safety_status
    FROM daily_checkins 
    WHERE user_id = ${userId} 
    ORDER BY date DESC 
    LIMIT 7
  `);

  const rows = checkins.rows as any[];
  if (rows.length < 3) return;

  const last5 = rows.slice(0, 5);

  const lowEnergyCount = last5.filter(r => r.energy <= 3).length;
  if (lowEnergyCount >= 3) {
    const eventId = await createSafetyEvent({
      userId,
      date: today,
      eventType: "REPEATED_LOW_ENERGY",
      source: "SYSTEM_RULE",
      details: {
        lowEnergyDays: lowEnergyCount,
        period: "last 5 days",
        energyValues: last5.map(r => ({ date: r.date, energy: r.energy })),
      },
    });

    if (eventId) {
      await createCoachAlert(userId, eventId, "PATTERN_WARNING");
    }
  }

  const highPainCount = last5.filter(r => r.pain >= 7).length;
  if (highPainCount >= 3) {
    const eventId = await createSafetyEvent({
      userId,
      date: today,
      eventType: "REPEATED_HIGH_PAIN",
      source: "SYSTEM_RULE",
      details: {
        highPainDays: highPainCount,
        period: "last 5 days",
        painValues: last5.map(r => ({ date: r.date, pain: r.pain })),
      },
    });

    if (eventId) {
      await createCoachAlert(userId, eventId, "PATTERN_WARNING");
    }
  }

  let consecutiveYellows = 0;
  for (const row of rows) {
    if (row.safety_status === "YELLOW") {
      consecutiveYellows++;
    } else {
      break;
    }
  }

  if (consecutiveYellows >= 4) {
    const eventId = await createSafetyEvent({
      userId,
      date: today,
      eventType: "YELLOW_FLAG",
      source: "SYSTEM_RULE",
      details: {
        consecutiveYellowDays: consecutiveYellows,
        reason: "4+ consecutive YELLOW safety status days",
      },
    });

    if (eventId) {
      await createCoachAlert(userId, eventId, "PATTERN_WARNING");
    }
  }
}

export async function getCoachAlerts(status?: string): Promise<any[]> {
  let query;
  if (status) {
    query = sql`
      SELECT ca.*, se.event_type, se.date as event_date, se.details
      FROM coach_alerts ca
      JOIN safety_events se ON ca.event_id = se.id
      WHERE ca.status = ${status}
      ORDER BY ca.created_at DESC
    `;
  } else {
    query = sql`
      SELECT ca.*, se.event_type, se.date as event_date, se.details
      FROM coach_alerts ca
      JOIN safety_events se ON ca.event_id = se.id
      ORDER BY ca.created_at DESC
      LIMIT 50
    `;
  }

  const result = await db.execute(query);
  return result.rows as any[];
}

export async function acknowledgeAlert(alertId: number): Promise<boolean> {
  try {
    await db.execute(sql`
      UPDATE coach_alerts SET status = 'ACKNOWLEDGED' WHERE id = ${alertId}
    `);
    return true;
  } catch (error) {
    console.error("Failed to acknowledge alert:", error);
    return false;
  }
}

export async function getRecentCheckins(userId: string, limit: number = 3): Promise<any[]> {
  const result = await db.execute(sql`
    SELECT dc.*, ts.safety_status, ts.readiness_score
    FROM daily_checkins dc
    LEFT JOIN today_states ts ON dc.user_id = ts.user_id AND dc.date = ts.date
    WHERE dc.user_id = ${userId}
    ORDER BY dc.date DESC
    LIMIT ${limit}
  `);
  return result.rows as any[];
}
