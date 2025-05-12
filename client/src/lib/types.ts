// User Types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: number;
  userId: string;
  cancerType?: string;
  treatmentStage?: string;
  treatmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Exercise Types
export interface Exercise {
  id: number;
  name: string;
  description: string;
  energyLevel: number;
  cancerAppropriate: string[];
  treatmentPhases?: string[];
  bodyFocus?: string[];
  benefits?: string[];
  movementType?: string;
  equipment?: string[];
  videoUrl?: string;
  imageUrl?: string;
  duration?: number;
  instructionSteps: string[];
  modifications?: Record<string, string>;
  precautions?: string;
  citations?: Array<{author: string; title: string; journal?: string; year?: number; url?: string}>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Program Types
export interface Program {
  id: number;
  name: string;
  description?: string;
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramWorkout {
  id: number;
  programId: number;
  day: number;
  exerciseId: number;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  order: number;
  exercise?: Exercise;
}

export interface ProgramAssignment {
  id: number;
  programId: number;
  patientId: string;
  specialistId: string;
  startDate: string;
  energyLevel: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  program?: Program;
}

// Workout Logs
export interface WorkoutLog {
  id: number;
  patientId: string;
  programAssignmentId?: number;
  exerciseId?: number;
  date: string;
  completed: boolean;
  energyBefore?: number;
  energyAfter?: number;
  painLevel?: number;
  fatigueLevel?: number;
  notes?: string;
  createdAt: string;
}

// Small Wins
export interface SmallWin {
  id: number;
  patientId: string;
  workoutLogId?: number;
  description: string;
  celebratedBy?: string;
  celebratedAt?: string;
  createdAt: string;
}

// Sessions/Appointments
export interface SessionAppointment {
  id: number;
  specialistId: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Messages
export interface Message {
  id: number;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalPatients: number;
  activePrograms: number;
  smallWins: number;
}

export interface PatientListItem {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  cancerType?: string;
  treatmentStage?: string;
}

export interface PatientActivity {
  type: string;
  createdAt: string;
  patient: User;
  data: any;
}

// Specialist Dashboard Types
export interface SpecialistDashboardData {
  stats: DashboardStats;
  activities: PatientActivity[];
  todaySessions: SessionAppointment[];
  upcomingSessions: SessionAppointment[];
  patients: PatientListItem[];
  programAssignments: (ProgramAssignment & { 
    patient: User;
    program: Program;
  })[];
}

// Patient Dashboard Types
export interface PatientDashboardData {
  programAssignments: (ProgramAssignment & { program: Program })[];
  upcomingWorkouts: ProgramWorkout[];
  recentWorkoutLogs: WorkoutLog[];
  smallWins: SmallWin[];
  upcomingSessions: SessionAppointment[];
}
