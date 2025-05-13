import {
  users,
  patientProfiles,
  exercises,
  programs,
  programAssignments,
  programWorkouts,
  workoutLogs,
  smallWins,
  sessions_appointments,
  messages,
  patientSpecialists,
  physicalAssessments,
  exerciseRecommendations,
  programRecommendations,
  type User,
  type UpsertUser,
  type PatientProfile,
  type PhysicalAssessment,
  type Exercise,
  type Program,
  type ProgramAssignment,
  type ProgramWorkout,
  type WorkoutLog,
  type SmallWin,
  type SessionAppointment,
  type Message,
  type ExerciseRecommendation,
  type ProgramRecommendation
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, inArray, desc, sql, count, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Patient-Specialist relationships
  getPatientsBySpecialistId(specialistId: string): Promise<User[]>;
  getSpecialistsByPatientId(patientId: string): Promise<User[]>;
  assignPatientToSpecialist(patientId: string, specialistId: string): Promise<void>;
  
  // Patient Profiles
  getPatientProfile(userId: string): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: Omit<PatientProfile, "id" | "createdAt" | "updatedAt">): Promise<PatientProfile>;
  updatePatientProfile(userId: string, profile: Partial<PatientProfile>): Promise<PatientProfile | undefined>;
  
  // Physical Assessments
  getPhysicalAssessment(id: number): Promise<PhysicalAssessment | undefined>;
  getPhysicalAssessmentsByPatient(patientId: string): Promise<PhysicalAssessment[]>;
  createPhysicalAssessment(assessment: Omit<PhysicalAssessment, "id" | "assessmentDate" | "createdAt" | "updatedAt">): Promise<PhysicalAssessment>;
  
  // Exercises
  getExercise(id: number): Promise<Exercise | undefined>;
  getAllExercises(): Promise<Exercise[]>;
  getExercisesByEnergyLevel(level: number): Promise<Exercise[]>;
  createExercise(exercise: Omit<Exercise, "id" | "createdAt" | "updatedAt">): Promise<Exercise>;
  
  // Programs
  getProgram(id: number): Promise<Program | undefined>;
  getProgramsBySpecialist(specialistId: string): Promise<Program[]>;
  createProgram(program: Omit<Program, "id" | "createdAt" | "updatedAt">): Promise<Program>;
  getProgramWorkouts(programId: number): Promise<(ProgramWorkout & { exercise: Exercise })[]>;
  addExerciseToProgram(workout: Omit<ProgramWorkout, "id">): Promise<ProgramWorkout>;
  
  // Program Assignments
  assignProgramToPatient(assignment: Omit<ProgramAssignment, "id" | "createdAt" | "updatedAt">): Promise<ProgramAssignment>;
  getPatientAssignments(patientId: string): Promise<(ProgramAssignment & { program: Program })[]>;
  getProgramAssignment(id: number): Promise<(ProgramAssignment & { program: Program }) | undefined>;
  
  // Exercise and Program Recommendations
  getExerciseRecommendations(patientId: string, assessmentId?: number): Promise<ExerciseRecommendation[]>;
  getProgramRecommendations(patientId: string, assessmentId?: number): Promise<ProgramRecommendation[]>;
  approveExerciseRecommendation(id: number, specialistId: string, notes?: string): Promise<ExerciseRecommendation>;
  approveProgramRecommendation(id: number, specialistId: string, notes?: string): Promise<ProgramRecommendation>;
  
  // Workout Logs
  logWorkout(log: Omit<WorkoutLog, "id" | "createdAt">): Promise<WorkoutLog>;
  getPatientWorkoutLogs(patientId: string): Promise<WorkoutLog[]>;
  getRecentWorkoutLogs(patientId: string, limit: number): Promise<WorkoutLog[]>;
  
  // Small Wins
  recordSmallWin(win: Omit<SmallWin, "id" | "createdAt">): Promise<SmallWin>;
  getPatientSmallWins(patientId: string): Promise<SmallWin[]>;
  celebrateSmallWin(winId: number, specialistId: string): Promise<SmallWin | undefined>;
  countSmallWinsThisWeek(): Promise<number>;
  countSmallWinsByPatient(patientId: string): Promise<number>;
  
  // Sessions/Appointments
  scheduleSession(session: Omit<SessionAppointment, "id" | "createdAt" | "updatedAt">): Promise<SessionAppointment>;
  getTodaySessions(specialistId: string): Promise<SessionAppointment[]>;
  getUpcomingSessions(specialistId: string, days: number): Promise<SessionAppointment[]>;
  getPatientSessions(patientId: string): Promise<SessionAppointment[]>;
  
  // Messages
  sendMessage(message: Omit<Message, "id" | "createdAt">): Promise<Message>;
  getConversation(user1Id: string, user2Id: string): Promise<Message[]>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Dashboard data
  getSpecialistDashboardStats(specialistId: string): Promise<{
    totalPatients: number;
    activePrograms: number;
    smallWins: number;
  }>;
  getPatientActivities(specialistId: string, limit: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with demo user
    this.ensureDemoUser().catch(err => {
      console.error("Error creating demo user:", err);
    });
  }
  
  // Create demo user if it doesn't exist
  private async ensureDemoUser() {
    try {
      // Check if demo user exists
      const demoUser = await this.getUser("demo-user");
      if (!demoUser) {
        // Create demo user
        await this.upsertUser({
          id: "demo-user",
          email: "demo@nowercise.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
          role: "specialist"
        });
        console.log("Demo user created successfully");
      }
    } catch (error) {
      console.error("Error in ensureDemoUser:", error);
    }
  }
  
  // User Operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Patient-Specialist relationships
  async getPatientsBySpecialistId(specialistId: string): Promise<User[]> {
    const result = await db
      .select({
        patient: users
      })
      .from(patientSpecialists)
      .innerJoin(users, eq(patientSpecialists.patientId, users.id))
      .where(eq(patientSpecialists.specialistId, specialistId));
    
    return result.map(r => r.patient);
  }

  async getSpecialistsByPatientId(patientId: string): Promise<User[]> {
    const result = await db
      .select({
        specialist: users
      })
      .from(patientSpecialists)
      .innerJoin(users, eq(patientSpecialists.specialistId, users.id))
      .where(eq(patientSpecialists.patientId, patientId));
    
    return result.map(r => r.specialist);
  }

  async assignPatientToSpecialist(patientId: string, specialistId: string): Promise<void> {
    await db
      .insert(patientSpecialists)
      .values({
        patientId,
        specialistId
      })
      .onConflictDoNothing({
        target: [patientSpecialists.patientId, patientSpecialists.specialistId]
      });
  }

  // Patient Profiles
  async getPatientProfile(userId: string): Promise<PatientProfile | undefined> {
    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, userId));
    return profile;
  }

  async createPatientProfile(profile: Omit<PatientProfile, "id" | "createdAt" | "updatedAt">): Promise<PatientProfile> {
    const [newProfile] = await db
      .insert(patientProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updatePatientProfile(userId: string, profile: Partial<PatientProfile>): Promise<PatientProfile | undefined> {
    const [updatedProfile] = await db
      .update(patientProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(patientProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Exercises
  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));
    return exercise;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercisesByEnergyLevel(level: number): Promise<Exercise[]> {
    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.energyLevel, level));
  }

  async createExercise(exercise: Omit<Exercise, "id" | "createdAt" | "updatedAt">): Promise<Exercise> {
    const [newExercise] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    return newExercise;
  }

  // Programs
  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));
    return program;
  }

  async getProgramsBySpecialist(specialistId: string): Promise<Program[]> {
    return await db
      .select()
      .from(programs)
      .where(eq(programs.createdBy, specialistId));
  }

  async createProgram(program: Omit<Program, "id" | "createdAt" | "updatedAt">): Promise<Program> {
    const [newProgram] = await db
      .insert(programs)
      .values(program)
      .returning();
    return newProgram;
  }

  async getProgramWorkouts(programId: number): Promise<(ProgramWorkout & { exercise: Exercise })[]> {
    const workouts = await db
      .select({
        workout: programWorkouts,
        exercise: exercises
      })
      .from(programWorkouts)
      .innerJoin(exercises, eq(programWorkouts.exerciseId, exercises.id))
      .where(eq(programWorkouts.programId, programId))
      .orderBy(programWorkouts.day, programWorkouts.order);
    
    return workouts.map(w => ({ ...w.workout, exercise: w.exercise }));
  }

  async addExerciseToProgram(workout: Omit<ProgramWorkout, "id">): Promise<ProgramWorkout> {
    const [newWorkout] = await db
      .insert(programWorkouts)
      .values(workout)
      .returning();
    return newWorkout;
  }

  // Program Assignments
  async assignProgramToPatient(assignment: Omit<ProgramAssignment, "id" | "createdAt" | "updatedAt">): Promise<ProgramAssignment> {
    const [newAssignment] = await db
      .insert(programAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async getPatientAssignments(patientId: string): Promise<(ProgramAssignment & { program: Program })[]> {
    const assignments = await db
      .select({
        assignment: programAssignments,
        program: programs
      })
      .from(programAssignments)
      .innerJoin(programs, eq(programAssignments.programId, programs.id))
      .where(eq(programAssignments.patientId, patientId));
    
    return assignments.map(a => ({ ...a.assignment, program: a.program }));
  }

  async getProgramAssignment(id: number): Promise<(ProgramAssignment & { program: Program }) | undefined> {
    const [assignment] = await db
      .select({
        assignment: programAssignments,
        program: programs
      })
      .from(programAssignments)
      .innerJoin(programs, eq(programAssignments.programId, programs.id))
      .where(eq(programAssignments.id, id));
    
    if (!assignment) return undefined;
    return { ...assignment.assignment, program: assignment.program };
  }

  // Workout Logs
  async logWorkout(log: Omit<WorkoutLog, "id" | "createdAt">): Promise<WorkoutLog> {
    const [newLog] = await db
      .insert(workoutLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getPatientWorkoutLogs(patientId: string): Promise<WorkoutLog[]> {
    return await db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.patientId, patientId))
      .orderBy(desc(workoutLogs.date));
  }

  async getRecentWorkoutLogs(patientId: string, limit: number): Promise<WorkoutLog[]> {
    return await db
      .select()
      .from(workoutLogs)
      .where(eq(workoutLogs.patientId, patientId))
      .orderBy(desc(workoutLogs.date))
      .limit(limit);
  }

  // Small Wins
  async recordSmallWin(win: Omit<SmallWin, "id" | "createdAt">): Promise<SmallWin> {
    const [newWin] = await db
      .insert(smallWins)
      .values(win)
      .returning();
    return newWin;
  }

  async getPatientSmallWins(patientId: string): Promise<SmallWin[]> {
    return await db
      .select()
      .from(smallWins)
      .where(eq(smallWins.patientId, patientId))
      .orderBy(desc(smallWins.createdAt));
  }

  async celebrateSmallWin(winId: number, specialistId: string): Promise<SmallWin | undefined> {
    const [win] = await db
      .update(smallWins)
      .set({ 
        celebratedBy: specialistId,
        celebratedAt: new Date()
      })
      .where(eq(smallWins.id, winId))
      .returning();
    return win;
  }

  async countSmallWinsThisWeek(): Promise<number> {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [result] = await db
      .select({ count: count() })
      .from(smallWins)
      .where(gte(smallWins.createdAt, oneWeekAgo));
    
    return result.count;
  }

  async countSmallWinsByPatient(patientId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(smallWins)
      .where(eq(smallWins.patientId, patientId));
    
    return result.count;
  }

  // Sessions/Appointments
  async scheduleSession(session: Omit<SessionAppointment, "id" | "createdAt" | "updatedAt">): Promise<SessionAppointment> {
    const [newSession] = await db
      .insert(sessions_appointments)
      .values(session)
      .returning();
    return newSession;
  }

  async getTodaySessions(specialistId: string): Promise<SessionAppointment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(sessions_appointments)
      .where(and(
        eq(sessions_appointments.specialistId, specialistId),
        eq(sessions_appointments.date, today)
      ))
      .orderBy(sessions_appointments.time);
  }

  async getUpcomingSessions(specialistId: string, days: number): Promise<SessionAppointment[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db
      .select()
      .from(sessions_appointments)
      .where(and(
        eq(sessions_appointments.specialistId, specialistId),
        gte(sessions_appointments.date, today.toISOString().split('T')[0]),
        lte(sessions_appointments.date, futureDate.toISOString().split('T')[0])
      ))
      .orderBy(sessions_appointments.date, sessions_appointments.time);
  }

  async getPatientSessions(patientId: string): Promise<SessionAppointment[]> {
    return await db
      .select()
      .from(sessions_appointments)
      .where(eq(sessions_appointments.patientId, patientId))
      .orderBy(sessions_appointments.date, sessions_appointments.time);
  }

  // Messages
  async sendMessage(message: Omit<Message, "id" | "createdAt">): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.recipientId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.recipientId, user1Id)
          )
        )
      )
      .orderBy(messages.createdAt);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(and(
        eq(messages.recipientId, userId),
        eq(messages.read, false)
      ));
    
    return result.count;
  }

  // Dashboard Data
  async getSpecialistDashboardStats(specialistId: string): Promise<{
    totalPatients: number;
    activePrograms: number;
    smallWins: number;
  }> {
    // Get total patients
    const [patientsResult] = await db
      .select({ count: count() })
      .from(patientSpecialists)
      .where(eq(patientSpecialists.specialistId, specialistId));
    
    // Get active programs
    const [programsResult] = await db
      .select({ count: count() })
      .from(programAssignments)
      .where(and(
        eq(programAssignments.specialistId, specialistId),
        eq(programAssignments.status, 'active')
      ));
    
    // Get total small wins of all patients
    const patientIds = await this.getPatientsBySpecialistId(specialistId).then(patients => patients.map(p => p.id));
    
    let smallWinsCount = 0;
    if (patientIds.length > 0) {
      const [smallWinsResult] = await db
        .select({ count: count() })
        .from(smallWins)
        .where(inArray(smallWins.patientId, patientIds));
      
      smallWinsCount = smallWinsResult.count;
    }
    
    return {
      totalPatients: patientsResult.count,
      activePrograms: programsResult.count,
      smallWins: smallWinsCount
    };
  }

  async getPatientActivities(specialistId: string, limit: number): Promise<any[]> {
    // This is a complex query that joins multiple tables
    // For simplicity, we'll implement a basic version that returns recent workout logs
    const patientIds = await this.getPatientsBySpecialistId(specialistId).then(patients => patients.map(p => p.id));
    
    if (patientIds.length === 0) return [];
    
    const logs = await db
      .select({
        log: workoutLogs,
        patient: users
      })
      .from(workoutLogs)
      .innerJoin(users, eq(workoutLogs.patientId, users.id))
      .where(inArray(workoutLogs.patientId, patientIds))
      .orderBy(desc(workoutLogs.createdAt))
      .limit(limit);
    
    return logs.map(l => ({
      type: 'workout_log',
      createdAt: l.log.createdAt,
      patient: l.patient,
      data: l.log
    }));
  }
}

// The `or` function is already imported at the top of the file

export const storage = new DatabaseStorage();
