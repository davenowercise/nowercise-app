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
  cancerType: varchar("cancer_type"),
  treatmentStage: varchar("treatment_stage"), // "Pre-Treatment", "During Treatment", "Post-Treatment", "Recovery"
  treatmentNotes: text("treatment_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patientProfilesRelations = relations(patientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
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
  videoUrl: varchar("video_url"),
  instructionSteps: jsonb("instruction_steps"), // Array of instruction steps
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

// Types for insertions and selections
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type ProgramAssignment = typeof programAssignments.$inferSelect;
export type ProgramWorkout = typeof programWorkouts.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type SmallWin = typeof smallWins.$inferSelect;
export type SessionAppointment = typeof sessions_appointments.$inferSelect;
export type Message = typeof messages.$inferSelect;

// Insert schemas
export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramAssignmentSchema = createInsertSchema(programAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramWorkoutSchema = createInsertSchema(programWorkouts).omit({ id: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true, createdAt: true });
export const insertSmallWinSchema = createInsertSchema(smallWins).omit({ id: true, createdAt: true });
export const insertSessionAppointmentSchema = createInsertSchema(sessions_appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
