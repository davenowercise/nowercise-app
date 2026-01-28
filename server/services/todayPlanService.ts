import { db } from "../db";
import { 
  supportPrograms, 
  userSupportPrograms, 
  todayPlans, 
  todayPlanItems,
  pathwayAssignments
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

type JourneyPhase = "pre" | "in" | "post";
type Priority = "must" | "should" | "could";

interface PlanItem {
  programId: number | null;
  label: string;
  durationMin: number;
  priority: Priority;
  reason: string;
}

interface TodayPlanOutput {
  id: number;
  userId: string;
  date: string;
  generatedAt: Date;
  items: {
    id: number;
    label: string;
    durationMin: number;
    priority: Priority;
    reason: string | null;
    program?: {
      id: number;
      name: string;
      category: string;
    } | null;
  }[];
}

export async function getUserPhase(userId: string): Promise<JourneyPhase> {
  const assignment = await db
    .select({ 
      pathwayStage: pathwayAssignments.pathwayStage,
      currentTreatments: pathwayAssignments.currentTreatments
    })
    .from(pathwayAssignments)
    .where(eq(pathwayAssignments.userId, userId))
    .limit(1);
  
  if (!assignment.length) return "post";
  
  const stage = assignment[0].pathwayStage;
  const treatments = assignment[0].currentTreatments as string[] | null;
  
  if (stage === 0) return "pre";
  if (treatments && treatments.length > 0 && 
      (treatments.includes("chemotherapy") || treatments.includes("radiotherapy"))) {
    return "in";
  }
  return "post";
}

export async function buildTodayPlan(userId: string): Promise<TodayPlanOutput> {
  const today = new Date().toISOString().split("T")[0];
  
  const phase = await getUserPhase(userId);
  
  const activeUserPrograms = await db
    .select({
      id: userSupportPrograms.id,
      programId: userSupportPrograms.programId,
      priority: userSupportPrograms.priority,
      cadence: userSupportPrograms.cadence,
      program: {
        id: supportPrograms.id,
        name: supportPrograms.name,
        category: supportPrograms.category,
        defaultDurationMin: supportPrograms.defaultDurationMin
      }
    })
    .from(userSupportPrograms)
    .innerJoin(supportPrograms, eq(userSupportPrograms.programId, supportPrograms.id))
    .where(and(
      eq(userSupportPrograms.userId, userId),
      eq(userSupportPrograms.status, "active")
    ));

  const mustItems: PlanItem[] = [];
  const shouldItems: PlanItem[] = [];
  const couldItems: PlanItem[] = [];

  const movementProgram = activeUserPrograms.find(
    up => up.program.category === "movement" || up.program.category === "mobility"
  );
  
  mustItems.push({
    programId: movementProgram?.programId ?? null,
    label: "Gentle reset",
    durationMin: Math.min(movementProgram?.program.defaultDurationMin ?? 3, 5),
    priority: "must",
    reason: "always_include"
  });

  for (const up of activeUserPrograms) {
    if (up.programId === movementProgram?.programId) continue;
    
    const item: PlanItem = {
      programId: up.programId,
      label: up.program.name,
      durationMin: up.program.defaultDurationMin,
      priority: up.priority as Priority,
      reason: "user_selected"
    };

    if (up.priority === "should") {
      shouldItems.push(item);
    } else if (up.priority === "could") {
      couldItems.push(item);
    }
  }

  let finalShould = [...shouldItems];
  let finalCould = [...couldItems];
  
  if (phase === "in") {
    finalShould = shouldItems.slice(0, 1);
    
    const hasRecovery = [...mustItems, ...finalShould].some(
      i => activeUserPrograms.find(up => up.programId === i.programId)?.program.category === "recovery" ||
           activeUserPrograms.find(up => up.programId === i.programId)?.program.category === "mobility"
    );
    
    if (!hasRecovery && shouldItems.length > 0) {
      const recoveryItem = shouldItems.find(
        i => activeUserPrograms.find(up => up.programId === i.programId)?.program.category === "recovery"
      );
      if (recoveryItem && !finalShould.includes(recoveryItem)) {
        finalShould = [recoveryItem];
      }
    }
    
    finalShould = finalShould.map(i => ({
      ...i,
      durationMin: Math.min(i.durationMin, 10)
    }));
  } else if (phase === "pre") {
    finalShould = shouldItems.slice(0, 2);
  } else {
    finalShould = shouldItems.slice(0, 2);
  }

  const [newPlan] = await db
    .insert(todayPlans)
    .values({
      userId,
      date: today
    })
    .returning();

  const allItems = [
    ...mustItems,
    ...finalShould,
    ...finalCould.slice(0, 3)
  ];

  const insertedItems = await db
    .insert(todayPlanItems)
    .values(allItems.map(item => ({
      todayPlanId: newPlan.id,
      programId: item.programId,
      label: item.label,
      durationMin: item.durationMin,
      priority: item.priority,
      reason: item.reason
    })))
    .returning();

  const itemsWithPrograms = insertedItems.map(item => {
    const programData = activeUserPrograms.find(up => up.programId === item.programId);
    return {
      id: item.id,
      label: item.label,
      durationMin: item.durationMin,
      priority: item.priority as Priority,
      reason: item.reason,
      program: programData ? {
        id: programData.program.id,
        name: programData.program.name,
        category: programData.program.category
      } : null
    };
  });

  return {
    id: newPlan.id,
    userId: newPlan.userId,
    date: newPlan.date,
    generatedAt: newPlan.generatedAt!,
    items: itemsWithPrograms
  };
}

export async function getTodayPlan(userId: string): Promise<TodayPlanOutput | null> {
  const today = new Date().toISOString().split("T")[0];
  
  const existingPlan = await db
    .select()
    .from(todayPlans)
    .where(and(
      eq(todayPlans.userId, userId),
      eq(todayPlans.date, today)
    ))
    .limit(1);

  if (!existingPlan.length) {
    return null;
  }

  const plan = existingPlan[0];
  
  const items = await db
    .select({
      id: todayPlanItems.id,
      label: todayPlanItems.label,
      durationMin: todayPlanItems.durationMin,
      priority: todayPlanItems.priority,
      reason: todayPlanItems.reason,
      programId: todayPlanItems.programId
    })
    .from(todayPlanItems)
    .where(eq(todayPlanItems.todayPlanId, plan.id));

  const programIds = items.map(i => i.programId).filter(Boolean) as number[];
  
  let programsMap: Record<number, { id: number; name: string; category: string }> = {};
  
  if (programIds.length > 0) {
    const programsData = await db
      .select({
        id: supportPrograms.id,
        name: supportPrograms.name,
        category: supportPrograms.category
      })
      .from(supportPrograms)
      .where(sql`${supportPrograms.id} = ANY(${programIds})`);
    
    programsMap = Object.fromEntries(programsData.map(p => [p.id, p]));
  }

  return {
    id: plan.id,
    userId: plan.userId,
    date: plan.date,
    generatedAt: plan.generatedAt!,
    items: items.map(item => ({
      id: item.id,
      label: item.label,
      durationMin: item.durationMin,
      priority: item.priority as Priority,
      reason: item.reason,
      program: item.programId ? programsMap[item.programId] ?? null : null
    }))
  };
}

export async function getOrCreateTodayPlan(userId: string): Promise<TodayPlanOutput> {
  const existing = await getTodayPlan(userId);
  if (existing) return existing;
  return buildTodayPlan(userId);
}
