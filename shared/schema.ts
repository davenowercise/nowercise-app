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
  energyLevel: integer("energy_level"), // 1-5 scale
  mobilityStatus: varchar("mobility_status"), // "seated only", "seated and standing with support", etc.
  painLevel: integer("pain_level"), // 1-10 scale
  physicalRestrictions: jsonb("physical_restrictions"), // ["no overhead movement", "limited balance", etc.]
  priorInjuries: jsonb("prior_injuries"), // ["frozen shoulder", "knee pain", etc.]
  confidenceLevel: varchar("confidence_level"), // "low", "medium", "high"
  
  // Fitness history
  priorFitnessLevel: varchar("prior_fitness_level"), // "sedentary", "light active", "moderate", "very active"
  exercisePreferences: jsonb("exercise_preferences"), // ["gentle strength", "yoga", "walking", etc]
  exerciseDislikes: jsonb("exercise_dislikes"), // ["jogging", "high impact", etc]
  weeklyExerciseGoal: varchar("weekly_exercise_goal"), // "3 sessions", "daily", etc.
  equipmentAvailable: jsonb("equipment_available"), // ["chair", "resistance band", etc]
  timePerSession: integer("time_per_session"), // in minutes
  
  // Psychosocial factors
  motivationLevel: integer("motivation_level"), // 1-10 scale
  movementConfidence: varchar("movement_confidence"), // "low", "medium", "high" 
  fearOfInjury: boolean("fear_of_injury"),
  stressLevel: integer("stress_level"), // 1-10 scale
  
  // Environmental factors
  location: varchar("location"), // "home", "gym", "outdoors"
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
  sets: integer("sets"),
  reps: integer("reps"),
  duration: integer("duration"), // in seconds
  restTime: integer("rest_time"), // in seconds
  notes: text("notes"),
  order: integer("order").notNull(),
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
  date: date("date").notNull(),
  completed: boolean("completed").notNull(),
  energyBefore: integer("energy_before"), // 1-5 scale
  energyAfter: integer("energy_after"), // 1-5 scale
  painLevel: integer("pain_level"), // 1-10 scale
  fatigueLevel: integer("fatigue_level"), // 1-5 scale
  notes: text("notes"),
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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type SmallWin = typeof smallWins.$inferSelect;
export type SessionAppointment = typeof sessions_appointments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ExerciseRecommendation = typeof exerciseRecommendations.$inferSelect;
export type ProgramRecommendation = typeof programRecommendations.$inferSelect;

// Insert schemas
export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPhysicalAssessmentSchema = createInsertSchema(physicalAssessments).omit({ id: true, assessmentDate: true, createdAt: true, updatedAt: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramAssignmentSchema = createInsertSchema(programAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramWorkoutSchema = createInsertSchema(programWorkouts).omit({ id: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true, createdAt: true });
export const insertSmallWinSchema = createInsertSchema(smallWins).omit({ id: true, createdAt: true });
export const insertSessionAppointmentSchema = createInsertSchema(sessions_appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertExerciseRecommendationSchema = createInsertSchema(exerciseRecommendations).omit({ id: true, dateGenerated: true, createdAt: true, updatedAt: true });
export const insertProgramRecommendationSchema = createInsertSchema(programRecommendations).omit({ id: true, dateGenerated: true, createdAt: true, updatedAt: true });
