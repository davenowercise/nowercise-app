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
  cardioActivities,
  dailyCheckIns,
  medicalResearchSources,
  exerciseGuidelines,
  symptomManagementGuidelines,
  medicalOrganizationGuidelines,
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
  type HabitLog,
  type CardioActivity,
  type DailyCheckIn,
  type MedicalResearchSource,
  type ExerciseGuideline,
  type SymptomManagementGuideline,
  type MedicalOrganizationGuideline
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, inArray, desc, asc, sql, count, or } from "drizzle-orm";

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
  getAllPrograms(): Promise<Program[]>;
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
  // Review workflow methods
  getPendingRecommendations(specialistId?: string, status?: string): Promise<any[]>;
  getAssessmentDetails(assessmentId: string | number): Promise<any>;
  getExerciseRecommendationsForReview(assessmentId: string | number): Promise<ExerciseRecommendation[]>;
  getProgramRecommendationsForReview(assessmentId: string | number): Promise<ProgramRecommendation[]>;
  updateRecommendationStatus(
    assessmentId: string | number,
    specialistId: string,
    status: string,
    notes?: string
  ): Promise<any>;
  
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
  
  // Cardio Activities
  getCardioActivities(userId: string, limit?: number): Promise<CardioActivity[]>;
  getCardioActivityById(id: number): Promise<CardioActivity | undefined>;
  getCardioActivitiesByDateRange(userId: string, startDate: string, endDate: string): Promise<CardioActivity[]>;
  createCardioActivity(activity: Omit<CardioActivity, "id" | "createdAt">): Promise<CardioActivity>;
  updateCardioActivity(id: number, userId: string, updates: Partial<CardioActivity>): Promise<CardioActivity | undefined>;
  deleteCardioActivity(id: number, userId: string): Promise<boolean>;
  getCardioStats(userId: string, period: 'week' | 'month' | 'year'): Promise<{
    totalActivities: number;
    totalDuration: number;
    totalDistance: number;
    activitiesByType: Record<string, number>;
    avgHeartRate: number | null;
    avgEnergy: number | null;
  }>;
  
  // Daily Check-ins
  getDailyCheckIns(userId: string, limit?: number): Promise<DailyCheckIn[]>;
  getDailyCheckInsByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyCheckIn[]>;
  getDailyCheckInById(id: number): Promise<DailyCheckIn | undefined>;
  getTodayCheckIn(userId: string): Promise<DailyCheckIn | undefined>;
  createDailyCheckIn(checkIn: Omit<DailyCheckIn, "id" | "createdAt">): Promise<DailyCheckIn>;
  updateDailyCheckIn(id: number, userId: string, updates: Partial<DailyCheckIn>): Promise<DailyCheckIn | undefined>;
  generateRecommendationsFromCheckIn(userId: string, checkInId: number): Promise<{
    exercises: ExerciseRecommendation[];
    programs: ProgramRecommendation[];
  }>;
  
  // Medical Research Sources
  getMedicalResearchSources(limit?: number): Promise<MedicalResearchSource[]>;
  getMedicalResearchSourceById(id: number): Promise<MedicalResearchSource | undefined>;
  createMedicalResearchSource(source: Omit<MedicalResearchSource, "id" | "createdAt" | "updatedAt">): Promise<MedicalResearchSource>;
  updateMedicalResearchSource(id: number, updates: Partial<MedicalResearchSource>): Promise<MedicalResearchSource | undefined>;
  
  // Exercise Guidelines
  getExerciseGuidelines(cancerType?: string, treatmentPhase?: string): Promise<ExerciseGuideline[]>;
  getExerciseGuidelineById(id: number): Promise<ExerciseGuideline | undefined>;
  createExerciseGuideline(guideline: Omit<ExerciseGuideline, "id" | "createdAt" | "updatedAt">): Promise<ExerciseGuideline>;
  updateExerciseGuideline(id: number, updates: Partial<ExerciseGuideline>): Promise<ExerciseGuideline | undefined>;
  
  // Symptom Management Guidelines
  getSymptomManagementGuidelines(symptomName?: string): Promise<SymptomManagementGuideline[]>;
  getSymptomManagementGuidelineById(id: number): Promise<SymptomManagementGuideline | undefined>;
  createSymptomManagementGuideline(guideline: Omit<SymptomManagementGuideline, "id" | "createdAt" | "updatedAt">): Promise<SymptomManagementGuideline>;
  updateSymptomManagementGuideline(id: number, updates: Partial<SymptomManagementGuideline>): Promise<SymptomManagementGuideline | undefined>;
  
  // Medical Organization Guidelines
  getMedicalOrganizationGuidelines(organizationName?: string): Promise<MedicalOrganizationGuideline[]>;
  getMedicalOrganizationGuidelineById(id: number): Promise<MedicalOrganizationGuideline | undefined>;
  createMedicalOrganizationGuideline(guideline: Omit<MedicalOrganizationGuideline, "id" | "createdAt" | "updatedAt">): Promise<MedicalOrganizationGuideline>;
  updateMedicalOrganizationGuideline(id: number, updates: Partial<MedicalOrganizationGuideline>): Promise<MedicalOrganizationGuideline | undefined>;
  
  // Research-based query methods
  getExerciseRecommendationsByMedicalGuidelines(
    patientProfile: PatientProfile, 
    assessment: PhysicalAssessment
  ): Promise<Exercise[]>;
  
  getExerciseSafetyGuidelines(
    cancerType: string, 
    treatmentPhase: string, 
    comorbidities?: string[]
  ): Promise<{
    safe: string[];
    caution: string[];
    avoid: string[];
  }>;
  
  // Daily Check-ins
  getDailyCheckIns(userId: string, limit?: number): Promise<DailyCheckIn[]>;
  getDailyCheckInsByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyCheckIn[]>;
  getDailyCheckInById(id: number): Promise<DailyCheckIn | undefined>;
  getTodayCheckIn(userId: string): Promise<DailyCheckIn | undefined>;
  createDailyCheckIn(checkIn: Omit<DailyCheckIn, "id" | "createdAt">): Promise<DailyCheckIn>;
  updateDailyCheckIn(id: number, userId: string, updates: Partial<DailyCheckIn>): Promise<DailyCheckIn | undefined>;
  generateRecommendationsFromCheckIn(userId: string, checkInId: number): Promise<{
    exercises: ExerciseRecommendation[];
    programs: ProgramRecommendation[];
  }>;
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
    
    // Create demo medical research and guidelines
    this.ensureDemoMedicalResearch().catch(err => {
      console.error("Error creating demo medical research:", err);
    });
  }
  
  // Create demo medical research and guidelines if they don't exist
  private async ensureDemoMedicalResearch() {
    try {
      // Check if we have any medical research sources
      const sources = await this.getMedicalResearchSources(1);
      
      if (sources.length === 0) {
        // Create demo medical research sources
        const source1 = await this.createMedicalResearchSource({
          title: "Exercise Guidelines for Cancer Survivors: Consensus Statement from International Multidisciplinary Roundtable",
          authors: "Campbell KL, Winters-Stone KM, Wiskemann J, et al.",
          institution: "American College of Sports Medicine",
          publicationDate: new Date("2019-11-01"),
          journalName: "Medicine & Science in Sports & Exercise",
          volume: "51",
          issueNumber: "11",
          pages: "2375-2390",
          doi: "10.1249/MSS.0000000000002116",
          url: "https://journals.lww.com/acsm-msse/Fulltext/2019/11000/Exercise_Guidelines_for_Cancer_Survivors_.23.aspx",
          abstract: "The number of cancer survivors worldwide is growing, with over 15.5 million cancer survivors in the United States alone—a figure expected to double by 2040. With improvements in early detection and treatment strategies, cancer death rates have decreased by 27% in the past 25 years. Thus, there is a clear need to focus on enhancing survivorship outcomes, including quality of life, physical function, and the potential for exercise to reduce the rate of cancer recurrence. The role of exercise following a cancer diagnosis has been evaluated in randomized controlled trials and observational studies, with a growing body of evidence supporting the benefits of regular exercise for improved physical functioning, quality of life, and symptoms such as anxiety, depression, and cancer-related fatigue.",
          fullTextAccess: true,
          peerReviewed: true,
          citationCount: 782,
          qualityRating: 5
        });
        
        const source2 = await this.createMedicalResearchSource({
          title: "Safety and efficacy of exercise interventions in cancer patients",
          authors: "Schmitz KH, Courneya KS, Matthews C, et al.",
          institution: "University of Pennsylvania",
          publicationDate: new Date("2020-03-15"),
          journalName: "CA: A Cancer Journal for Clinicians",
          volume: "70",
          issueNumber: "2",
          pages: "116-140",
          doi: "10.3322/caac.21595",
          url: "https://acsjournals.onlinelibrary.wiley.com/doi/full/10.3322/caac.21595",
          abstract: "There is a growing body of evidence regarding the benefits of physical activity and exercise for cancer patients and survivors. This comprehensive review evaluates the safety and efficacy of exercise interventions during and following cancer treatment. Across various types of cancer and treatment modalities, exercise has been found to be generally safe when properly prescribed and supervised. Exercise interventions have shown numerous benefits including improved physical functioning, reduced fatigue, and enhanced quality of life. Key considerations for exercise prescription in cancer populations include tailoring programs based on treatment side effects, cancer-specific limitations, and individual patient factors.",
          fullTextAccess: true,
          peerReviewed: true,
          citationCount: 435,
          qualityRating: 5
        });
        
        // Create demo exercise guidelines
        await this.createExerciseGuideline({
          cancerType: "Breast",
          treatmentPhase: "During Treatment",
          guidelineTitle: "Exercise During Breast Cancer Treatment",
          recommendedExerciseTypes: ["Walking", "Gentle yoga", "Resistance training", "Flexibility exercises"],
          exerciseIntensity: {
            aerobic: "Moderate: 40-60% of heart rate reserve or 12-13 on RPE scale",
            resistance: "Low to moderate: 40-60% of 1-repetition maximum, 10-15 repetitions"
          },
          frequencyPerWeek: {
            aerobic: "3-5 days per week",
            resistance: "2-3 non-consecutive days per week",
            flexibility: "Daily if possible"
          },
          durationMinutes: {
            aerobic: "15-30 minutes per session, can be divided into multiple shorter sessions",
            resistance: "15-30 minutes per session",
            flexibility: "5-10 minutes per session"
          },
          precautions: [
            "Avoid exercise during periods of severe fatigue",
            "Modify exercises around surgical areas",
            "Be cautious with resistance training on affected arm",
            "Monitor lymphedema symptoms"
          ],
          contraindications: [
            "Exercise during severe nausea",
            "High-impact activities if bone metastases present",
            "Heavy resistance training within 4-6 weeks of surgery"
          ],
          specialConsiderations: "For patients with lymphedema risk, start resistance exercises at very low weights and progress gradually. Wearing compression garments during exercise may be beneficial. Monitor heart rate during aerobic activity as some chemotherapy agents may affect cardiac function.",
          adaptations: {
            fatigue: "Shorter, more frequent sessions; decrease intensity",
            neuropathy: "Seated exercises, balance support, avoid treadmill",
            nausea: "Exercise when medication effects are optimal, lower intensity"
          },
          progressionTimeline: {
            week1_2: "Focus on movement and flexibility",
            week3_4: "Add light resistance training",
            week5_8: "Gradually increase duration of aerobic exercise",
            month3_6: "Progress to moderate intensity when tolerated"
          },
          evidenceLevel: "Level A - Strong evidence from randomized controlled trials",
          sourceId: source1.id
        });
        
        await this.createExerciseGuideline({
          cancerType: "Colorectal",
          treatmentPhase: "Recovery",
          guidelineTitle: "Colorectal Cancer Recovery Exercise Protocol",
          recommendedExerciseTypes: ["Walking", "Swimming", "Stationary cycling", "Core strengthening", "Pelvic floor exercises"],
          exerciseIntensity: {
            aerobic: "Moderate: 50-70% of heart rate reserve or 11-14 on RPE scale",
            resistance: "Moderate: 60-70% of 1-repetition maximum, 8-12 repetitions"
          },
          frequencyPerWeek: {
            aerobic: "3-5 days per week",
            resistance: "2-3 non-consecutive days per week",
            pelvicFloor: "Daily"
          },
          durationMinutes: {
            aerobic: "20-40 minutes per session",
            resistance: "20-30 minutes per session",
            pelvicFloor: "5-10 minutes per session"
          },
          precautions: [
            "Be cautious with abdominal exercises if ostomy present",
            "Monitor for signs of hernia",
            "Avoid heavy lifting early in recovery",
            "Stay well-hydrated during exercise"
          ],
          contraindications: [
            "High-impact exercises with recent ostomy",
            "Abdominal straining if surgical complications",
            "Excessive fatigue within 24hrs of exercise"
          ],
          specialConsiderations: "For patients with ostomy, consider using support bands during exercise. Exercises focusing on core strength should be gradually introduced and closely monitored. Pelvic floor exercises are particularly important following lower colorectal surgeries.",
          adaptations: {
            ostomy: "Use support band, modify positions to reduce abdominal pressure",
            peripheralNeuropathy: "Non-weight bearing exercises like recumbent cycling",
            fatigue: "Intermittent exercise, shorter duration with rest periods"
          },
          progressionTimeline: {
            week1_4: "Focus on walking and gentle movement",
            week5_8: "Begin low-intensity resistance training",
            week9_12: "Increase duration and add more resistance exercises",
            month3_6: "Progress to moderate intensity aerobic and resistance training"
          },
          evidenceLevel: "Level B - Moderate evidence from well-designed studies",
          sourceId: source1.id
        });
        
        // Create demo symptom management guidelines
        await this.createSymptomManagementGuideline({
          symptomName: "Cancer-related fatigue",
          cancerRelated: true,
          treatmentRelated: true,
          description: "Cancer-related fatigue is one of the most common and distressing symptoms experienced by cancer patients. It is characterized by feelings of tiredness, weakness, and lack of energy, and is typically not relieved by rest or sleep. It can be caused by the cancer itself, cancer treatments, medication side effects, anemia, pain, emotional distress, sleep disturbances, or nutritional deficiencies.",
          recommendedApproaches: [
            "Graduated exercise program",
            "Energy conservation strategies",
            "Cognitive behavioral therapy",
            "Sleep hygiene improvement",
            "Nutritional counseling"
          ],
          exerciseBenefits: "Regular exercise has been consistently shown to reduce cancer-related fatigue in multiple meta-analyses. It is considered one of the most effective non-pharmacological interventions for managing this symptom. Exercise helps improve circulation, cardiovascular fitness, muscle strength, and endurance, which can counteract the deconditioning that often occurs with cancer and its treatments.",
          recommendedExercises: [
            "Walking (outdoors or treadmill)",
            "Stationary cycling",
            "Swimming or water exercises",
            "Light resistance training",
            "Tai Chi",
            "Gentle yoga"
          ],
          avoidedExercises: [
            "High-intensity interval training during peak fatigue periods",
            "Exercises causing significant soreness",
            "Activities requiring sustained energy output without rest"
          ],
          intensityModifications: {
            peakFatiguePhase: "Very low intensity: 30-40% of max heart rate, RPE 8-10",
            moderateFatiguePhase: "Low intensity: 40-50% of max heart rate, RPE 10-12",
            lowFatiguePhase: "Moderate intensity: 50-60% of max heart rate, RPE 12-14"
          },
          evidenceQuality: "High - Based on multiple randomized controlled trials and meta-analyses",
          sourceId: source2.id
        });
        
        await this.createSymptomManagementGuideline({
          symptomName: "Lymphedema",
          cancerRelated: false,
          treatmentRelated: true,
          description: "Lymphedema is the buildup of fluid in soft body tissues when the lymph system is damaged or blocked. It commonly affects breast cancer patients who have undergone axillary lymph node dissection or radiation to the lymph node regions, but can also affect other cancer patients depending on treatment location. It typically causes swelling in the arms or legs.",
          recommendedApproaches: [
            "Compression garments",
            "Manual lymphatic drainage",
            "Proper skin care",
            "Progressive resistance exercise with supervision",
            "Regular monitoring of symptoms"
          ],
          exerciseBenefits: "Contrary to previous concerns, appropriate exercise has been shown to be safe and may help manage lymphedema by improving lymph flow, enhancing cardiovascular function, maintaining healthy body weight, and increasing muscle strength. Exercise stimulates the natural pumping action of muscles which can help move lymph fluid out of the affected limb.",
          recommendedExercises: [
            "Gentle range-of-motion exercises",
            "Progressive resistance training (starting with low weights)",
            "Swimming and water exercises",
            "Walking",
            "Cycling",
            "Specific lymphedema exercises like self-massage"
          ],
          avoidedExercises: [
            "Rapid increases in resistance or weight",
            "Exercises that cause pain in affected limb",
            "Activities with risk of injury to affected limb",
            "Excessive heat exposure (hot yoga, saunas)"
          ],
          intensityModifications: {
            resistanceTraining: "Start with no or very low weights (1-2 lbs), progress by 0.5-1 lb increments only when tolerated without symptom exacerbation",
            aerobic: "Moderate intensity: 50-70% of max heart rate, avoid activities causing significant overheating or excessive fatigue"
          },
          evidenceQuality: "Moderate to High - Based on several well-designed trials including the PAL trial (Physical Activity and Lymphedema)",
          sourceId: source2.id
        });
        
        // Create demo medical organization guidelines
        await this.createMedicalOrganizationGuideline({
          organizationName: "American College of Sports Medicine (ACSM)",
          guidelineName: "Exercise Guidelines for Cancer Survivors",
          publicationYear: 2019,
          lastUpdated: new Date("2019-11-01"),
          scope: "All cancer types with specific recommendations by cancer site",
          populationFocus: "Adult cancer survivors during and after treatment",
          exerciseRecommendations: {
            aerobic: "150 minutes of moderate-intensity or 75 minutes of vigorous-intensity exercise per week",
            resistance: "2-3 sessions per week involving major muscle groups, 8-15 repetitions per exercise",
            flexibility: "Stretching major muscle groups on days when other exercise is performed",
            balance: "For older survivors and those with peripheral neuropathy, include specific balance exercises",
            overall: "Avoid inactivity; some exercise is better than none; progress gradually"
          },
          safetyConsiderations: {
            surgery: "Gradually return based on surgical recovery; begin with low-intensity activities",
            chemotherapy: "Exercise timing may depend on cycles; monitor for anemia, neutropenia, and peripheral neuropathy",
            radiation: "Protect irradiated skin; swimming may be restricted if skin is irritated",
            hormonal: "Monitor for increased joint pain; focus on bone health if risk of osteoporosis",
            immunotherapy: "Monitor for unique side effects and adjust as needed"
          },
          implementationNotes: "Exercise prescription should be individualized based on patient's current fitness level, medical status, and personal preferences. A pre-exercise assessment is recommended. Supervision may be appropriate, particularly for those with complex medical histories or who are new to exercise. Regular reassessment allows for appropriate progression.",
          url: "https://www.acsm.org/acsm-membership/regional-chapters/acsm-chapters/greater-new-york/gny-blog/2019/11/18/guidelines-cancer-survivors"
        });
        
        console.log("Demo medical research and guidelines created successfully");
      }
    } catch (error) {
      console.error("Error in ensureDemoMedicalResearch:", error);
    }
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

  async getAllPrograms(): Promise<Program[]> {
    return await db
      .select()
      .from(programs);
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

  // Calendar Events
  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let query = db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(calendarEvents.date, calendarEvents.startTime);
    
    if (startDate) {
      query = query.where(gte(calendarEvents.date, startDate.toISOString().split('T')[0]));
    }
    
    if (endDate) {
      query = query.where(lte(calendarEvents.date, endDate.toISOString().split('T')[0]));
    }
    
    return await query;
  }
  
  async createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent> {
    const [newEvent] = await db
      .insert(calendarEvents)
      .values({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newEvent;
  }
  
  async updateCalendarEvent(id: number, userId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updatedEvent] = await db
      .update(calendarEvents)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.userId, userId)
        )
      )
      .returning();
    
    return updatedEvent;
  }
  
  async deleteCalendarEvent(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(calendarEvents)
      .where(
        and(
          eq(calendarEvents.id, id),
          eq(calendarEvents.userId, userId)
        )
      );
    
    return result.rowCount > 0;
  }
  
  // Body Measurements
  async getBodyMeasurements(userId: string, limit = 10): Promise<BodyMeasurement[]> {
    return await db
      .select()
      .from(bodyMeasurements)
      .where(eq(bodyMeasurements.userId, userId))
      .orderBy(desc(bodyMeasurements.date))
      .limit(limit);
  }
  
  async createBodyMeasurement(measurement: Omit<BodyMeasurement, "id" | "createdAt">): Promise<BodyMeasurement> {
    const [newMeasurement] = await db
      .insert(bodyMeasurements)
      .values({
        ...measurement,
        createdAt: new Date()
      })
      .returning();
    
    return newMeasurement;
  }
  
  // Progress Photos
  async getProgressPhotos(userId: string, photoType?: string): Promise<ProgressPhoto[]> {
    let query = db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.date));
    
    if (photoType) {
      query = query.where(eq(progressPhotos.photoType, photoType));
    }
    
    return await query;
  }
  
  async createProgressPhoto(photo: Omit<ProgressPhoto, "id" | "createdAt">): Promise<ProgressPhoto> {
    const [newPhoto] = await db
      .insert(progressPhotos)
      .values({
        ...photo,
        createdAt: new Date()
      })
      .returning();
    
    return newPhoto;
  }
  
  // Goals
  async getGoals(userId: string, completed = false): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.completed, completed)
        )
      )
      .orderBy(goals.createdAt);
  }
  
  async createGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({
        ...goal,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newGoal;
  }
  
  async updateGoal(id: number, userId: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(goals.id, id),
          eq(goals.userId, userId)
        )
      )
      .returning();
    
    return updatedGoal;
  }
  
  // Habits
  async getHabits(userId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(eq(habits.userId, userId))
      .orderBy(habits.createdAt);
  }
  
  async createHabit(habit: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values({
        ...habit,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newHabit;
  }
  
  async logHabit(habitLog: Omit<HabitLog, "id" | "createdAt">): Promise<HabitLog> {
    // First, get the habit to update its streak
    const [habit] = await db
      .select()
      .from(habits)
      .where(
        and(
          eq(habits.id, habitLog.habitId),
          eq(habits.userId, habitLog.userId)
        )
      );
    
    if (habit) {
      // Update the habit's streak and last completed date
      await db
        .update(habits)
        .set({
          streak: habit.streak ? habit.streak + 1 : 1,
          lastCompleted: new Date(),
          updatedAt: new Date()
        })
        .where(eq(habits.id, habitLog.habitId));
    }
    
    // Create the habit log entry
    const [newHabitLog] = await db
      .insert(habitLogs)
      .values({
        ...habitLog,
        createdAt: new Date()
      })
      .returning();
    
    return newHabitLog;
  }
  
  // Cardio Activities
  async getCardioActivities(userId: string, limit = 20): Promise<CardioActivity[]> {
    return await db
      .select()
      .from(cardioActivities)
      .where(eq(cardioActivities.userId, userId))
      .orderBy(desc(cardioActivities.date))
      .limit(limit);
  }
  
  async getCardioActivityById(id: number): Promise<CardioActivity | undefined> {
    const [activity] = await db
      .select()
      .from(cardioActivities)
      .where(eq(cardioActivities.id, id));
    
    return activity;
  }
  
  async getCardioActivitiesByDateRange(userId: string, startDate: string, endDate: string): Promise<CardioActivity[]> {
    return await db
      .select()
      .from(cardioActivities)
      .where(
        and(
          eq(cardioActivities.userId, userId),
          gte(cardioActivities.date, startDate),
          lte(cardioActivities.date, endDate)
        )
      )
      .orderBy(asc(cardioActivities.date));
  }
  
  async createCardioActivity(activity: Omit<CardioActivity, "id" | "createdAt">): Promise<CardioActivity> {
    const [newActivity] = await db
      .insert(cardioActivities)
      .values(activity)
      .returning();
    
    return newActivity;
  }
  
  async updateCardioActivity(id: number, userId: string, updates: Partial<CardioActivity>): Promise<CardioActivity | undefined> {
    const [updatedActivity] = await db
      .update(cardioActivities)
      .set(updates)
      .where(
        and(
          eq(cardioActivities.id, id),
          eq(cardioActivities.userId, userId)
        )
      )
      .returning();
    
    return updatedActivity;
  }
  
  async deleteCardioActivity(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(cardioActivities)
      .where(
        and(
          eq(cardioActivities.id, id),
          eq(cardioActivities.userId, userId)
        )
      );
    
    return result.rowCount > 0;
  }
  
  async getCardioStats(userId: string, period: 'week' | 'month' | 'year'): Promise<{
    totalActivities: number;
    totalDuration: number;
    totalDistance: number;
    activitiesByType: Record<string, number>;
    avgHeartRate: number | null;
    avgEnergy: number | null;
  }> {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    const activities = await db
      .select()
      .from(cardioActivities)
      .where(
        and(
          eq(cardioActivities.userId, userId),
          gte(cardioActivities.date, startDate.toISOString().split('T')[0])
        )
      );
    
    // Calculate stats
    const totalActivities = activities.length;
    const totalDuration = activities.reduce((sum, act) => sum + (act.duration || 0), 0);
    const totalDistance = activities.reduce((sum, act) => sum + (act.distance || 0), 0);
    
    // Count activities by type
    const activitiesByType: Record<string, number> = {};
    activities.forEach(act => {
      if (act.activityType) {
        activitiesByType[act.activityType] = (activitiesByType[act.activityType] || 0) + 1;
      }
    });
    
    // Calculate average heart rate, excluding null/undefined values
    const heartRates = activities.filter(a => a.avgHeartRate != null).map(a => a.avgHeartRate);
    const avgHeartRate = heartRates.length > 0
      ? heartRates.reduce((sum, rate) => sum + (rate || 0), 0) / heartRates.length
      : null;
    
    // Calculate average energy level, excluding null/undefined values
    const energyLevels = activities.filter(a => a.energyLevel != null).map(a => a.energyLevel);
    const avgEnergy = energyLevels.length > 0
      ? energyLevels.reduce((sum, level) => sum + (level || 0), 0) / energyLevels.length
      : null;
    
    return {
      totalActivities,
      totalDuration,
      totalDistance,
      activitiesByType,
      avgHeartRate,
      avgEnergy
    };
  }
  
  // Medical Research Sources methods
  async getMedicalResearchSources(limit?: number): Promise<MedicalResearchSource[]> {
    const query = db.select().from(medicalResearchSources);
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query.orderBy(desc(medicalResearchSources.publicationDate));
  }
  
  async getMedicalResearchSourceById(id: number): Promise<MedicalResearchSource | undefined> {
    const [source] = await db
      .select()
      .from(medicalResearchSources)
      .where(eq(medicalResearchSources.id, id));
    
    return source;
  }
  
  async createMedicalResearchSource(source: Omit<MedicalResearchSource, "id" | "createdAt" | "updatedAt">): Promise<MedicalResearchSource> {
    const [newSource] = await db
      .insert(medicalResearchSources)
      .values({
        ...source,
      })
      .returning();
    
    return newSource;
  }
  
  async updateMedicalResearchSource(id: number, updates: Partial<MedicalResearchSource>): Promise<MedicalResearchSource | undefined> {
    // Remove id, createdAt, and updatedAt from updates
    const { id: _, createdAt, updatedAt, ...safeUpdates } = updates;
    
    const [updatedSource] = await db
      .update(medicalResearchSources)
      .set({
        ...safeUpdates,
        updatedAt: new Date()
      })
      .where(eq(medicalResearchSources.id, id))
      .returning();
    
    return updatedSource;
  }
  
  // Exercise Guidelines methods
  async getExerciseGuidelines(cancerType?: string, treatmentPhase?: string): Promise<ExerciseGuideline[]> {
    let query = db.select().from(exerciseGuidelines);
    
    if (cancerType && treatmentPhase) {
      query = query.where(
        and(
          eq(exerciseGuidelines.cancerType, cancerType),
          eq(exerciseGuidelines.treatmentPhase, treatmentPhase)
        )
      );
    } else if (cancerType) {
      query = query.where(eq(exerciseGuidelines.cancerType, cancerType));
    } else if (treatmentPhase) {
      query = query.where(eq(exerciseGuidelines.treatmentPhase, treatmentPhase));
    }
    
    return await query.orderBy(asc(exerciseGuidelines.cancerType), asc(exerciseGuidelines.treatmentPhase));
  }
  
  async getExerciseGuidelineById(id: number): Promise<ExerciseGuideline | undefined> {
    const [guideline] = await db
      .select()
      .from(exerciseGuidelines)
      .where(eq(exerciseGuidelines.id, id));
    
    return guideline;
  }
  
  async createExerciseGuideline(guideline: Omit<ExerciseGuideline, "id" | "createdAt" | "updatedAt">): Promise<ExerciseGuideline> {
    const [newGuideline] = await db
      .insert(exerciseGuidelines)
      .values({
        ...guideline
      })
      .returning();
    
    return newGuideline;
  }
  
  async updateExerciseGuideline(id: number, updates: Partial<ExerciseGuideline>): Promise<ExerciseGuideline | undefined> {
    // Remove id, createdAt, and updatedAt from updates
    const { id: _, createdAt, updatedAt, ...safeUpdates } = updates;
    
    const [updatedGuideline] = await db
      .update(exerciseGuidelines)
      .set({
        ...safeUpdates,
        updatedAt: new Date()
      })
      .where(eq(exerciseGuidelines.id, id))
      .returning();
    
    return updatedGuideline;
  }
  
  // Symptom Management Guidelines methods
  async getSymptomManagementGuidelines(symptomName?: string): Promise<SymptomManagementGuideline[]> {
    let query = db.select().from(symptomManagementGuidelines);
    
    if (symptomName) {
      query = query.where(eq(symptomManagementGuidelines.symptomName, symptomName));
    }
    
    return await query.orderBy(asc(symptomManagementGuidelines.symptomName));
  }
  
  async getSymptomManagementGuidelineById(id: number): Promise<SymptomManagementGuideline | undefined> {
    const [guideline] = await db
      .select()
      .from(symptomManagementGuidelines)
      .where(eq(symptomManagementGuidelines.id, id));
    
    return guideline;
  }
  
  async createSymptomManagementGuideline(guideline: Omit<SymptomManagementGuideline, "id" | "createdAt" | "updatedAt">): Promise<SymptomManagementGuideline> {
    const [newGuideline] = await db
      .insert(symptomManagementGuidelines)
      .values({
        ...guideline
      })
      .returning();
    
    return newGuideline;
  }
  
  async updateSymptomManagementGuideline(id: number, updates: Partial<SymptomManagementGuideline>): Promise<SymptomManagementGuideline | undefined> {
    // Remove id, createdAt, and updatedAt from updates
    const { id: _, createdAt, updatedAt, ...safeUpdates } = updates;
    
    const [updatedGuideline] = await db
      .update(symptomManagementGuidelines)
      .set({
        ...safeUpdates,
        updatedAt: new Date()
      })
      .where(eq(symptomManagementGuidelines.id, id))
      .returning();
    
    return updatedGuideline;
  }
  
  // Medical Organization Guidelines methods
  async getMedicalOrganizationGuidelines(organizationName?: string): Promise<MedicalOrganizationGuideline[]> {
    let query = db.select().from(medicalOrganizationGuidelines);
    
    if (organizationName) {
      query = query.where(eq(medicalOrganizationGuidelines.organizationName, organizationName));
    }
    
    return await query.orderBy(
      asc(medicalOrganizationGuidelines.organizationName),
      desc(medicalOrganizationGuidelines.publicationYear)
    );
  }
  
  async getMedicalOrganizationGuidelineById(id: number): Promise<MedicalOrganizationGuideline | undefined> {
    const [guideline] = await db
      .select()
      .from(medicalOrganizationGuidelines)
      .where(eq(medicalOrganizationGuidelines.id, id));
    
    return guideline;
  }
  
  async createMedicalOrganizationGuideline(guideline: Omit<MedicalOrganizationGuideline, "id" | "createdAt" | "updatedAt">): Promise<MedicalOrganizationGuideline> {
    const [newGuideline] = await db
      .insert(medicalOrganizationGuidelines)
      .values({
        ...guideline
      })
      .returning();
    
    return newGuideline;
  }
  
  async updateMedicalOrganizationGuideline(id: number, updates: Partial<MedicalOrganizationGuideline>): Promise<MedicalOrganizationGuideline | undefined> {
    // Remove id, createdAt, and updatedAt from updates
    const { id: _, createdAt, updatedAt, ...safeUpdates } = updates;
    
    const [updatedGuideline] = await db
      .update(medicalOrganizationGuidelines)
      .set({
        ...safeUpdates,
        updatedAt: new Date()
      })
      .where(eq(medicalOrganizationGuidelines.id, id))
      .returning();
    
    return updatedGuideline;
  }
  
  // Research-based query methods
  async getExerciseRecommendationsByMedicalGuidelines(
    patientProfile: PatientProfile, 
    assessment: PhysicalAssessment
  ): Promise<Exercise[]> {
    // Get guidelines based on cancer type and treatment phase
    const guidelines = await this.getExerciseGuidelines(
      patientProfile.cancerType || undefined,
      patientProfile.treatmentStage || undefined
    );
    
    if (guidelines.length === 0) {
      // If no specific guidelines, return general exercises based on energy level
      return await this.getExercisesByEnergyLevel(assessment.energyLevel || 3);
    }
    
    // Extract recommended exercise types from guidelines
    const recommendedTypes: string[] = [];
    guidelines.forEach(guideline => {
      if (guideline.recommendedExerciseTypes) {
        const types = guideline.recommendedExerciseTypes as string[];
        recommendedTypes.push(...types);
      }
    });
    
    // Get all exercises
    const allExercises = await this.getAllExercises();
    
    // Filter exercises based on guidelines
    const recommendedExercises = allExercises.filter(exercise => {
      // Match energy level
      const energyMatch = exercise.energyLevel <= (assessment.energyLevel || 3);
      
      // Match movement type to recommended types
      const movementTypeMatch = exercise.movementType && recommendedTypes.includes(exercise.movementType);
      
      // Check if exercise is appropriate for the cancer type
      const cancerTypeMatch = exercise.cancerAppropriate && 
        Array.isArray(exercise.cancerAppropriate) && 
        exercise.cancerAppropriate.includes(patientProfile.cancerType || '');
      
      // Check if exercise is appropriate for the treatment phase
      const treatmentPhaseMatch = exercise.treatmentPhases && 
        Array.isArray(exercise.treatmentPhases) && 
        exercise.treatmentPhases.includes(patientProfile.treatmentStage || '');
      
      return energyMatch && (movementTypeMatch || cancerTypeMatch || treatmentPhaseMatch);
    });
    
    return recommendedExercises;
  }
  
  async getExerciseSafetyGuidelines(
    cancerType: string, 
    treatmentPhase: string, 
    comorbidities?: string[]
  ): Promise<{
    safe: string[];
    caution: string[];
    avoid: string[];
  }> {
    // Default guidelines
    const defaultGuidelines = {
      safe: ["walking", "gentle stretching", "seated exercises", "resistance bands", "light weights"],
      caution: ["jogging", "cycling", "swimming", "moderate weights", "yoga", "pilates"],
      avoid: ["high-impact exercises", "very heavy weights", "competitive sports", "extreme sports"]
    };
    
    // Get exercise guidelines for this cancer type and treatment phase
    const guidelines = await this.getExerciseGuidelines(cancerType, treatmentPhase);
    
    if (guidelines.length === 0) {
      // If no specific guidelines found, return default guidelines
      return defaultGuidelines;
    }
    
    // Combine guidelines
    const combinedGuidelines = {
      safe: [...defaultGuidelines.safe],
      caution: [...defaultGuidelines.caution],
      avoid: [...defaultGuidelines.avoid]
    };
    
    // Add specific guidelines from database
    guidelines.forEach(guideline => {
      // Extract precautions
      if (guideline.precautions) {
        const precautions = guideline.precautions as string[];
        combinedGuidelines.caution.push(...precautions);
      }
      
      // Extract contraindications
      if (guideline.contraindications) {
        const contraindications = guideline.contraindications as string[];
        combinedGuidelines.avoid.push(...contraindications);
      }
      
      // Extract recommended exercise types
      if (guideline.recommendedExerciseTypes) {
        const recommendedTypes = guideline.recommendedExerciseTypes as string[];
        combinedGuidelines.safe.push(...recommendedTypes);
      }
    });
    
    // If comorbidities are provided, adjust guidelines
    if (comorbidities && comorbidities.length > 0) {
      // Get symptom management guidelines for each comorbidity
      for (const comorbidity of comorbidities) {
        const symptomGuidelines = await this.getSymptomManagementGuidelines(comorbidity);
        
        symptomGuidelines.forEach(symptomGuideline => {
          // Add recommended exercises to safe list
          if (symptomGuideline.recommendedExercises) {
            const recommended = symptomGuideline.recommendedExercises as string[];
            combinedGuidelines.safe.push(...recommended);
          }
          
          // Add avoided exercises to avoid list
          if (symptomGuideline.avoidedExercises) {
            const avoided = symptomGuideline.avoidedExercises as string[];
            combinedGuidelines.avoid.push(...avoided);
          }
        });
      }
    }
    
    // Remove duplicates and ensure no exercise appears in multiple categories
    // Priority: avoid > caution > safe
    const finalGuidelines = {
      safe: [] as string[],
      caution: [] as string[],
      avoid: Array.from(new Set(combinedGuidelines.avoid))
    };
    
    // Filter caution list to remove anything in avoid list
    finalGuidelines.caution = Array.from(
      new Set(combinedGuidelines.caution.filter(ex => !finalGuidelines.avoid.includes(ex)))
    );
    
    // Filter safe list to remove anything in avoid or caution lists
    finalGuidelines.safe = Array.from(
      new Set(combinedGuidelines.safe.filter(
        ex => !finalGuidelines.avoid.includes(ex) && !finalGuidelines.caution.includes(ex)
      ))
    );
    
    return finalGuidelines;
  }
  
  // Other necessary methods required by IStorage interface
  // Daily Check-ins Implementation
  
  async getDailyCheckIns(userId: string, limit: number = 7): Promise<DailyCheckIn[]> {
    return await db
      .select()
      .from(dailyCheckIns)
      .where(eq(dailyCheckIns.userId, userId))
      .orderBy(desc(dailyCheckIns.date))
      .limit(limit);
  }
  
  async getDailyCheckInsByDateRange(userId: string, startDate: string, endDate: string): Promise<DailyCheckIn[]> {
    return await db
      .select()
      .from(dailyCheckIns)
      .where(and(
        eq(dailyCheckIns.userId, userId),
        gte(dailyCheckIns.date, startDate),
        lte(dailyCheckIns.date, endDate)
      ))
      .orderBy(asc(dailyCheckIns.date));
  }
  
  async getDailyCheckInById(id: number): Promise<DailyCheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(dailyCheckIns)
      .where(eq(dailyCheckIns.id, id));
    
    return checkIn;
  }
  
  async getTodayCheckIn(userId: string): Promise<DailyCheckIn | undefined> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const [checkIn] = await db
      .select()
      .from(dailyCheckIns)
      .where(and(
        eq(dailyCheckIns.userId, userId),
        eq(dailyCheckIns.date, today)
      ))
      .orderBy(desc(dailyCheckIns.createdAt))
      .limit(1);
    
    return checkIn;
  }
  
  async createDailyCheckIn(checkInData: Omit<DailyCheckIn, "id" | "createdAt">): Promise<DailyCheckIn> {
    // Ensure all required fields are present with default values as needed
    const checkIn = {
      userId: checkInData.userId,
      date: checkInData.date,
      timeOfDay: checkInData.timeOfDay,
      energyLevel: checkInData.energyLevel,
      moodLevel: checkInData.moodLevel,
      sleepQuality: checkInData.sleepQuality,
      painLevel: checkInData.painLevel,
      movementConfidence: checkInData.movementConfidence,
      symptoms: checkInData.symptoms || [],
      notes: checkInData.notes || null
    };
    
    const [newCheckIn] = await db
      .insert(dailyCheckIns)
      .values(checkIn)
      .returning();
    
    return newCheckIn;
  }
  
  async updateDailyCheckIn(id: number, userId: string, updates: Partial<DailyCheckIn>): Promise<DailyCheckIn | undefined> {
    const [updatedCheckIn] = await db
      .update(dailyCheckIns)
      .set(updates)
      .where(and(
        eq(dailyCheckIns.id, id),
        eq(dailyCheckIns.userId, userId)
      ))
      .returning();
    
    return updatedCheckIn;
  }
  
  async generateRecommendationsFromCheckIn(userId: string, checkInId: number): Promise<{
    exercises: ExerciseRecommendation[];
    programs: ProgramRecommendation[];
    tier: number;
    riskFlags: string[];
    status: 'pending_review' | 'approved' | 'modified';
    assessmentId: number;
  }> {
    try {
      // Get the check-in data
      const checkIn = await this.getDailyCheckInById(checkInId);
      if (!checkIn) {
        throw new Error('Check-in not found');
      }
      
      // Get patient profile
      const patientProfile = await this.getPatientProfile(userId);
      if (!patientProfile) {
        throw new Error('Patient profile not found');
      }
      
      // Create a complete physical assessment based on check-in data
      // Include all required fields to satisfy the type system
      const assessment = await this.createPhysicalAssessment({
        userId,
        energyLevel: checkIn.energyLevel,
        painLevel: checkIn.painLevel,
        mobilityStatus: 2, // Default to moderate mobility
        // Convert 1-10 scale to 0-4 scale for assessment
        confidenceLevel: Math.floor(checkIn.movementConfidence / 2.5),
        sleepQuality: Math.floor(checkIn.sleepQuality / 2.5),
        // If symptoms exist, add them as restrictions
        physicalRestrictions: checkIn.symptoms || [],
        restrictionNotes: checkIn.notes || "",
        // Required fields from physical assessment
        priorInjuries: [],
        priorFitnessLevel: 2, // Moderate prior fitness
        exercisePreferences: [],
        strengthLevel: 2, // Moderate strength
        enduranceLevel: 2, // Moderate endurance
        flexibilityLevel: 2, // Moderate flexibility
        balanceLevel: 2, // Moderate balance
        location: "home",
        availableEquipment: [],
        timeAvailable: 30, // 30 minutes default
        fitnessGoals: [],
        movementScreenResults: {},
        medicalClearance: true,
        // Treatment related information from patient profile
        cancerType: patientProfile.cancerType || "unspecified",
        treatmentStage: patientProfile.treatmentPhase || "unspecified",
        treatmentNotes: patientProfile.treatmentNotes || "",
        // Demographics
        age: patientProfile.age || 50,
        gender: patientProfile.gender || "unspecified"
      });
      
      // Use the recommendation engine to generate recommendations
      const exerciseRecommendations = await import('./recommendation-engine')
        .then(engine => engine.generateExerciseRecommendations(userId, assessment.id, undefined, 5));
      
      const programRecommendations = await import('./recommendation-engine')
        .then(engine => engine.generateProgramRecommendations(userId, assessment.id, undefined, 3));
        
      // Format the recommendations
      const formattedExerciseRecs = await this.getExerciseRecommendations(userId, assessment.id);
      const formattedProgramRecs = await this.getProgramRecommendations(userId, assessment.id);
      
      // Calculate exercise tier based on multiple factors
      // Tier 1: Very gentle - seated exercises, minimal movement
      // Tier 2: Gentle - standing exercises with support, light resistance
      // Tier 3: Moderate - walking, moderate resistance, some balance work
      // Tier 4: Advanced - jogging, higher resistance, complex movements
      
      // Calculate tier based on scores
      const mobilityScore = assessment.mobilityStatus || 2;
      const balanceScore = assessment.balanceLevel || 2; 
      const strengthScore = assessment.strengthLevel || 2;
      const fatigueRiskScore = 5 - (checkIn.energyLevel / 2); // Convert 0-10 to 5-0 scale
      const confidenceScore = checkIn.movementConfidence / 2; // Convert 0-10 to 0-5 scale
      
      // Weighted average of scores
      const compositeScore = (
        (mobilityScore * 1.5) + 
        (balanceScore * 1.2) + 
        (strengthScore * 1.0) + 
        (confidenceScore * 1.5) - 
        (fatigueRiskScore * 2.0)
      ) / 7.2; // Sum of weights
      
      // Map composite score to tier (1-4)
      let tier = 1; // Default to safest tier
      if (compositeScore > 3.5) {
        tier = 4;
      } else if (compositeScore > 2.5) {
        tier = 3;
      } else if (compositeScore > 1.5) {
        tier = 2;
      }
      
      // Identify risk flags based on symptoms and check-in data
      const riskFlags: string[] = [];
      
      // Check symptoms
      if (checkIn.symptoms && Array.isArray(checkIn.symptoms)) {
        const symptoms = checkIn.symptoms as string[];
        if (symptoms.includes('dizziness')) {
          riskFlags.push('Dizziness reported - avoid balance challenges');
          // Force tier downgrade for safety
          if (tier > 1) tier -= 1;
        }
        if (symptoms.includes('severe_fatigue')) {
          riskFlags.push('Severe fatigue - limit session duration');
          // Force tier downgrade for safety
          if (tier > 1) tier -= 1;
        }
        if (symptoms.includes('neuropathy')) {
          riskFlags.push('Neuropathy present - monitor foot placement carefully');
        }
        if (symptoms.includes('lymphedema')) {
          riskFlags.push('Lymphedema reported - limit resistance on affected limb');
        }
      }
      
      // Check scores
      if (checkIn.painLevel >= 7) {
        riskFlags.push('High pain levels reported - gentle movement only');
        // Force tier to lowest for safety
        tier = 1;
      }
      if (checkIn.movementConfidence <= 3) {
        riskFlags.push('Very low movement confidence - provide extra guidance');
        // Cap tier at 2 for safety
        if (tier > 2) tier = 2;
      }
      
      // All recommendations start as pending for coach review
      return {
        exercises: formattedExerciseRecs,
        programs: formattedProgramRecs,
        tier: tier,
        riskFlags: riskFlags,
        status: 'pending_review',
        assessmentId: assessment.id
      };
    } catch (error) {
      console.error('Error generating recommendations from check-in:', error);
      return { 
        exercises: [], 
        programs: [], 
        tier: 1, 
        riskFlags: ['Error generating personalized recommendations'], 
        status: 'pending_review',
        assessmentId: 0
      };
    }
  }
  
  async updateRecommendationStatus(
    assessmentId: number, 
    status: 'approved' | 'modified', 
    coachNotes?: string,
    modifiedTier?: number,
    selectedExerciseIds?: number[],
    selectedProgramIds?: number[]
  ): Promise<boolean> {
    try {
      // Update exercise recommendations
      if (selectedExerciseIds) {
        // First, set all to inactive
        await db
          .update(exerciseRecommendations)
          .set({ 
            isActive: false,
            specialistNotes: coachNotes || null
          })
          .where(eq(exerciseRecommendations.assessmentId, assessmentId));
        
        // Then activate only the selected ones
        if (selectedExerciseIds.length > 0) {
          await db
            .update(exerciseRecommendations)
            .set({ 
              isActive: true,
              status: status
            })
            .where(and(
              eq(exerciseRecommendations.assessmentId, assessmentId),
              inArray(exerciseRecommendations.exerciseId, selectedExerciseIds)
            ));
        }
      }
      
      // Update program recommendations
      if (selectedProgramIds) {
        // First, set all to inactive
        await db
          .update(programRecommendations)
          .set({ 
            isActive: false,
            specialistNotes: coachNotes || null
          })
          .where(eq(programRecommendations.assessmentId, assessmentId));
        
        // Then activate only the selected ones
        if (selectedProgramIds.length > 0) {
          await db
            .update(programRecommendations)
            .set({ 
              isActive: true,
              status: status
            })
            .where(and(
              eq(programRecommendations.assessmentId, assessmentId),
              inArray(programRecommendations.programId, selectedProgramIds)
            ));
        }
      }
      
      // Update assessment with modified tier if provided
      if (modifiedTier) {
        await db
          .update(physicalAssessments)
          .set({ 
            strengthLevel: modifiedTier, // Use strengthLevel to store the tier
            assessmentNotes: coachNotes || null
          })
          .where(eq(physicalAssessments.id, assessmentId));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      return false;
    }
  }
  
  async getPendingRecommendations(specialistId?: string, statusFilter: string = 'pending_review'): Promise<{
    id: string;
    patientId: string;
    patientName: string;
    date: string;
    status: string;
    hasRiskFlags: boolean;
    tier: number;
    riskFlags: string[];
  }[]> {
    try {
      // Find recommendations that need reviewew
      const pendingAssessments = await db
        .select({
          userId: physicalAssessments.userId,
          assessmentId: physicalAssessments.id,
          assessmentDate: physicalAssessments.assessmentDate,
          strengthLevel: physicalAssessments.strengthLevel, // Using as tier
          restrictionNotes: physicalAssessments.restrictionNotes, // Using to store risk flags
        })
        .from(physicalAssessments)
        .innerJoin(
          exerciseRecommendations,
          eq(physicalAssessments.id, exerciseRecommendations.assessmentId)
        )
        .where(
          eq(exerciseRecommendations.status, 'pending_review')
        )
        .groupBy(physicalAssessments.id)
        .orderBy(desc(physicalAssessments.assessmentDate));
      
      // Get user details
      const usersWithPending = [];
      for (const assessment of pendingAssessments) {
        const user = await this.getUser(assessment.userId);
        if (user) {
          const hasRiskFlags = !!assessment.restrictionNotes && assessment.restrictionNotes.trim().length > 0;
          const riskFlags = assessment.restrictionNotes ? 
            assessment.restrictionNotes.split(',').map(flag => flag.trim()) : [];
          
          usersWithPending.push({
            id: assessment.assessmentId.toString(),
            patientId: user.id,
            patientName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
            date: assessment.assessmentDate ? new Date(assessment.assessmentDate).toISOString().split('T')[0] : 'Unknown',
            status: statusFilter,
            hasRiskFlags: hasRiskFlags,
            tier: assessment.strengthLevel || 1,
            riskFlags: riskFlags
          });
        }
      }
      
      return usersWithPending;
    } catch (error) {
      console.error('Error fetching pending recommendations:', error);
      return [];
    }
  }

  async getAssessmentDetails(assessmentId: string | number): Promise<any> {
    try {
      const id = typeof assessmentId === 'string' ? parseInt(assessmentId) : assessmentId;
      
      // Get the assessment data
      const assessment = await this.getPhysicalAssessment(id);
      if (!assessment) {
        throw new Error(`Assessment with ID ${assessmentId} not found`);
      }
      
      // Get the patient profile
      const patientProfile = await this.getPatientProfile(assessment.userId);
      
      // Get the patient user data
      const patient = await this.getUser(assessment.userId);
      
      return {
        assessment,
        profile: patientProfile,
        patient
      };
    } catch (error) {
      console.error(`Error fetching assessment details for ID ${assessmentId}:`, error);
      throw error;
    }
  }
  
  async getExerciseRecommendationsForReview(assessmentId: string | number): Promise<ExerciseRecommendation[]> {
    try {
      const id = typeof assessmentId === 'string' ? parseInt(assessmentId) : assessmentId;
      
      // Get all exercise recommendations for this assessment
      const recommendations = await db
        .select({
          recommendation: exerciseRecommendations,
          exercise: exercises
        })
        .from(exerciseRecommendations)
        .innerJoin(exercises, eq(exerciseRecommendations.exerciseId, exercises.id))
        .where(eq(exerciseRecommendations.assessmentId, id))
        .orderBy(desc(exerciseRecommendations.recommendationScore));
      
      // Format the recommendations with exercise data included
      return recommendations.map(result => ({
        ...result.recommendation,
        exercise: result.exercise
      }));
    } catch (error) {
      console.error(`Error fetching exercise recommendations for review for assessment ID ${assessmentId}:`, error);
      return [];
    }
  }
  
  async getProgramRecommendationsForReview(assessmentId: string | number): Promise<ProgramRecommendation[]> {
    try {
      const id = typeof assessmentId === 'string' ? parseInt(assessmentId) : assessmentId;
      
      // Get all program recommendations for this assessment
      const recommendations = await db
        .select({
          recommendation: programRecommendations,
          program: programs
        })
        .from(programRecommendations)
        .innerJoin(programs, eq(programRecommendations.programId, programs.id))
        .where(eq(programRecommendations.assessmentId, id))
        .orderBy(desc(programRecommendations.recommendationScore));
      
      // Format the recommendations with program data included
      return recommendations.map(result => ({
        ...result.recommendation,
        program: result.program
      }));
    } catch (error) {
      console.error(`Error fetching program recommendations for review for assessment ID ${assessmentId}:`, error);
      return [];
    }
  }
  
  async updateRecommendationStatus(
    assessmentId: string | number,
    specialistId: string,
    status: string,
    notes?: string
  ): Promise<any> {
    try {
      const id = typeof assessmentId === 'string' ? parseInt(assessmentId) : assessmentId;
      
      // Update all exercise recommendations for this assessment
      await db
        .update(exerciseRecommendations)
        .set({
          status,
          specialistId,
          specialistNotes: notes || null,
          reviewDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(exerciseRecommendations.assessmentId, id));
      
      // Update all program recommendations for this assessment
      await db
        .update(programRecommendations)
        .set({
          status,
          specialistId,
          specialistNotes: notes || null,
          reviewDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(programRecommendations.assessmentId, id));
      
      return { success: true, message: `All recommendations for assessment ${assessmentId} updated to ${status}` };
    } catch (error) {
      console.error(`Error updating recommendation status for assessment ID ${assessmentId}:`, error);
      throw error;
    }
  }
}

// The `or` function is already imported at the top of the file

export const storage = new DatabaseStorage();
