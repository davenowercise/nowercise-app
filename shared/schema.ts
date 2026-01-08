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
}));

// Comprehensive patient profiles
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  
  // Personal Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  email: varchar("email"),
  phone: varchar("phone"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  
  // Cancer Details
  cancerType: varchar("cancer_type").notNull(),
  cancerStage: varchar("cancer_stage"),
  diagnosisDate: date("diagnosis_date"),
  primaryTumorLocation: varchar("primary_tumor_location"),
  metastases: boolean("metastases").default(false),
  metastasesLocations: text("metastases_locations"),
  
  // Treatment History
  treatmentStage: varchar("treatment_stage"),
  currentTreatments: jsonb("current_treatments"), // array of treatments
  chemotherapyHistory: boolean("chemotherapy_history").default(false),
  chemotherapyType: varchar("chemotherapy_type"),
  radiationHistory: boolean("radiation_history").default(false),
  radiationArea: varchar("radiation_area"),
  surgeryHistory: boolean("surgery_history").default(false),
  surgeryType: varchar("surgery_type"),
  surgeryDate: date("surgery_date"),
  
  // Medical History
  comorbidities: jsonb("comorbidities"), // array of conditions
  currentMedications: text("current_medications"),
  allergies: text("allergies"),
  previousSurgeries: text("previous_surgeries"),
  familyHistory: text("family_history"),
  
  // Physical Assessment
  energyLevel: integer("energy_level").default(5),
  mobilityStatus: integer("mobility_status").default(5),
  painLevel: integer("pain_level").default(3),
  fatigueLevel: integer("fatigue_level").default(5),
  balanceIssues: boolean("balance_issues").default(false),
  lymphedemaRisk: boolean("lymphedema_risk").default(false),
  physicalRestrictions: text("physical_restrictions"),
  
  // Lifestyle & Exercise History
  previousExerciseLevel: varchar("previous_exercise_level"),
  exercisePreferences: jsonb("exercise_preferences"), // array of preferences
  mobilityAids: jsonb("mobility_aids"), // array of aids
  fitnessGoals: jsonb("fitness_goals"), // array of goals
  motivationLevel: integer("motivation_level").default(5),
  
  // Medical Clearance
  medicalClearance: varchar("medical_clearance"),
  clearanceDate: date("clearance_date"),
  clearingPhysician: varchar("clearing_physician"),
  specialRestrictions: text("special_restrictions"),
  
  // Additional Notes
  patientConcerns: text("patient_concerns"),
  additionalNotes: text("additional_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  aiPrescriptions: many(exercisePrescriptions),
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
export type Patient = typeof patients.$inferSelect;
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
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, createdAt: true, updatedAt: true });
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

// AI Exercise Prescriptions table
export const exercisePrescriptions = pgTable("exercise_prescriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prescriptionName: varchar("prescription_name").notNull(),
  tier: integer("tier").notNull(), // 1-4 based on ACSM guidelines
  duration: integer("duration").notNull(), // weeks
  frequency: integer("frequency").notNull(), // sessions per week
  prescriptionData: jsonb("prescription_data").notNull(), // Full prescription object
  medicalConsiderations: text("medical_considerations"),
  createdByAI: boolean("created_by_ai").default(true),
  specialistId: varchar("specialist_id").references(() => users.id),
  status: varchar("status").notNull().default("active"), // active, completed, modified, cancelled
  startDate: date("start_date"),
  endDate: date("end_date"),
  adaptationHistory: jsonb("adaptation_history"), // Track AI adaptations
  outcomeMetrics: jsonb("outcome_metrics"), // Progress tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const exercisePrescriptionsRelations = relations(exercisePrescriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [exercisePrescriptions.userId],
    references: [users.id]
  }),
  specialist: one(users, {
    fields: [exercisePrescriptions.specialistId],
    references: [users.id]
  }),
  prescriptionExercises: many(prescriptionExercises)
}));

// Prescription exercises linking table
export const prescriptionExercises = pgTable("prescription_exercises", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull().references(() => exercisePrescriptions.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets").notNull(),
  reps: varchar("reps").notNull(), // e.g., "8-12" or "30 seconds"
  intensity: varchar("intensity").notNull(), // low, moderate, vigorous
  restPeriod: varchar("rest_period"),
  modifications: jsonb("modifications"),
  safetyNotes: jsonb("safety_notes"),
  progressionTriggers: jsonb("progression_triggers"),
  exerciseType: varchar("exercise_type").notNull().default("main"), // main, warmup, cooldown
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const prescriptionExercisesRelations = relations(prescriptionExercises, ({ one }) => ({
  prescription: one(exercisePrescriptions, {
    fields: [prescriptionExercises.prescriptionId],
    references: [exercisePrescriptions.id]
  }),
  exercise: one(exercises, {
    fields: [prescriptionExercises.exerciseId],
    references: [exercises.id]
  })
}));

// Prescription progress tracking
export const prescriptionProgress = pgTable("prescription_progress", {
  id: serial("id").primaryKey(),
  prescriptionId: integer("prescription_id").notNull().references(() => exercisePrescriptions.id),
  weekNumber: integer("week_number").notNull(),
  completedSessions: integer("completed_sessions").default(0),
  targetSessions: integer("target_sessions").notNull(),
  averageIntensity: integer("average_intensity"), // 1-10 scale
  adherenceRate: integer("adherence_rate"), // percentage
  patientFeedback: text("patient_feedback"),
  symptoms: jsonb("symptoms"),
  adaptationsNeeded: jsonb("adaptations_needed"),
  aiRecommendations: jsonb("ai_recommendations"),
  specialistNotes: text("specialist_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const prescriptionProgressRelations = relations(prescriptionProgress, ({ one }) => ({
  prescription: one(exercisePrescriptions, {
    fields: [prescriptionProgress.prescriptionId],
    references: [exercisePrescriptions.id]
  })
}));

// Types for AI Exercise Prescriptions
export type ExercisePrescription = typeof exercisePrescriptions.$inferSelect;
export type PrescriptionExercise = typeof prescriptionExercises.$inferSelect;
export type PrescriptionProgress = typeof prescriptionProgress.$inferSelect;

export type InsertExercisePrescription = typeof exercisePrescriptions.$inferInsert;
export type InsertPrescriptionExercise = typeof prescriptionExercises.$inferInsert;
export type InsertPrescriptionProgress = typeof prescriptionProgress.$inferInsert;

// Insert schemas for AI Exercise Prescriptions
export const insertExercisePrescriptionSchema = createInsertSchema(exercisePrescriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrescriptionExerciseSchema = createInsertSchema(prescriptionExercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrescriptionProgressSchema = createInsertSchema(prescriptionProgress).omit({ id: true, createdAt: true, updatedAt: true });

// Additional patient types
export type InsertPatient = typeof patients.$inferInsert;
export type InsertPatientType = z.infer<typeof insertPatientSchema>;

// Confidence Score tracking for psychological safety
export const confidenceScores = pgTable("confidence_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  confidenceScore: integer("confidence_score").notNull(), // 1-10 scale
  safeToMove: integer("safe_to_move"), // 1-10 "I feel safe moving today"
  trustBody: integer("trust_body"), // 1-10 "I trust my body during exercise"
  knowLimits: integer("know_limits"), // 1-10 "I know what's OK vs not OK"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const confidenceScoresRelations = relations(confidenceScores, ({ one }) => ({
  user: one(users, {
    fields: [confidenceScores.userId],
    references: [users.id]
  })
}));

// Micro-workout logs for low-energy days ("I Have 3 Minutes" feature)
export const microWorkoutLogs = pgTable("micro_workout_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutType: varchar("workout_type").notNull(), // breathing, seated-mobility, circulation, energy-boost
  completedAt: timestamp("completed_at").notNull(),
  duration: integer("duration"), // actual duration in seconds
  feelingBefore: integer("feeling_before"), // 1-5 scale
  feelingAfter: integer("feeling_after"), // 1-5 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const microWorkoutLogsRelations = relations(microWorkoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [microWorkoutLogs.userId],
    references: [users.id]
  })
}));

// Types for new features
export type ConfidenceScore = typeof confidenceScores.$inferSelect;
export type MicroWorkoutLog = typeof microWorkoutLogs.$inferSelect;

export type InsertConfidenceScore = typeof confidenceScores.$inferInsert;
export type InsertMicroWorkoutLog = typeof microWorkoutLogs.$inferInsert;

// Insert schemas for new features
export const insertConfidenceScoreSchema = createInsertSchema(confidenceScores).omit({ id: true, createdAt: true });
export const insertMicroWorkoutLogSchema = createInsertSchema(microWorkoutLogs).omit({ id: true, createdAt: true });

// ==============================================
// PROGRESSION BACKBONE SYSTEM
// ==============================================

// Training stage enum values
export const TRAINING_STAGES = {
  FOUNDATIONS: 0,
  BUILD_1: 1,
  BUILD_2: 2,
  GROW: 3,
  MAINTAIN: 4
} as const;

export type TrainingStage = typeof TRAINING_STAGES[keyof typeof TRAINING_STAGES];

// Session type for weekly template
export const SESSION_TYPES = {
  STRENGTH: 'strength',
  AEROBIC: 'aerobic',
  MIXED: 'mixed',
  MIND_BODY: 'mind_body',
  REST: 'rest',
  OPTIONAL: 'optional'
} as const;

export type SessionType = typeof SESSION_TYPES[keyof typeof SESSION_TYPES];

// Weekly template structure (stored as JSONB)
export type WeeklyTemplate = {
  monday: SessionType;
  tuesday: SessionType;
  wednesday: SessionType;
  thursday: SessionType;
  friday: SessionType;
  saturday: SessionType;
  sunday: SessionType;
};

// Patient Progression Backbone - tracks training stage and weekly template per patient
export const patientProgressionBackbone = pgTable("patient_progression_backbone", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  
  // Training stage (0-4: FOUNDATIONS, BUILD_1, BUILD_2, GROW, MAINTAIN)
  trainingStage: integer("training_stage").notNull().default(0),
  
  // Weekly template defining intended session types per day
  weeklyTemplate: jsonb("weekly_template").$type<WeeklyTemplate>(),
  
  // Stage-specific parameters
  targetSessionsPerWeek: integer("target_sessions_per_week").notNull().default(2),
  targetMinutesPerSession: integer("target_minutes_per_session").notNull().default(10),
  targetSetsPerExercise: integer("target_sets_per_exercise").notNull().default(1),
  targetRepsPerSet: integer("target_reps_per_set").notNull().default(8),
  
  // Progression tracking
  currentWeekNumber: integer("current_week_number").notNull().default(1),
  stageStartDate: date("stage_start_date"),
  lastProgressionDate: date("last_progression_date"),
  consecutiveGoodWeeks: integer("consecutive_good_weeks").notNull().default(0),
  
  // Safety flags
  medicalHoldActive: boolean("medical_hold_active").default(false),
  holdReason: text("hold_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const patientProgressionBackboneRelations = relations(patientProgressionBackbone, ({ one }) => ({
  user: one(users, {
    fields: [patientProgressionBackbone.userId],
    references: [users.id]
  })
}));

// Session Logs with planned vs actual tracking
export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  
  // Planned session (from backbone)
  plannedType: varchar("planned_type"), // strength, aerobic, mixed, mind_body
  plannedDuration: integer("planned_duration"), // minutes
  plannedStage: integer("planned_stage"), // training stage at time of planning
  
  // Actual session (what was done)
  actualType: varchar("actual_type"), // what they actually did
  actualDuration: integer("actual_duration"), // actual minutes
  
  // Symptom snapshot at session time
  fatigueLevelAtSession: integer("fatigue_level_at_session"), // 1-10
  painLevelAtSession: integer("pain_level_at_session"), // 1-10
  anxietyLevelAtSession: integer("anxiety_level_at_session"), // 1-10
  lowMoodAtSession: boolean("low_mood_at_session"),
  qolLimitsAtSession: boolean("qol_limits_at_session"),
  
  // Adaptation tracking
  wasAdapted: boolean("was_adapted").default(false), // did we modify from plan?
  adaptationReason: text("adaptation_reason"), // why was it adapted?
  symptomSeverity: varchar("symptom_severity"), // green, amber, red
  
  // Performance metrics
  averageRpe: integer("average_rpe"), // 1-10 scale
  exercisesCompleted: integer("exercises_completed"),
  exercisesPlanned: integer("exercises_planned"),
  
  // Session outcome
  sessionCompleted: boolean("session_completed").default(false),
  sessionSkipped: boolean("session_skipped").default(false),
  skipReason: text("skip_reason"),
  
  // Patient notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow()
});

export const sessionLogsRelations = relations(sessionLogs, ({ one }) => ({
  user: one(users, {
    fields: [sessionLogs.userId],
    references: [users.id]
  })
}));

// Weekly Progression Review - captures weekly review decisions
export const weeklyProgressionReviews = pgTable("weekly_progression_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reviewDate: date("review_date").notNull(),
  weekNumber: integer("week_number").notNull(),
  
  // Data used for decision
  sessionsPlanned: integer("sessions_planned").notNull(),
  sessionsCompleted: integer("sessions_completed").notNull(),
  completionRate: integer("completion_rate"), // percentage
  averageRpe: integer("average_rpe"), // 1-10 scale
  redSymptomDays: integer("red_symptom_days"), // count of days with severe symptoms
  amberSymptomDays: integer("amber_symptom_days"), // count of moderate symptom days
  
  // Decision outcome
  previousStage: integer("previous_stage").notNull(),
  newStage: integer("new_stage").notNull(),
  decision: varchar("decision").notNull(), // 'progress', 'hold', 'deload'
  decisionReason: text("decision_reason"),
  
  // Specific changes made (if any)
  minutesChange: integer("minutes_change"), // +/- minutes per week
  sessionsChange: integer("sessions_change"), // +/- sessions per week
  setsChange: integer("sets_change"), // +/- sets per exercise
  
  // Override flags
  wasManualOverride: boolean("was_manual_override").default(false),
  overrideBySpecialist: varchar("override_by_specialist").references(() => users.id),
  
  createdAt: timestamp("created_at").defaultNow()
});

export const weeklyProgressionReviewsRelations = relations(weeklyProgressionReviews, ({ one }) => ({
  user: one(users, {
    fields: [weeklyProgressionReviews.userId],
    references: [users.id]
  }),
  specialist: one(users, {
    fields: [weeklyProgressionReviews.overrideBySpecialist],
    references: [users.id]
  })
}));

// Types for progression backbone
export type PatientProgressionBackbone = typeof patientProgressionBackbone.$inferSelect;
export type SessionLog = typeof sessionLogs.$inferSelect;
export type WeeklyProgressionReview = typeof weeklyProgressionReviews.$inferSelect;

export type InsertPatientProgressionBackbone = typeof patientProgressionBackbone.$inferInsert;
export type InsertSessionLog = typeof sessionLogs.$inferInsert;
export type InsertWeeklyProgressionReview = typeof weeklyProgressionReviews.$inferInsert;

// Insert schemas for progression backbone
export const insertPatientProgressionBackboneSchema = createInsertSchema(patientProgressionBackbone).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionLogSchema = createInsertSchema(sessionLogs).omit({ id: true, createdAt: true });
export const insertWeeklyProgressionReviewSchema = createInsertSchema(weeklyProgressionReviews).omit({ id: true, createdAt: true });

// ============================================================================
// BREAST CANCER PATHWAY v1 - Post-Surgery Early Recovery
// ============================================================================

// Pathway Assignments - links patients to specific cancer pathways with surgery/treatment data
export const pathwayAssignments = pgTable("pathway_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  
  // Pathway identification
  pathwayId: varchar("pathway_id").notNull(), // e.g., "breast_cancer_post_surgery_early_recovery"
  pathwayStage: integer("pathway_stage").notNull().default(1), // 0=very early, 1=foundations, 2=build confidence
  
  // Cancer & surgery details (breast cancer specific)
  cancerType: varchar("cancer_type").notNull(), // breast, prostate, colorectal, etc.
  surgeryType: varchar("surgery_type"), // lumpectomy, mastectomy, reconstruction
  axillarySurgery: varchar("axillary_surgery"), // none, sentinel_node_biopsy, axillary_node_clearance
  surgeryDate: date("surgery_date"),
  daysSinceSurgery: integer("days_since_surgery"), // calculated/cached
  
  // Current treatment (multi-select stored as array)
  currentTreatments: jsonb("current_treatments").default("[]"), // ["chemo", "radiotherapy", "hormone_therapy"]
  
  // Movement readiness assessment
  movementReadiness: varchar("movement_readiness"), // very_cautious, some_confidence, confident
  
  // Optional assessments
  shoulderRestriction: boolean("shoulder_restriction").default(false),
  neuropathy: boolean("neuropathy").default(false),
  fatigueBaseline: integer("fatigue_baseline"), // 1-5 scale
  
  // Red flags checked during onboarding
  redFlagsChecked: boolean("red_flags_checked").default(false),
  hasActiveRedFlags: boolean("has_active_red_flags").default(false),
  
  // Weekly tracking (reset each week)
  weekStartDate: date("week_start_date"),
  weekStrengthSessions: integer("week_strength_sessions").default(0),
  weekWalkMinutes: integer("week_walk_minutes").default(0),
  weekRestDays: integer("week_rest_days").default(0),
  lastSessionType: varchar("last_session_type"), // strength, walk, mobility, rest
  lastSessionDate: date("last_session_date"),
  
  // Pathway status
  status: varchar("status").notNull().default("active"), // active, paused, completed, needs_review
  pauseReason: text("pause_reason"),
  
  // Coach notes - stores session telemetry history for progression decisions
  coachNotes: jsonb("coach_notes").default("{}"), // { recentSessions: [...], flags: [...] }
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const pathwayAssignmentsRelations = relations(pathwayAssignments, ({ one }) => ({
  user: one(users, {
    fields: [pathwayAssignments.userId],
    references: [users.id]
  })
}));

// Session Templates - defines reusable session structures (Strength A/B/C, Walk, Mobility Mini)
export const sessionTemplates = pgTable("session_templates", {
  id: serial("id").primaryKey(),
  
  // Template identification
  templateCode: varchar("template_code").notNull().unique(), // e.g., "strength_a", "walk_10", "mobility_mini"
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Template properties
  sessionType: varchar("session_type").notNull(), // strength, walk, mobility, rest
  pathwayId: varchar("pathway_id"), // optional: specific to a pathway
  pathwayStage: integer("pathway_stage"), // optional: which stage this is for (1, 2, etc.)
  
  // Duration and structure
  estimatedMinutes: integer("estimated_minutes").notNull(),
  minMinutes: integer("min_minutes"), // for scaled-down version
  
  // Display
  displayTitle: varchar("display_title"), // "Gentle strength session"
  displayDescription: text("display_description"), // "8-12 minutes of gentle resistance"
  easierTitle: varchar("easier_title"), // "If energy is low..."
  easierDescription: text("easier_description"),
  
  // Flags
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Template Exercises - exercises within a session template
export const templateExercises = pgTable("template_exercises", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => sessionTemplates.id),
  exerciseId: integer("exercise_id").references(() => exercises.id), // null for walk sessions
  
  // Exercise details (can override exercise defaults)
  exerciseName: varchar("exercise_name"), // used if no exerciseId, or custom name
  instructions: text("instructions"),
  
  // Prescription
  sets: integer("sets"),
  reps: varchar("reps"), // "6-10" or "30-60s"
  duration: integer("duration"), // seconds
  restBetweenSets: integer("rest_between_sets"), // seconds
  
  // Scaling for energy levels
  lowEnergySets: integer("low_energy_sets"), // if energy 1-2
  lowEnergyReps: varchar("low_energy_reps"),
  
  // Order and flags
  sortOrder: integer("sort_order").notNull().default(0),
  isOptional: boolean("is_optional").default(false),
  canSkip: boolean("can_skip").default(true), // "Skip" allowed without guilt
  hasEasierVersion: boolean("has_easier_version").default(false),
  easierVersionNote: text("easier_version_note"),
  
  createdAt: timestamp("created_at").defaultNow()
});

export const templateExercisesRelations = relations(templateExercises, ({ one }) => ({
  template: one(sessionTemplates, {
    fields: [templateExercises.templateId],
    references: [sessionTemplates.id]
  }),
  exercise: one(exercises, {
    fields: [templateExercises.exerciseId],
    references: [exercises.id]
  })
}));

// Coach Flags - triggers for coach review
export const coachFlags = pgTable("coach_flags", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Flag type and details
  flagType: varchar("flag_type").notNull(), 
  // Types: low_energy_streak, high_pain, sharp_pain, rest_streak, dropout, red_flag_symptom, manual
  
  severity: varchar("severity").notNull().default("amber"), // green, amber, red
  title: varchar("title").notNull(),
  description: text("description"),
  
  // Context data
  triggerData: jsonb("trigger_data"), // { energyLevels: [1,2,1], dates: [...] }
  
  // Resolution
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  
  // Action taken
  actionTaken: varchar("action_taken"), // contacted, adjusted_program, paused, escalated, none
  
  createdAt: timestamp("created_at").defaultNow()
});

export const coachFlagsRelations = relations(coachFlags, ({ one }) => ({
  user: one(users, {
    fields: [coachFlags.userId],
    references: [users.id]
  }),
  resolvedByUser: one(users, {
    fields: [coachFlags.resolvedBy],
    references: [users.id]
  })
}));

// Types for breast cancer pathway
export type PathwayAssignment = typeof pathwayAssignments.$inferSelect;
export type SessionTemplate = typeof sessionTemplates.$inferSelect;
export type TemplateExercise = typeof templateExercises.$inferSelect;
export type CoachFlag = typeof coachFlags.$inferSelect;

export type InsertPathwayAssignment = typeof pathwayAssignments.$inferInsert;
export type InsertSessionTemplate = typeof sessionTemplates.$inferInsert;
export type InsertTemplateExercise = typeof templateExercises.$inferInsert;
export type InsertCoachFlag = typeof coachFlags.$inferInsert;

// Insert schemas for breast cancer pathway
export const insertPathwayAssignmentSchema = createInsertSchema(pathwayAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSessionTemplateSchema = createInsertSchema(sessionTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTemplateExerciseSchema = createInsertSchema(templateExercises).omit({ id: true, createdAt: true });
export const insertCoachFlagSchema = createInsertSchema(coachFlags).omit({ id: true, createdAt: true });
