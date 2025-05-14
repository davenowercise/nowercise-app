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
  safetyChecks,
  calendarEvents,
  bodyMeasurements,
  progressPhotos,
  goals,
  habits,
  habitLogs,
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
  type ProgramRecommendation,
  type SafetyCheck,
  type CalendarEvent,
  type BodyMeasurement,
  type ProgressPhoto,
  type Goal,
  type Habit,
  type HabitLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, inArray, desc, sql, count, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Safety Checks
  storeSafetyCheck(data: Omit<SafetyCheck, "id" | "checkDate" | "createdAt" | "updatedAt">): Promise<SafetyCheck>;
  getSafetyCheckByUserId(userId: string): Promise<SafetyCheck | undefined>;
  getSafetyCheckHistory(userId: string): Promise<SafetyCheck[]>;
  
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
  
  // Calendar Events
  getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, userId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number, userId: string): Promise<boolean>;
  
  // Body Measurements
  getBodyMeasurements(userId: string, limit?: number): Promise<BodyMeasurement[]>;
  createBodyMeasurement(measurement: Omit<BodyMeasurement, "id" | "createdAt">): Promise<BodyMeasurement>;
  
  // Progress Photos
  getProgressPhotos(userId: string, photoType?: string): Promise<ProgressPhoto[]>;
  createProgressPhoto(photo: Omit<ProgressPhoto, "id" | "createdAt">): Promise<ProgressPhoto>;
  
  // Goals
  getGoals(userId: string, completed?: boolean): Promise<Goal[]>;
  createGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal>;
  updateGoal(id: number, userId: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  
  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  createHabit(habit: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit>;
  logHabit(habitLog: Omit<HabitLog, "id" | "createdAt">): Promise<HabitLog>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with demo user
    this.ensureDemoUser().catch(err => {
      console.error("Error creating demo user:", err);
    });
    
    // Also ensure we have a patient profile for the demo user
    this.ensureDemoPatientProfile().catch(err => {
      console.error("Error creating demo patient profile:", err);
    });
    
    // Create a demo assessment
    this.ensureDemoAssessment().catch(err => {
      console.error("Error creating demo assessment:", err);
    });
    
    // Create demo exercises
    this.ensureDemoExercises().catch(err => {
      console.error("Error creating demo exercises:", err);
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
  
  // Create demo patient profile if it doesn't exist
  private async ensureDemoPatientProfile() {
    try {
      // Check if demo patient profile exists
      const demoProfile = await this.getPatientProfile("demo-user");
      if (!demoProfile) {
        // Create demo patient profile that matches our schema
        await this.createPatientProfile({
          userId: "demo-user",
          gender: "prefer-not-to-say",
          age: 42,
          cancerType: "Breast",
          treatmentStage: "Recovery",
          treatmentNotes: "Demo patient for testing the system",
          treatmentsReceived: ["surgery", "chemotherapy"],
          lymphoedemaRisk: true,
          comorbidities: ["hypertension"],
          medicationEffects: ["fatigue", "joint pain"]
        });
        console.log("Demo patient profile created successfully");
      }
    } catch (error) {
      console.error("Error in ensureDemoPatientProfile:", error);
    }
  }
  
  // Create a demo assessment if it doesn't exist
  private async ensureDemoAssessment() {
    try {
      // Check if demo user has any assessments
      const assessments = await this.getPhysicalAssessmentsByPatient("demo-user");
      
      if (assessments.length === 0) {
        // Create a demo assessment
        await this.createPhysicalAssessment({
          userId: "demo-user",
          energyLevel: 6,
          painLevel: 3,
          mobilityStatus: 2, // 0=low, 1=limited, 2=moderate, 3=good, 4=excellent
          location: "home",
          physicalRestrictions: ["Shoulder ROM", "Weight bearing"],
          restrictionNotes: "Limited range of motion in right arm",
          stressLevel: 4,
          sleepQuality: 2, // 0=poor, 1=fair, 2=moderate, 3=good, 4=excellent
          confidenceLevel: 2, // 0=very low, 1=low, 2=moderate, 3=high, 4=very high
          priorFitnessLevel: 2, // 0=sedentary, 1=light, 2=moderate, 3=active, 4=very active
          exercisePreferences: ["walking", "yoga", "water exercise"],
          exerciseDislikes: ["high-impact"],
          priorInjuries: ["shoulder surgery"],
          motivationLevel: 2, // 0=very low, 1=low, 2=moderate, 3=high, 4=very high
          movementConfidence: 2, // 0=very low, 1=low, 2=moderate, 3=high, 4=very high
          weeklyExerciseGoal: "3 sessions",
          timePerSession: 30,
          fearOfInjury: true,
          equipmentAvailable: ["resistance bands", "light weights"],
          exerciseEnvironment: 0, // 0=home, 1=gym, 2=outdoors, 3=pool
          caregiverSupport: 2, // 0=none, 1=little, 2=some, 3=good, 4=excellent
          sessionFormatPreference: ["video", "written"],
          accessibilityNeeds: null
        });
        console.log("Demo assessment created successfully");
      }
    } catch (error) {
      console.error("Error in ensureDemoAssessment:", error);
    }
  }
  
  // Create demo exercises if they don't exist
  private async ensureDemoExercises() {
    try {
      // Check if we have any exercises
      const exercises = await this.getAllExercises();
      
      if (exercises.length === 0) {
        // Create demo exercises with different energy levels
        const demoExercises = [
          {
            name: "Gentle Chair Yoga",
            description: "A gentle yoga routine that can be performed while seated, ideal for those with limited mobility or low energy.",
            energyLevel: 2,
            duration: 10,
            cancerAppropriate: ["Breast", "Colorectal", "Lung", "Prostate", "Lymphoma"],
            treatmentPhases: ["During Treatment", "Recovery", "Remission"],
            bodyFocus: ["Upper Body", "Core", "Flexibility"],
            benefits: ["Improved Flexibility", "Stress Reduction", "Gentle Strengthening"],
            movementType: "Flexibility",
            equipment: ["Chair"],
            videoUrl: "https://example.com/chair-yoga",
            imageUrl: "https://example.com/chair-yoga.jpg",
            instructionSteps: [
              "Sit comfortably in a chair with feet flat on the floor",
              "Take 5 deep breaths, focusing on your breathing",
              "Gently raise your arms overhead as you inhale",
              "Lower your arms as you exhale",
              "Repeat 5-10 times at your own pace"
            ],
            precautions: "Stop if you feel any pain or discomfort. Avoid positions that stress surgical sites.",
            modifications: "Can be done with arm support if needed. Use pillows for support if necessary.",
            citations: "Smith et al. (2021). Gentle yoga for cancer recovery.",
            createdBy: "demo-user"
          },
          {
            name: "Lymphatic Drainage Arm Exercise",
            description: "A gentle exercise to help reduce swelling in arms for those at risk of lymphedema.",
            energyLevel: 3,
            duration: 15,
            cancerAppropriate: ["Breast", "Lymphoma", "Melanoma"],
            treatmentPhases: ["During Treatment", "Recovery", "Remission"],
            bodyFocus: ["Upper Body", "Lymphatic System"],
            benefits: ["Lymphedema Management", "Improved Circulation", "Reduced Swelling"],
            movementType: "Therapeutic",
            equipment: [],
            videoUrl: "https://example.com/lymphatic-drainage",
            imageUrl: "https://example.com/lymphatic-drainage.jpg",
            instructionSteps: [
              "Sit or stand comfortably with good posture",
              "Begin with deep breathing exercises for 1 minute",
              "Gently stroke from wrist to elbow with opposite hand",
              "Continue stroking from elbow to shoulder",
              "Repeat 10-15 times each arm"
            ],
            precautions: "Always stroke toward the heart. Use very gentle pressure. Consult your healthcare provider first.",
            modifications: "Can be done lying down if preferred. Pressure should be extremely light.",
            citations: "Johnson et al. (2020). Self-care methods for managing lymphedema.",
            createdBy: "demo-user"
          },
          {
            name: "Modified Rowing Exercise",
            description: "A moderate intensity exercise that helps strengthen the back and arms while being adaptable to different energy levels.",
            energyLevel: 5,
            duration: 20,
            cancerAppropriate: ["Breast", "Colorectal", "Prostate", "Lymphoma"],
            treatmentPhases: ["Recovery", "Remission"],
            bodyFocus: ["Upper Body", "Back", "Strength"],
            benefits: ["Improved Strength", "Posture Enhancement", "Increased Energy"],
            movementType: "Strength",
            equipment: ["Resistance Band", "Chair"],
            videoUrl: "https://example.com/modified-rowing",
            imageUrl: "https://example.com/modified-rowing.jpg",
            instructionSteps: [
              "Secure a resistance band around a sturdy object at mid-chest height",
              "Hold the ends of the band with both hands, arms extended",
              "Sit with good posture, engage your core",
              "Pull the band toward your chest, squeezing shoulder blades together",
              "Slowly return to starting position",
              "Start with 5 repetitions, building to 10-15"
            ],
            precautions: "Avoid if you have had recent shoulder or upper body surgery. Maintain good posture throughout.",
            modifications: "Can be done with lighter resistance or fewer repetitions. Seated position can be used for those with balance issues.",
            citations: "Williams et al. (2022). Resistance training for cancer survivors.",
            createdBy: "demo-user"
          },
          {
            name: "Walking Meditation",
            description: "A mindful walking practice that combines gentle movement with meditation to reduce stress and enhance well-being.",
            energyLevel: 4,
            duration: 15,
            cancerAppropriate: ["All"],
            treatmentPhases: ["During Treatment", "Recovery", "Remission"],
            bodyFocus: ["Full Body", "Mental Wellbeing"],
            benefits: ["Stress Reduction", "Improved Mood", "Gentle Cardio"],
            movementType: "Cardio",
            equipment: ["Comfortable Shoes"],
            videoUrl: "https://example.com/walking-meditation",
            imageUrl: "https://example.com/walking-meditation.jpg",
            instructionSteps: [
              "Find a quiet path where you can walk undisturbed",
              "Begin walking at a comfortable, slow pace",
              "Focus on your breathing, taking deep breaths",
              "Notice the sensation of your feet touching the ground",
              "When your mind wanders, gently bring attention back to your walking",
              "Start with 5 minutes and gradually increase duration"
            ],
            precautions: "Choose level terrain if you have balance issues. Avoid extreme weather conditions.",
            modifications: "Can be done indoors in a hallway or large room. Use a walking aid if needed.",
            citations: "Brown et al. (2019). Mindful movement in cancer care.",
            createdBy: "demo-user"
          },
          {
            name: "Aquatic Gentle Movement",
            description: "Water-based gentle exercises that utilize water's resistance and buoyancy for a supportive workout environment.",
            energyLevel: 3,
            duration: 30,
            cancerAppropriate: ["Breast", "Colorectal", "Prostate", "Gynecological"],
            treatmentPhases: ["Recovery", "Remission"],
            bodyFocus: ["Full Body", "Joints", "Cardio"],
            benefits: ["Joint Protection", "Improved Mobility", "Weight Support"],
            movementType: "Aquatic",
            equipment: ["Swimming Pool", "Water Noodle"],
            videoUrl: "https://example.com/aquatic-movement",
            imageUrl: "https://example.com/aquatic-movement.jpg",
            instructionSteps: [
              "Enter water that's approximately chest height",
              "Begin with gentle walking in the water for 3-5 minutes",
              "Hold the pool edge and do gentle leg movements to the front and side",
              "Use a water noodle under arms for support while doing small kicks",
              "Perform arm circles while standing in place",
              "Complete 10-15 minutes of movement, resting as needed"
            ],
            precautions: "Avoid if you have open wounds or active infection. Wait for radiation skin reactions to fully heal before swimming.",
            modifications: "Depth of water can be adjusted based on comfort. Use flotation devices for additional support.",
            citations: "Fernandez et al. (2021). Aquatic therapy for cancer rehabilitation.",
            createdBy: "demo-user"
          },
          {
            name: "Energizing Morning Stretch Routine",
            description: "A gentle morning routine to increase energy levels and prepare the body for the day ahead.",
            energyLevel: 4,
            duration: 10,
            cancerAppropriate: ["All"],
            treatmentPhases: ["During Treatment", "Recovery", "Remission"],
            bodyFocus: ["Full Body", "Flexibility", "Energy"],
            benefits: ["Increased Energy", "Improved Circulation", "Better Morning Alertness"],
            movementType: "Stretching",
            equipment: [],
            videoUrl: "https://example.com/morning-stretch",
            imageUrl: "https://example.com/morning-stretch.jpg",
            instructionSteps: [
              "Begin by sitting on the edge of your bed or on a chair",
              "Take 5 deep breaths, focusing on filling your lungs completely",
              "Roll your shoulders backwards 5 times, then forwards 5 times",
              "Gently tilt your head from side to side",
              "Stretch arms overhead and take a gentle side bend each way",
              "Stand (if able) and perform a gentle forward fold, bending knees as needed",
              "Finish with 5 more deep breaths"
            ],
            precautions: "Avoid deep stretching immediately after waking. Use caution with head movements if you have dizziness.",
            modifications: "All stretches can be done seated. Limit range of motion near surgical sites.",
            citations: "Lee et al. (2020). Morning movement routines for cancer-related fatigue.",
            createdBy: "demo-user"
          }
        ];
        
        // Create each exercise
        for (const exercise of demoExercises) {
          await this.createExercise(exercise);
        }
        
        console.log("Demo exercises created successfully");
      }
    } catch (error) {
      console.error("Error in ensureDemoExercises:", error);
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
  
  // Safety Check methods
  async storeSafetyCheck(data: Omit<SafetyCheck, "id" | "checkDate" | "createdAt" | "updatedAt">): Promise<SafetyCheck> {
    const [storedCheck] = await db
      .insert(safetyChecks)
      .values(data)
      .returning();
    
    return storedCheck;
  }
  
  async getSafetyCheckByUserId(userId: string): Promise<SafetyCheck | undefined> {
    // Get the most recent safety check for this user
    const [latestCheck] = await db
      .select()
      .from(safetyChecks)
      .where(eq(safetyChecks.userId, userId))
      .orderBy(desc(safetyChecks.checkDate))
      .limit(1);
    
    return latestCheck;
  }
  
  async getSafetyCheckHistory(userId: string): Promise<SafetyCheck[]> {
    // Get all safety checks for this user, ordered by most recent first
    const checks = await db
      .select()
      .from(safetyChecks)
      .where(eq(safetyChecks.userId, userId))
      .orderBy(desc(safetyChecks.checkDate));
    
    return checks;
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
  
  // Physical Assessments
  async getPhysicalAssessment(id: number): Promise<PhysicalAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(physicalAssessments)
      .where(eq(physicalAssessments.id, id));
    return assessment;
  }
  
  async getPhysicalAssessmentsByPatient(patientId: string): Promise<PhysicalAssessment[]> {
    return await db
      .select()
      .from(physicalAssessments)
      .where(eq(physicalAssessments.userId, patientId))
      .orderBy(desc(physicalAssessments.assessmentDate));
  }
  
  async createPhysicalAssessment(assessment: Omit<PhysicalAssessment, "id" | "assessmentDate" | "createdAt" | "updatedAt">): Promise<PhysicalAssessment> {
    // Ensure all required fields have values
    const assessmentData = {
      ...assessment,
      assessmentDate: new Date(),
      cancerType: assessment.cancerType || null,
      treatmentStage: assessment.treatmentStage || null,
      treatmentNotes: assessment.treatmentNotes || null,
      age: assessment.age || null,
      gender: assessment.gender || null,
      energyLevel: assessment.energyLevel || 5,
      painLevel: assessment.painLevel || null,
      confidenceLevel: assessment.confidenceLevel || null,
      mobilityStatus: assessment.mobilityStatus || null
    };

    const [newAssessment] = await db
      .insert(physicalAssessments)
      .values(assessmentData)
      .returning();
    return newAssessment;
  }
  
  // Exercise Recommendations
  async getExerciseRecommendations(patientId: string, assessmentId?: number): Promise<ExerciseRecommendation[]> {
    let query = db
      .select({
        recommendation: exerciseRecommendations,
        exercise: exercises
      })
      .from(exerciseRecommendations)
      .innerJoin(exercises, eq(exerciseRecommendations.exerciseId, exercises.id))
      .where(eq(exerciseRecommendations.patientId, patientId));
    
    if (assessmentId) {
      query = query.where(eq(exerciseRecommendations.assessmentId, assessmentId));
    }
    
    const results = await query.orderBy(desc(exerciseRecommendations.dateGenerated));
    
    return results.map(result => ({
      ...result.recommendation,
      exercise: result.exercise
    }));
  }
  
  async createExerciseRecommendation(recommendation: Omit<ExerciseRecommendation, "id" | "dateGenerated" | "createdAt" | "updatedAt">): Promise<ExerciseRecommendation> {
    const recommendationData = {
      ...recommendation,
      dateGenerated: new Date(),
      specialistId: recommendation.specialistId || null,
      specialistNotes: recommendation.specialistNotes || null
    };
    
    const [newRecommendation] = await db
      .insert(exerciseRecommendations)
      .values(recommendationData)
      .returning();
    return newRecommendation;
  }
  
  async approveExerciseRecommendation(id: number, specialistId: string, notes?: string): Promise<ExerciseRecommendation> {
    const [updatedRecommendation] = await db
      .update(exerciseRecommendations)
      .set({
        status: 'approved',
        specialistId,
        specialistNotes: notes || '',
        updatedAt: new Date()
      })
      .where(eq(exerciseRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }
  
  // Program Recommendations
  async getProgramRecommendations(patientId: string, assessmentId?: number): Promise<ProgramRecommendation[]> {
    let query = db
      .select({
        recommendation: programRecommendations,
        program: programs
      })
      .from(programRecommendations)
      .innerJoin(programs, eq(programRecommendations.programId, programs.id))
      .where(eq(programRecommendations.patientId, patientId));
    
    if (assessmentId) {
      query = query.where(eq(programRecommendations.assessmentId, assessmentId));
    }
    
    const results = await query.orderBy(desc(programRecommendations.dateGenerated));
    
    return results.map(result => ({
      ...result.recommendation,
      program: result.program
    }));
  }
  
  async createProgramRecommendation(recommendation: Omit<ProgramRecommendation, "id" | "dateGenerated" | "createdAt" | "updatedAt">): Promise<ProgramRecommendation> {
    const recommendationData = {
      ...recommendation,
      dateGenerated: new Date(),
      specialistId: recommendation.specialistId || null,
      specialistNotes: recommendation.specialistNotes || null
    };
    
    const [newRecommendation] = await db
      .insert(programRecommendations)
      .values(recommendationData)
      .returning();
    return newRecommendation;
  }
  
  async approveProgramRecommendation(id: number, specialistId: string, notes?: string): Promise<ProgramRecommendation> {
    const [updatedRecommendation] = await db
      .update(programRecommendations)
      .set({
        status: 'approved',
        specialistId,
        specialistNotes: notes || '',
        updatedAt: new Date()
      })
      .where(eq(programRecommendations.id, id))
      .returning();
    return updatedRecommendation;
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
