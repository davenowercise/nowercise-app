import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  pathwayAssignments,
  sessionTemplates,
  templateExercises,
  coachFlags,
  users,
  type PathwayAssignment,
  type SessionTemplate,
  type TemplateExercise,
  type InsertPathwayAssignment,
  type InsertCoachFlag
} from "@shared/schema";

export interface PathwayStage {
  stage: number;
  name: string;
  description: string;
  dayRange: { min: number; max: number | null };
  weeklyPlan: {
    strengthSessions: number;
    walkMinutes: number;
    mobilityMinis: number;
    restDays: number;
  };
}

export const PATHWAY_STAGES: PathwayStage[] = [
  {
    stage: 0,
    name: "Very Early (Days 0-6)",
    description: "Focus on rest and very gentle movement. Listen to your body.",
    dayRange: { min: 0, max: 6 },
    weeklyPlan: {
      strengthSessions: 0,
      walkMinutes: 20,
      mobilityMinis: 3,
      restDays: 4
    }
  },
  {
    stage: 1,
    name: "Foundations (Days 7-28)",
    description: "Building gentle habits with supported movement.",
    dayRange: { min: 7, max: 28 },
    weeklyPlan: {
      strengthSessions: 2,
      walkMinutes: 45,
      mobilityMinis: 3,
      restDays: 2
    }
  },
  {
    stage: 2,
    name: "Building Confidence (Day 29+)",
    description: "Gradual progression with more variety.",
    dayRange: { min: 29, max: null },
    weeklyPlan: {
      strengthSessions: 3,
      walkMinutes: 60,
      mobilityMinis: 2,
      restDays: 2
    }
  }
];

export interface TodaySession {
  templateCode: string;
  template: SessionTemplate | null;
  exercises: TemplateExercise[];
  displayTitle: string;
  displayDescription: string;
  estimatedMinutes: number;
  sessionType: string;
  easierOption: {
    title: string;
    description: string;
    estimatedMinutes: number;
  } | null;
  restOption: {
    title: string;
    description: string;
  };
  weekProgress: {
    strengthDone: number;
    strengthTarget: number;
    walkMinutes: number;
    walkTarget: number;
    restDays: number;
  };
}

export class BreastCancerPathwayService {
  static calculateStage(surgeryDate: Date | string | null): number {
    if (!surgeryDate) return 1;
    
    const surgery = typeof surgeryDate === 'string' ? new Date(surgeryDate) : surgeryDate;
    const today = new Date();
    const diffTime = today.getTime() - surgery.getTime();
    const daysSinceSurgery = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysSinceSurgery < 0) return 1;
    if (daysSinceSurgery <= 6) return 0;
    if (daysSinceSurgery <= 28) return 1;
    return 2;
  }

  static getDaysSinceSurgery(surgeryDate: Date | string | null): number {
    if (!surgeryDate) return 0;
    
    const surgery = typeof surgeryDate === 'string' ? new Date(surgeryDate) : surgeryDate;
    const today = new Date();
    const diffTime = today.getTime() - surgery.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  static getStageInfo(stage: number): PathwayStage {
    return PATHWAY_STAGES.find(s => s.stage === stage) || PATHWAY_STAGES[1];
  }

  static async getPathwayAssignment(userId: string): Promise<PathwayAssignment | null> {
    const [assignment] = await db
      .select()
      .from(pathwayAssignments)
      .where(eq(pathwayAssignments.userId, userId))
      .limit(1);
    return assignment || null;
  }

  static async createPathwayAssignment(data: InsertPathwayAssignment): Promise<PathwayAssignment> {
    const stage = this.calculateStage(data.surgeryDate || null);
    const daysSinceSurgery = this.getDaysSinceSurgery(data.surgeryDate || null);
    
    const [assignment] = await db
      .insert(pathwayAssignments)
      .values({
        ...data,
        pathwayStage: stage,
        daysSinceSurgery,
        weekStartDate: this.getCurrentWeekStart()
      })
      .returning();
    
    return assignment;
  }

  static async updatePathwayAssignment(
    userId: string, 
    updates: Partial<InsertPathwayAssignment>
  ): Promise<PathwayAssignment | null> {
    const [updated] = await db
      .update(pathwayAssignments)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(pathwayAssignments.userId, userId))
      .returning();
    
    return updated || null;
  }

  static async refreshStageIfNeeded(userId: string): Promise<PathwayAssignment | null> {
    const assignment = await this.getPathwayAssignment(userId);
    if (!assignment) return null;

    const currentStage = this.calculateStage(assignment.surgeryDate);
    const daysSinceSurgery = this.getDaysSinceSurgery(assignment.surgeryDate);

    if (currentStage !== assignment.pathwayStage || daysSinceSurgery !== assignment.daysSinceSurgery) {
      return this.updatePathwayAssignment(userId, {
        pathwayStage: currentStage,
        daysSinceSurgery
      });
    }

    return assignment;
  }

  static getCurrentWeekStart(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  static async resetWeeklyCountersIfNeeded(userId: string): Promise<PathwayAssignment | null> {
    const assignment = await this.getPathwayAssignment(userId);
    if (!assignment) return null;

    const currentWeekStart = this.getCurrentWeekStart();
    
    if (assignment.weekStartDate !== currentWeekStart) {
      return this.updatePathwayAssignment(userId, {
        weekStartDate: currentWeekStart,
        weekStrengthSessions: 0,
        weekWalkMinutes: 0,
        weekRestDays: 0
      });
    }

    return assignment;
  }

  static async getSessionTemplateByCode(code: string): Promise<SessionTemplate | null> {
    const [template] = await db
      .select()
      .from(sessionTemplates)
      .where(eq(sessionTemplates.templateCode, code))
      .limit(1);
    return template || null;
  }

  static async getSessionTemplatesForStage(
    pathwayId: string, 
    stage: number, 
    sessionType?: string
  ): Promise<SessionTemplate[]> {
    let query = db
      .select()
      .from(sessionTemplates)
      .where(
        and(
          eq(sessionTemplates.pathwayId, pathwayId),
          eq(sessionTemplates.pathwayStage, stage),
          eq(sessionTemplates.isActive, true)
        )
      )
      .orderBy(sessionTemplates.sortOrder);
    
    const templates = await query;
    
    if (sessionType) {
      return templates.filter(t => t.sessionType === sessionType);
    }
    return templates;
  }

  static async getTemplateExercises(templateId: number): Promise<TemplateExercise[]> {
    return db
      .select()
      .from(templateExercises)
      .where(eq(templateExercises.templateId, templateId))
      .orderBy(templateExercises.sortOrder);
  }

  static getSuggestedSessionType(
    stage: number,
    weekProgress: { strengthDone: number; walkMinutes: number; restDays: number },
    lastSessionType: string | null,
    dayOfWeek: number
  ): string {
    const stageInfo = this.getStageInfo(stage);
    const plan = stageInfo.weeklyPlan;

    if (stage === 0) {
      if (dayOfWeek === 0 || dayOfWeek === 6) return 'rest';
      return weekProgress.walkMinutes < plan.walkMinutes ? 'walk' : 'mobility';
    }

    const needsRest = weekProgress.restDays < plan.restDays && 
                      (lastSessionType === 'strength' || lastSessionType === 'walk');
    
    if (needsRest && dayOfWeek !== 1) {
      return 'rest';
    }

    const strengthNeeded = weekProgress.strengthDone < plan.strengthSessions;
    const walkNeeded = weekProgress.walkMinutes < plan.walkMinutes;

    if (strengthNeeded && lastSessionType !== 'strength') {
      return 'strength';
    }
    
    if (walkNeeded) {
      return 'walk';
    }

    if (strengthNeeded) {
      return 'strength';
    }

    return 'mobility';
  }

  static getNextStrengthRotation(
    lastSessionType: string | null,
    weekStrengthDone: number,
    stage: number
  ): string {
    const rotations = stage === 1 
      ? ['BC_S1_STRENGTH_A', 'BC_S1_STRENGTH_B', 'BC_S1_STRENGTH_C']
      : ['BC_S2_STRENGTH_A', 'BC_S2_STRENGTH_B', 'BC_S2_STRENGTH_C'];
    
    return rotations[weekStrengthDone % rotations.length];
  }

  static async getTodaySession(userId: string, currentEnergy?: number): Promise<TodaySession | null> {
    const assignment = await this.refreshStageIfNeeded(userId);
    if (!assignment) return null;

    await this.resetWeeklyCountersIfNeeded(userId);
    
    const refreshedAssignment = await this.getPathwayAssignment(userId);
    if (!refreshedAssignment) return null;

    const stage = refreshedAssignment.pathwayStage;
    const stageInfo = this.getStageInfo(stage);
    const dayOfWeek = new Date().getDay();

    const weekProgress = {
      strengthDone: refreshedAssignment.weekStrengthSessions || 0,
      strengthTarget: stageInfo.weeklyPlan.strengthSessions,
      walkMinutes: refreshedAssignment.weekWalkMinutes || 0,
      walkTarget: stageInfo.weeklyPlan.walkMinutes,
      restDays: refreshedAssignment.weekRestDays || 0
    };

    const suggestedType = this.getSuggestedSessionType(
      stage,
      { 
        strengthDone: weekProgress.strengthDone, 
        walkMinutes: weekProgress.walkMinutes,
        restDays: weekProgress.restDays 
      },
      refreshedAssignment.lastSessionType,
      dayOfWeek
    );

    if (suggestedType === 'rest') {
      return {
        templateCode: 'rest',
        template: null,
        exercises: [],
        displayTitle: 'Rest Day',
        displayDescription: 'Rest is part of recovery. Your body heals and gets stronger during rest.',
        estimatedMinutes: 0,
        sessionType: 'rest',
        easierOption: null,
        restOption: {
          title: "That's the plan!",
          description: "Rest well today."
        },
        weekProgress
      };
    }

    let templateCode: string;
    
    if (suggestedType === 'strength') {
      templateCode = this.getNextStrengthRotation(
        refreshedAssignment.lastSessionType,
        weekProgress.strengthDone,
        stage
      );
    } else if (suggestedType === 'walk') {
      templateCode = stage === 0 ? 'BC_S0_WALK' : 
                     stage === 1 ? 'BC_S1_WALK' : 'BC_S2_WALK';
    } else {
      templateCode = stage === 0 ? 'BC_S0_GENTLE' :
                     stage === 1 ? 'BC_S1_MOBILITY' : 'BC_S2_MOBILITY';
    }

    const template = await this.getSessionTemplateByCode(templateCode);
    const exercises = template ? await this.getTemplateExercises(template.id) : [];

    const displayTitle = template?.displayTitle || template?.name || 'Today\'s Session';
    const displayDescription = template?.displayDescription || template?.description || '';
    const estimatedMinutes = template?.estimatedMinutes || 15;

    let easierOption = null;
    if (template?.easierTitle) {
      easierOption = {
        title: template.easierTitle,
        description: template.easierDescription || '',
        estimatedMinutes: template.minMinutes || Math.floor(estimatedMinutes * 0.7)
      };
    }

    return {
      templateCode,
      template,
      exercises,
      displayTitle,
      displayDescription,
      estimatedMinutes,
      sessionType: suggestedType,
      easierOption,
      restOption: {
        title: "Rest instead",
        description: "If you need rest today, that's perfectly okay. Rest is recovery."
      },
      weekProgress
    };
  }

  static async recordSessionCompletion(
    userId: string,
    sessionType: string,
    durationMinutes: number,
    telemetry?: {
      templateCode?: string;
      averageRPE?: number;
      maxPain?: number;
      isEasyMode?: boolean;
      exercisesCompleted?: number;
      exercisesTotal?: number;
      restReason?: string;
      completed?: boolean;
    }
  ): Promise<PathwayAssignment | null> {
    const assignment = await this.getPathwayAssignment(userId);
    if (!assignment) return null;

    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<InsertPathwayAssignment> = {
      lastSessionType: sessionType,
      lastSessionDate: today
    };

    if (sessionType === 'strength') {
      updates.weekStrengthSessions = (assignment.weekStrengthSessions || 0) + 1;
    } else if (sessionType === 'walk') {
      updates.weekWalkMinutes = (assignment.weekWalkMinutes || 0) + durationMinutes;
    } else if (sessionType === 'mobility') {
      // Mobility sessions count toward gentle movement - track in coach notes
    } else if (sessionType === 'rest') {
      updates.weekRestDays = (assignment.weekRestDays || 0) + 1;
    }

    // Track easy mode usage and high RPE/pain for progression decisions
    if (telemetry) {
      const existingNotes = (assignment.coachNotes as any) || {};
      const sessionHistory = existingNotes.recentSessions || [];
      
      // Store last 10 sessions for pattern analysis
      sessionHistory.unshift({
        date: today,
        templateCode: telemetry.templateCode,
        sessionType,
        durationMinutes,
        averageRPE: telemetry.averageRPE,
        maxPain: telemetry.maxPain,
        isEasyMode: telemetry.isEasyMode,
        completed: telemetry.completed,
        restReason: telemetry.restReason
      });
      
      if (sessionHistory.length > 10) {
        sessionHistory.pop();
      }
      
      updates.coachNotes = {
        ...existingNotes,
        recentSessions: sessionHistory
      };
    }

    return this.updatePathwayAssignment(userId, updates);
  }

  static async createCoachFlag(data: InsertCoachFlag): Promise<void> {
    await db.insert(coachFlags).values(data);
  }

  static async checkAndCreateFlags(
    userId: string,
    energyLevel: number,
    painLevel?: number,
    painLocation?: string
  ): Promise<void> {
    if (energyLevel <= 2) {
      const recentFlags = await db
        .select()
        .from(coachFlags)
        .where(
          and(
            eq(coachFlags.userId, userId),
            eq(coachFlags.flagType, 'low_energy_streak'),
            eq(coachFlags.isResolved, false)
          )
        )
        .limit(1);

      if (recentFlags.length === 0) {
        await this.createCoachFlag({
          userId,
          flagType: 'low_energy_streak',
          severity: 'amber',
          title: 'Low energy reported',
          description: `Patient reported energy level ${energyLevel}/5`,
          triggerData: { energyLevel, date: new Date().toISOString() }
        });
      }
    }

    if (painLevel && painLevel >= 4) {
      await this.createCoachFlag({
        userId,
        flagType: 'high_pain',
        severity: painLevel >= 4 ? 'red' : 'amber',
        title: 'High pain reported',
        description: `Pain level ${painLevel}/5${painLocation ? ` at ${painLocation}` : ''}`,
        triggerData: { painLevel, painLocation, date: new Date().toISOString() }
      });
    }
  }

  static async getUnresolvedFlags(userId: string): Promise<any[]> {
    return db
      .select()
      .from(coachFlags)
      .where(
        and(
          eq(coachFlags.userId, userId),
          eq(coachFlags.isResolved, false)
        )
      )
      .orderBy(desc(coachFlags.createdAt));
  }
}

export default BreastCancerPathwayService;
