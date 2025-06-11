import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  date,
  time,
  json
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("patient"), // Either "specialist" or "patient"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  patients: many(patientSpecialists, { relationName: "specialist" }),
  specialists: many(patientSpecialists, { relationName: "patient" }),
  patientProfiles: many(patientProfiles),
}));

export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  // Basic medical info
  cancerType: varchar("cancer_type"),
  treatmentStage: varchar("treatment_stage"), // "Pre-Treatment", "During Treatment", "Post-Treatment", "Recovery"
  treatmentNotes: text("treatment_notes"),
  age: integer("age"),
  gender: varchar("gender"),
  
  // Medical background (expanded)
  treatmentsReceived: jsonb("treatments_received"), // ["chemotherapy", "surgery", "radiation", etc]
  lymphoedemaRisk: boolean("lymphoedema_risk"),
  comorbidities: jsonb("comorbidities"), // ["hypertension", "diabetes", etc]
  medicationEffects: jsonb("medication_effects"), // ["joint pain", "fatigue", etc]
  
  // Added timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patientProfilesRelations = relations(patientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
}));

// Physical assessment data
export const physicalAssessments = pgTable("physical_assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Physical function metrics
  energyLevel: integer("energy_level"), // 1-10 scale
  mobilityStatus: integer("mobility_status"), // 0=low, 1=limited, 2=moderate, 3=good, 4=excellent
  painLevel: integer("pain_level"), // 1-10 scale
  physicalRestrictions: jsonb("physical_restrictions"), // ["no overhead movement", "limited balance", etc.]
  restrictionNotes: text("restriction_notes"), // Detailed notes about physical restrictions
  priorInjuries: jsonb("prior_injuries"), // ["frozen shoulder", "knee pain", etc.]
  confidenceLevel: integer("confidence_level"), // 0=very low, 1=low, 2=moderate, 3=high, 4=very high
  
  // Fitness history
  priorFitnessLevel: integer("prior_fitness_level"), // 0=sedentary, 1=light, 2=moderate, 3=active, 4=very active
  exercisePreferences: jsonb("exercise_preferences"), // ["gentle strength", "yoga", "walking", etc]
  exerciseDislikes: jsonb("exercise_dislikes"), // ["jogging", "high impact", etc]
  weeklyExerciseGoal: varchar("weekly_exercise_goal"), // "3 sessions", "daily", etc.
  equipmentAvailable: jsonb("equipment_available"), // ["chair", "resistance band", etc]
  timePerSession: integer("time_per_session"), // in minutes
  
  // Psychosocial factors
  motivationLevel: integer("motivation_level"), // 0=very low, 1=low, 2=moderate, 3=high, 4=very high
  movementConfidence: integer("movement_confidence"), // 0=very low, 1=low, 2=moderate, 3=high, 4=very high 
  fearOfInjury: boolean("fear_of_injury"),
  stressLevel: integer("stress_level"), // 1-10 scale
  sleepQuality: integer("sleep_quality"), // 0=poor, 1=fair, 2=moderate, 3=good, 4=excellent
  
  // Environmental factors
  location: varchar("location"), // home, gym, outdoors
  exerciseEnvironment: integer("exercise_environment"), // 0=home, 1=gym, 2=outdoors, 3=pool
  caregiverSupport: integer("caregiver_support"), // 0=none, 1=little, 2=some, 3=good, 4=excellent
  sessionFormatPreference: jsonb("session_format_preference"), // ["video", "written", "audio"]
  accessibilityNeeds: jsonb("accessibility_needs"), // ["closed captions", "large text", etc]
  
  assessmentDate: timestamp("assessment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const physicalAssessmentsRelations = relations(physicalAssessments, ({ one }) => ({
  user: one(users, {
    fields: [physicalAssessments.userId],
    references: [users.id],
  }),
}));

// Relation between patients and specialists
export const patientSpecialists = pgTable("patient_specialists", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  specialistId: varchar("specialist_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patientSpecialistsRelations = relations(patientSpecialists, ({ one }) => ({
  patient: one(users, {
    fields: [patientSpecialists.patientId],
    references: [users.id],
    relationName: "patient",
  }),
  specialist: one(users, {
    fields: [patientSpecialists.specialistId],
    references: [users.id],
    relationName: "specialist",
  }),
}));

// Exercise Library
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  energyLevel: integer("energy_level").notNull(), // 1-5 energy level
  cancerAppropriate: jsonb("cancer_appropriate"), // Array of cancer types this is appropriate for
  treatmentPhases: jsonb("treatment_phases"), // Array of treatment phases (pre, during, post, recovery)
  bodyFocus: jsonb("body_focus"), // Array of body areas this exercise focuses on
  benefits: jsonb("benefits"), // Array of benefits (e.g., "Improves balance", "Increases strength")
  movementType: varchar("movement_type"), // "Cardio", "Strength", "Flexibility", "Balance", "Mobility"
  equipment: jsonb("equipment"), // Array of equipment needed
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"), // Optional image showing the exercise
  duration: integer("duration"), // Recommended duration in minutes
  instructionSteps: jsonb("instruction_steps"), // Array of instruction steps
  modifications: jsonb("modifications"), // JSON object with modifications for different needs
  precautions: text("precautions"), // Medical precautions or warnings
  citations: jsonb("citations"), // Research citations supporting exercise for cancer patients
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workout Programs
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in weeks
  programType: varchar("program_type").default("custom"), // custom, template, recommended
  cancerTypes: jsonb("cancer_types").default("[]"), // array of cancer types this program is suitable for
  treatmentPhases: jsonb("treatment_phases").default("[]"), // array of treatment phases this is suitable for
  energyLevelMin: integer("energy_level_min"), // minimum energy level required (1-5)
  energyLevelMax: integer("energy_level_max"), // maximum energy level suitable for (1-5)
  goalFocus: varchar("goal_focus"), // primary goal: strength, mobility, endurance, etc.
  difficulty: integer("difficulty"), // 1-5 scale
  tags: jsonb("tags").default("[]"), // for easy searching/filtering
  thumbnailUrl: varchar("thumbnail_url"), // visual representation of program
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Program Assignments to Patients
export const programAssignments = pgTable("program_assignments", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  specialistId: varchar("specialist_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  energyLevel: integer("energy_level").notNull(), // 1-5 energy level
  status: varchar("status").notNull().default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programAssignmentsRelations = relations(programAssignments, ({ one }) => ({
  program: one(programs, {
    fields: [programAssignments.programId],
    references: [programs.id],
  }),
  patient: one(users, {
    fields: [programAssignments.patientId],
    references: [users.id],
  }),
  specialist: one(users, {
    fields: [programAssignments.specialistId],
    references: [users.id],
  }),
}));

// Program Workouts (exercises within a program)
export const programWorkouts = pgTable("program_workouts", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull().references(() => programs.id),
  day: integer("day").notNull(), // day of the program (1-based)
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  workoutType: varchar("workout_type").default("strength"), // strength, cardio, flexibility, balance, etc.
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"), // in seconds
  restTime: integer("rest_time"), // in seconds
  intensity: integer("intensity"), // 1-5 scale
  rateOfPerceivedExertion: integer("rate_of_perceived_exertion"), // 1-10 scale (RPE)
  adaptationOptions: jsonb("adaptation_options").default("[]"), // possible modifications
  alternativeExerciseIds: jsonb("alternative_exercise_ids").default("[]"), // exercise IDs that could substitute
  notes: text("notes"),
  order: integer("order").notNull(),
  isOptional: boolean("is_optional").default(false),
});

export const programWorkoutsRelations = relations(programWorkouts, ({ one }) => ({
  program: one(programs, {
    fields: [programWorkouts.programId],
    references: [programs.id],
  }),
  exercise: one(exercises, {
    fields: [programWorkouts.exerciseId],
    references: [exercises.id],
  }),
}));

// Workout Logs
export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  programAssignmentId: integer("program_assignment_id").references(() => programAssignments.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  day: integer("day"), // which day of the program
  date: date("date").notNull(),
  completed: boolean("completed").notNull(),
  energyBefore: integer("energy_before"), // 1-5 scale
  energyAfter: integer("energy_after"), // 1-5 scale
  painLevel: integer("pain_level"), // 1-10 scale
  fatigueLevel: integer("fatigue_level"), // 1-5 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Set Data (individual set tracking)
export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  workoutLogId: integer("workout_log_id").notNull().references(() => workoutLogs.id),
  setNumber: integer("set_number").notNull(), // 1, 2, 3, etc.
  targetReps: integer("target_reps"), // planned reps
  actualReps: integer("actual_reps"), // what client actually did
  weight: integer("weight"), // in kg (multiplied by 10 for decimal precision)
  duration: integer("duration"), // in seconds for time-based exercises
  rpe: integer("rpe"), // rate of perceived exertion 1-10
  restTime: integer("rest_time"), // actual rest taken in seconds
  notes: text("notes"), // set-specific notes
  createdAt: timestamp("created_at").defaultNow(),
});

// Small Wins
export const smallWins = pgTable("small_wins", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  workoutLogId: integer("workout_log_id").references(() => workoutLogs.id),
  description: text("description").notNull(),
  celebratedBy: varchar("celebrated_by").references(() => users.id),
  celebratedAt: timestamp("celebrated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions/Appointments
export const sessions_appointments = pgTable("sessions_appointments", {
  id: serial("id").primaryKey(),
  specialistId: varchar("specialist_id").notNull().references(() => users.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  time: time("time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  type: varchar("type").notNull(), // "check-in", "program_review", "new_plan", etc.
  status: varchar("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  recurrence: varchar("recurrence"), // none, daily, weekly, biweekly, monthly
  recurrenceEndDate: date("recurrence_end_date"), // when recurrence ends
  meetingLink: varchar("meeting_link"), // for virtual appointments
  location: varchar("location"), // for in-person appointments
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events (for scheduling workouts, habits, etc.)
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  eventType: varchar("event_type").notNull(), // workout, cardio, body-measurement, photo, goal, habit
  date: date("date").notNull(),
  startTime: time("start_time"), // time of day
  endTime: time("end_time"), // time of day
  allDay: boolean("all_day").default(false),
  recurrence: varchar("recurrence"), // none, daily, weekly, biweekly, monthly
  recurrenceEndDate: date("recurrence_end_date"), // when recurrence ends
  programAssignmentId: integer("program_assignment_id").references(() => programAssignments.id),
  workoutLogId: integer("workout_log_id").references(() => workoutLogs.id),
  reminderTime: integer("reminder_time"), // minutes before event to send reminder
  reminderSent: boolean("reminder_sent").default(false),
  color: varchar("color"), // for visual categorization
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Body Measurements for tracking progress
export const bodyMeasurements = pgTable("body_measurements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  weight: integer("weight"), // in kg (stored as grams, displayed as kg with decimal)
  bodyFatPercentage: integer("body_fat_percentage"), // stored as (value * 10)
  musclePercentage: integer("muscle_percentage"), // stored as (value * 10)
  waterPercentage: integer("water_percentage"), // stored as (value * 10)
  waistCircumference: integer("waist_circumference"), // in mm
  hipCircumference: integer("hip_circumference"), // in mm
  chestCircumference: integer("chest_circumference"), // in mm
  armCircumference: integer("arm_circumference"), // in mm
  thighCircumference: integer("thigh_circumference"), // in mm
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress Photos
export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  photoType: varchar("photo_type").notNull(), // front, side, back, other
  photoUrl: varchar("photo_url").notNull(),
  isPrivate: boolean("is_private").default(true), // whether visible to specialists
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals tracking
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  goalType: varchar("goal_type").notNull(), // physical, habit, milestone, symptom-management
  targetDate: date("target_date"),
  startValue: integer("start_value"), // numeric starting point if applicable
  currentValue: integer("current_value"), // current progress if applicable
  targetValue: integer("target_value"), // target to reach if applicable
  measurementUnit: varchar("measurement_unit"), // kg, steps, minutes, etc.
  completed: boolean("completed").default(false),
  completedDate: date("completed_date"),
  priority: integer("priority").default(1), // 1-3 (high, medium, low)
  isSharedWithSpecialist: boolean("is_shared_with_specialist").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Habit Tracking
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  frequency: varchar("frequency").notNull(), // daily, weekdays, weekly, custom
  customDays: jsonb("custom_days").default("[]"), // array of days for custom frequency
  targetValue: integer("target_value"), // target amount if applicable
  measurementUnit: varchar("measurement_unit"), // glasses, minutes, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // optional end date
  reminderTime: time("reminder_time"), // time of day for reminder
  isActive: boolean("is_active").default(true),
  color: varchar("color"), // for visual categorization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Check-ins (tracks energy, mood, symptoms)
export const dailyCheckIns = pgTable("daily_check_ins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  timeOfDay: varchar("time_of_day").notNull(), // morning, afternoon, evening
  energyLevel: integer("energy_level").notNull(), // 1-10 scale
  moodLevel: integer("mood_level").notNull(), // 1-10 scale
  sleepQuality: integer("sleep_quality").notNull(), // 1-10 scale
  painLevel: integer("pain_level").notNull(), // 0-10 scale
  movementConfidence: integer("movement_confidence").notNull(), // 1-10 scale
  symptoms: jsonb("symptoms"), // Array of symptom strings
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyCheckInsRelations = relations(dailyCheckIns, ({ one }) => ({
  user: one(users, {
    fields: [dailyCheckIns.userId],
    references: [users.id],
  }),
}));

// Habit Logs (daily tracking)
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  date: date("date").notNull(),
  completed: boolean("completed").default(false),
  value: integer("value"), // actual amount if applicable
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cardio Activity Tracking
export const cardioActivities = pgTable("cardio_activities", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  activityType: varchar("activity_type").notNull(), // walking, cycling, swimming, etc.
  duration: integer("duration").notNull(), // in minutes
  distance: integer("distance"), // in meters
  avgHeartRate: integer("avg_heart_rate"), // in BPM
  perceivedExertion: integer("perceived_exertion"), // scale 1-10
  caloriesBurned: integer("calories_burned"),
  notes: text("notes"),
  feelingBefore: integer("feeling_before"), // scale 1-5
  feelingAfter: integer("feeling_after"), // scale 1-5
  energyLevel: integer("energy_level"), // scale 1-10
  weatherConditions: varchar("weather_conditions"),
  location: varchar("location"),
  completed: boolean("completed").notNull().default(true)
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
  }),
}));

// Exercise Recommendations based on algorithm
export const exerciseRecommendations = pgTable("exercise_recommendations", {
  id: serial("id").primaryKey(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  assessmentId: integer("assessment_id").references(() => physicalAssessments.id),
  exerciseId: integer("exercise_id").references(() => exercises.id),
  recommendationScore: integer("recommendation_score"), // 0-100 score indicating how good a match this is
  reasonCodes: jsonb("reason_codes"), // ["matches_energy_level", "addresses_comorbidity", "matches_preferences", etc]
  dateGenerated: timestamp("date_generated").defaultNow(),
  specialistApproved: boolean("specialist_approved").default(false),
  specialistNotes: text("specialist_notes"),
  specialistId: varchar("specialist_id").references(() => users.id),
  // Smart prescription fields for review workflow
  status: varchar("status", { enum: ["pending_review", "approved", "modified", "rejected"] }).default("pending_review"),
  isActive: boolean("is_active").default(true),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exerciseRecommendationsRelations = relations(exerciseRecommendations, ({ one }) => ({
  patient: one(users, {
    fields: [exerciseRecommendations.patientId],
    references: [users.id],
  }),
  specialist: one(users, {
    fields: [exerciseRecommendations.specialistId],
    references: [users.id],
  }),
  assessment: one(physicalAssessments, {
    fields: [exerciseRecommendations.assessmentId],
    references: [physicalAssessments.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseRecommendations.exerciseId],
    references: [exercises.id],
  }),
}));

// Program Recommendations based on algorithm
export const programRecommendations = pgTable("program_recommendations", {
  id: serial("id").primaryKey(), 
  patientId: varchar("patient_id").notNull().references(() => users.id),
  assessmentId: integer("assessment_id").references(() => physicalAssessments.id),
  programId: integer("program_id").references(() => programs.id),
  recommendationScore: integer("recommendation_score"), // 0-100 score
  reasonCodes: jsonb("reason_codes"), // Reasons this program is recommended
  dateGenerated: timestamp("date_generated").defaultNow(),
  specialistApproved: boolean("specialist_approved").default(false),
  specialistNotes: text("specialist_notes"),
  specialistId: varchar("specialist_id").references(() => users.id),
  // Smart prescription fields for review workflow
  status: varchar("status", { enum: ["pending_review", "approved", "modified", "rejected"] }).default("pending_review"),
  isActive: boolean("is_active").default(true),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programRecommendationsRelations = relations(programRecommendations, ({ one }) => ({
  patient: one(users, {
    fields: [programRecommendations.patientId],
    references: [users.id],
  }),
  specialist: one(users, {
    fields: [programRecommendations.specialistId],
    references: [users.id],
  }),
  assessment: one(physicalAssessments, {
    fields: [programRecommendations.assessmentId],
    references: [physicalAssessments.id],
  }),
  program: one(programs, {
    fields: [programRecommendations.programId],
    references: [programs.id],
  }),
}));

// Types for insertions and selections
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type PhysicalAssessment = typeof physicalAssessments.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type ProgramAssignment = typeof programAssignments.$inferSelect;
export type ProgramWorkout = typeof programWorkouts.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type SmallWin = typeof smallWins.$inferSelect;
export type SessionAppointment = typeof sessions_appointments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ExerciseRecommendation = typeof exerciseRecommendations.$inferSelect;
export type ProgramRecommendation = typeof programRecommendations.$inferSelect;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;
export type CardioActivity = typeof cardioActivities.$inferSelect;
export type DailyCheckIn = typeof dailyCheckIns.$inferSelect;

// Insert schemas
export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPhysicalAssessmentSchema = createInsertSchema(physicalAssessments).omit({ id: true, assessmentDate: true, createdAt: true, updatedAt: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramAssignmentSchema = createInsertSchema(programAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramWorkoutSchema = createInsertSchema(programWorkouts).omit({ id: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true, createdAt: true });
export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({ id: true, createdAt: true });
export const insertSmallWinSchema = createInsertSchema(smallWins).omit({ id: true, createdAt: true });
export const insertSessionAppointmentSchema = createInsertSchema(sessions_appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertExerciseRecommendationSchema = createInsertSchema(exerciseRecommendations).omit({ id: true, dateGenerated: true, createdAt: true, updatedAt: true });
export const insertProgramRecommendationSchema = createInsertSchema(programRecommendations).omit({ id: true, dateGenerated: true, createdAt: true, updatedAt: true });

// Insert schemas for calendar, tracking features
export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurements).omit({ id: true, createdAt: true });
export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true, createdAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true, createdAt: true });
export const insertCardioActivitySchema = createInsertSchema(cardioActivities).omit({ id: true, createdAt: true });
export const insertDailyCheckInSchema = createInsertSchema(dailyCheckIns).omit({ id: true, createdAt: true });

// Safety Check responses table - stores PAR-Q form submissions
export const safetyChecks = pgTable("safety_checks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Personal information
  name: varchar("name"),
  dateOfBirth: varchar("date_of_birth"),
  email: varchar("email"),
  
  // Cancer information
  cancerType: varchar("cancer_type"),
  treatmentStage: varchar("treatment_stage"),
  sideEffects: text("side_effects"),
  
  // Physical status
  energyLevel: varchar("energy_level"),
  confidence: varchar("confidence"),
  movementPreferences: text("movement_preferences"),
  
  // Safety concerns (as JSON array)
  safetyConcerns: jsonb("safety_concerns"),
  
  // Safety flags
  needsConsultation: boolean("needs_consultation").default(false),
  hasConsent: boolean("has_consent").default(false),
  hasWaiverAgreement: boolean("has_waiver_agreement").default(false),
  
  // Timestamps
  checkDate: timestamp("check_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for safety checks
export const safetyChecksRelations = relations(safetyChecks, ({ one }) => ({
  user: one(users, {
    fields: [safetyChecks.userId],
    references: [users.id],
  }),
}));

// Safety check types
export type SafetyCheck = typeof safetyChecks.$inferSelect;
export const insertSafetyCheckSchema = createInsertSchema(safetyChecks).omit({ id: true, checkDate: true, createdAt: true, updatedAt: true });

// Medical Research and Guidelines tables
export const medicalResearchSources = pgTable("medical_research_sources", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  authors: text("authors").notNull(),
  institution: varchar("institution"),
  publicationDate: date("publication_date"),
  journalName: varchar("journal_name"),
  volume: varchar("volume"),
  issueNumber: varchar("issue_number"),
  pages: varchar("pages"),
  doi: varchar("doi"),
  url: varchar("url"),
  abstract: text("abstract"),
  fullTextAccess: boolean("full_text_access").default(false),
  peerReviewed: boolean("peer_reviewed").default(true),
  citationCount: integer("citation_count"),
  qualityRating: integer("quality_rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const exerciseGuidelines = pgTable("exercise_guidelines", {
  id: serial("id").primaryKey(),
  cancerType: varchar("cancer_type").notNull(),
  treatmentPhase: varchar("treatment_phase").notNull(),
  guidelineTitle: varchar("guideline_title").notNull(),
  recommendedExerciseTypes: jsonb("recommended_exercise_types"),
  exerciseIntensity: jsonb("exercise_intensity"),
  frequencyPerWeek: jsonb("frequency_per_week"),
  durationMinutes: jsonb("duration_minutes"),
  precautions: jsonb("precautions"),
  contraindications: jsonb("contraindications"),
  specialConsiderations: text("special_considerations"),
  adaptations: jsonb("adaptations"),
  progressionTimeline: jsonb("progression_timeline"),
  evidenceLevel: varchar("evidence_level"),
  sourceId: integer("source_id").references(() => medicalResearchSources.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const exerciseGuidelinesRelations = relations(exerciseGuidelines, ({ one }) => ({
  source: one(medicalResearchSources, {
    fields: [exerciseGuidelines.sourceId],
    references: [medicalResearchSources.id]
  })
}));

export const symptomManagementGuidelines = pgTable("symptom_management_guidelines", {
  id: serial("id").primaryKey(),
  symptomName: varchar("symptom_name").notNull(),
  cancerRelated: boolean("cancer_related").default(true),
  treatmentRelated: boolean("treatment_related").default(true),
  description: text("description"),
  recommendedApproaches: jsonb("recommended_approaches"),
  exerciseBenefits: text("exercise_benefits"),
  recommendedExercises: jsonb("recommended_exercises"),
  avoidedExercises: jsonb("avoided_exercises"),
  intensityModifications: jsonb("intensity_modifications"),
  evidenceQuality: varchar("evidence_quality"),
  sourceId: integer("source_id").references(() => medicalResearchSources.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const symptomManagementGuidelinesRelations = relations(symptomManagementGuidelines, ({ one }) => ({
  source: one(medicalResearchSources, {
    fields: [symptomManagementGuidelines.sourceId],
    references: [medicalResearchSources.id]
  })
}));

export const medicalOrganizationGuidelines = pgTable("medical_organization_guidelines", {
  id: serial("id").primaryKey(),
  organizationName: varchar("organization_name").notNull(),
  guidelineName: varchar("guideline_name").notNull(),
  publicationYear: integer("publication_year"),
  lastUpdated: date("last_updated"),
  scope: varchar("scope").notNull(),
  populationFocus: varchar("population_focus"),
  exerciseRecommendations: jsonb("exercise_recommendations"),
  safetyConsiderations: jsonb("safety_considerations"),
  implementationNotes: text("implementation_notes"),
  url: varchar("url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Types for medical research and guidelines
export type MedicalResearchSource = typeof medicalResearchSources.$inferSelect;
export type ExerciseGuideline = typeof exerciseGuidelines.$inferSelect;
export type SymptomManagementGuideline = typeof symptomManagementGuidelines.$inferSelect;
export type MedicalOrganizationGuideline = typeof medicalOrganizationGuidelines.$inferSelect;

// Insert schemas for medical research and guidelines
export const insertMedicalResearchSourceSchema = createInsertSchema(medicalResearchSources).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExerciseGuidelineSchema = createInsertSchema(exerciseGuidelines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSymptomManagementGuidelineSchema = createInsertSchema(symptomManagementGuidelines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMedicalOrganizationGuidelineSchema = createInsertSchema(medicalOrganizationGuidelines).omit({ id: true, createdAt: true, updatedAt: true });
