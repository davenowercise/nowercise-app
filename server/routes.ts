import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import {
  insertPatientProfileSchema,
  insertExerciseSchema,
  insertProgramSchema,
  insertProgramWorkoutSchema,
  insertProgramAssignmentSchema,
  insertWorkoutLogSchema,
  insertSmallWinSchema,
  insertSessionAppointmentSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      if (demoMode) {
        // Check if this is a redirect from login page
        if (req.headers['accept']?.includes('text/html')) {
          // Redirect to main page with demo flag
          return res.redirect('/?demo=true');
        }
        
        // Return a demo user for API requests
        return res.json({
          id: "demo-user",
          email: "demo@nowercise.com",
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
          role: "patient",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Normal authentication
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Direct demo login - new simple approach
  app.get('/demo-login', (req, res) => {
    res.redirect('/?demo=true');
  });
  
  // Direct HTML page route - completely bypasses React
  app.get('/nowercise-demo', (req, res) => {
    res.sendFile('no-react-demo.html', { root: '.' });
  });
  
  // Role Management
  app.post('/api/auth/set-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!role || !['specialist', 'patient'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Patient Profile
  app.post('/api/patient/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertPatientProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createPatientProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating patient profile:", error);
      res.status(500).json({ message: "Failed to create patient profile" });
    }
  });

  app.get('/api/patient/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getPatientProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      res.status(500).json({ message: "Failed to fetch patient profile" });
    }
  });

  app.put('/api/patient/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updatePatientProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      res.status(500).json({ message: "Failed to update patient profile" });
    }
  });

  // Specialist Routes
  app.get('/api/specialist/patients', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const patients = await storage.getPatientsBySpecialistId(specialistId);
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post('/api/specialist/assign-patient', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const { patientId } = req.body;
      
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      
      await storage.assignPatientToSpecialist(patientId, specialistId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning patient:", error);
      res.status(500).json({ message: "Failed to assign patient" });
    }
  });

  app.get('/api/specialist/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const stats = await storage.getSpecialistDashboardStats(specialistId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get('/api/specialist/patient-activities', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getPatientActivities(specialistId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching patient activities:", error);
      res.status(500).json({ message: "Failed to fetch patient activities" });
    }
  });

  // Exercise Library
  app.get('/api/exercises', isAuthenticated, async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });
  
  // Import exercises from Google Sheets with Vimeo links
  app.post('/api/exercises/import-from-sheets', isAuthenticated, async (req: any, res) => {
    try {
      const { sheetUrl } = req.body;
      const userId = req.user.claims.sub;
      
      if (!sheetUrl) {
        return res.status(400).json({ message: "Google Sheet URL is required" });
      }
      
      // Note: This is a placeholder endpoint. In a real implementation, you would:
      // 1. Use the Google Sheets API to fetch data from the spreadsheet
      // 2. Parse the exercise data from the sheet
      // 3. Extract Vimeo URLs
      // 4. Create exercise records in the database using storage.createExercise()
      
      return res.json({ 
        message: "Import functionality placeholder", 
        info: "In production, this endpoint would fetch exercise data from the Google Sheet and create new exercises with Vimeo links"
      });
    } catch (error) {
      console.error("Error importing exercises from sheet:", error);
      res.status(500).json({ message: "Failed to import exercises from Google Sheet" });
    }
  });

  app.get('/api/exercises/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExercise(id);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.post('/api/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exerciseData = insertExerciseSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  // Programs
  app.get('/api/programs', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const programs = await storage.getProgramsBySpecialist(specialistId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.get('/api/programs/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.getProgram(id);
      
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      
      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(500).json({ message: "Failed to fetch program" });
    }
  });

  app.post('/api/programs', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const programData = insertProgramSchema.parse({
        ...req.body,
        createdBy: specialistId
      });
      
      const program = await storage.createProgram(programData);
      res.status(201).json(program);
    } catch (error) {
      console.error("Error creating program:", error);
      res.status(500).json({ message: "Failed to create program" });
    }
  });

  app.get('/api/programs/:id/workouts', isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const workouts = await storage.getProgramWorkouts(programId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching program workouts:", error);
      res.status(500).json({ message: "Failed to fetch program workouts" });
    }
  });

  app.post('/api/programs/:id/workouts', isAuthenticated, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const workoutData = insertProgramWorkoutSchema.parse({
        ...req.body,
        programId
      });
      
      const workout = await storage.addExerciseToProgram(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      console.error("Error adding exercise to program:", error);
      res.status(500).json({ message: "Failed to add exercise to program" });
    }
  });

  // Program Assignments
  app.post('/api/program-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const assignmentData = insertProgramAssignmentSchema.parse({
        ...req.body,
        specialistId
      });
      
      const assignment = await storage.assignProgramToPatient(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning program:", error);
      res.status(500).json({ message: "Failed to assign program to patient" });
    }
  });

  app.get('/api/patient/programs', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const assignments = await storage.getPatientAssignments(patientId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching patient programs:", error);
      res.status(500).json({ message: "Failed to fetch patient programs" });
    }
  });

  // Workout Logs
  app.post('/api/workout-logs', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const logData = insertWorkoutLogSchema.parse({
        ...req.body,
        patientId
      });
      
      const log = await storage.logWorkout(logData);
      
      // Optionally create a small win if workout was completed
      if (logData.completed) {
        const programAssignment = logData.programAssignmentId 
          ? await storage.getProgramAssignment(logData.programAssignmentId)
          : null;
        
        const exercise = logData.exerciseId
          ? await storage.getExercise(logData.exerciseId)
          : null;
        
        const winDescription = exercise
          ? `Completed exercise: ${exercise.name}`
          : programAssignment
            ? `Made progress in program: ${programAssignment.program.name}`
            : `Completed a workout session!`;
        
        await storage.recordSmallWin({
          patientId,
          workoutLogId: log.id,
          description: winDescription
        });
      }
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error logging workout:", error);
      res.status(500).json({ message: "Failed to log workout" });
    }
  });

  app.get('/api/workout-logs', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const logs = await storage.getPatientWorkoutLogs(patientId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching workout logs:", error);
      res.status(500).json({ message: "Failed to fetch workout logs" });
    }
  });

  // Small Wins
  app.post('/api/small-wins', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const winData = insertSmallWinSchema.parse({
        ...req.body,
        patientId
      });
      
      const win = await storage.recordSmallWin(winData);
      res.status(201).json(win);
    } catch (error) {
      console.error("Error recording small win:", error);
      res.status(500).json({ message: "Failed to record small win" });
    }
  });

  app.post('/api/small-wins/:id/celebrate', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const winId = parseInt(req.params.id);
      
      const win = await storage.celebrateSmallWin(winId, specialistId);
      
      if (!win) {
        return res.status(404).json({ message: "Small win not found" });
      }
      
      res.json(win);
    } catch (error) {
      console.error("Error celebrating small win:", error);
      res.status(500).json({ message: "Failed to celebrate small win" });
    }
  });

  app.get('/api/small-wins', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const wins = await storage.getPatientSmallWins(patientId);
      res.json(wins);
    } catch (error) {
      console.error("Error fetching small wins:", error);
      res.status(500).json({ message: "Failed to fetch small wins" });
    }
  });

  app.get('/api/small-wins/count/week', isAuthenticated, async (req, res) => {
    try {
      const count = await storage.countSmallWinsThisWeek();
      res.json({ count });
    } catch (error) {
      console.error("Error counting weekly small wins:", error);
      res.status(500).json({ message: "Failed to count weekly small wins" });
    }
  });

  // Sessions/Appointments
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const sessionData = insertSessionAppointmentSchema.parse({
        ...req.body,
        specialistId
      });
      
      const session = await storage.scheduleSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error scheduling session:", error);
      res.status(500).json({ message: "Failed to schedule session" });
    }
  });

  app.get('/api/specialist/today-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const sessions = await storage.getTodaySessions(specialistId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      res.status(500).json({ message: "Failed to fetch today's sessions" });
    }
  });

  app.get('/api/specialist/upcoming-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const sessions = await storage.getUpcomingSessions(specialistId, days);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming sessions" });
    }
  });

  app.get('/api/patient/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const sessions = await storage.getPatientSessions(patientId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching patient sessions:", error);
      res.status(500).json({ message: "Failed to fetch patient sessions" });
    }
  });

  // Messages
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId
      });
      
      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const conversation = await storage.getConversation(currentUserId, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get('/api/messages/unread/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error counting unread messages:", error);
      res.status(500).json({ message: "Failed to count unread messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
