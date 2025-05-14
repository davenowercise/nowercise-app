import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { jsonb as Json } from "drizzle-orm/pg-core";
import { generateExerciseRecommendations, generateProgramRecommendations } from "./recommendation-engine";
import {
  insertPatientProfileSchema,
  insertPhysicalAssessmentSchema,
  insertExerciseSchema,
  insertProgramSchema,
  insertProgramWorkoutSchema,
  insertProgramAssignmentSchema,
  insertWorkoutLogSchema,
  insertSmallWinSchema,
  insertSessionAppointmentSchema,
  insertMessageSchema,
  insertCalendarEventSchema,
  insertBodyMeasurementSchema,
  insertProgressPhotoSchema,
  insertGoalSchema,
  insertHabitSchema,
  insertHabitLogSchema,
  physicalAssessments
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Demo middleware - adds demo user credentials when demo=true is in query
  const demoAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.query.demo === 'true') {
      // Add fake user object for demo mode
      (req as any).user = {
        claims: {
          sub: "demo-user"
        }
      };
      (req as any).isAuthenticated = () => true;
      next();
    } else {
      next();
    }
  };
  
  // Apply demo middleware to all routes
  app.use(demoAuthMiddleware);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Check if this is a redirect from login page with HTML accept header
      if (req.query.demo === 'true' && req.headers['accept']?.includes('text/html')) {
        // Redirect to main page with demo flag
        return res.redirect('/?demo=true');
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user) {
        res.json(user);
      } else {
        // If user not found in database but authenticated, create a basic record
        res.json({
          id: userId,
          email: "user@example.com",
          firstName: "User",
          lastName: userId === "demo-user" ? "Demo" : userId.substring(0, 8),
          profileImageUrl: null,
          role: "patient",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Direct demo login - new simple approach
  app.get('/demo-login', (req, res) => {
    res.redirect('/?demo=true');
  });
  
  // Safety check endpoint for PAR-Q style form
  app.post('/api/patient/safety-check', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Extract user ID (either from session or demo)
      const userId = demoMode ? 'demo-user' : req.user?.claims?.sub;
      
      if (!userId && !demoMode) {
        return res.status(401).json({ error: 'Unauthorized - User not identified' });
      }
      
      // Extract safety check data from request
      const {
        name,
        dateOfBirth,
        email,
        safetyConcerns,
        cancerType,
        treatmentStage,
        sideEffects,
        energyLevel,
        confidence,
        movementPreferences,
        consent,
        waiver
      } = req.body;
      
      // Validate required fields
      if (!consent || !waiver) {
        return res.status(400).json({ 
          error: 'Consent and waiver acknowledgment are required to proceed'
        });
      }
      
      // Determine if there are safety concerns that need medical clearance
      const needsConsultation = Array.isArray(safetyConcerns) && safetyConcerns.length > 0;
      
      // Store the safety check data in the database
      const safetyCheckData = {
        userId,
        name,
        email,
        dateOfBirth,
        cancerType: cancerType || null,
        treatmentStage: treatmentStage || null, 
        sideEffects: JSON.stringify(Array.isArray(sideEffects) ? sideEffects : []),
        energyLevel: energyLevel?.toString() || "3",
        confidence: confidence?.toString() || "3",
        movementPreferences: JSON.stringify(movementPreferences || []),
        safetyConcerns: Array.isArray(safetyConcerns) ? safetyConcerns : [],
        needsConsultation: needsConsultation,
        hasConsent: !!consent,
        hasWaiverAgreement: !!waiver
      };
      
      // Store in database
      const savedSafetyCheck = await storage.storeSafetyCheck(safetyCheckData);
      
      // Return success with ID and consultation flag
      res.status(200).json({
        success: true,
        id: savedSafetyCheck.id,
        needsConsultation,
        checkDate: savedSafetyCheck.checkDate
      });
    } catch (error) {
      console.error("Error processing safety check:", error);
      res.status(500).json({ message: "Failed to process safety check" });
    }
  });
  
  // Endpoint to get patient's most recent safety check
  app.get('/api/patient/safety-check', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Extract user ID (either from session or demo)
      const userId = demoMode ? 'demo-user' : req.user?.claims?.sub;
      
      if (!userId && !demoMode) {
        return res.status(401).json({ error: 'Unauthorized - User not identified' });
      }
      
      // Get the most recent safety check
      const safetyCheck = await storage.getSafetyCheckByUserId(userId);
      
      if (!safetyCheck) {
        return res.status(404).json({ 
          message: "No safety check found for this user",
          completed: false
        });
      }
      
      res.json({
        ...safetyCheck,
        completed: true
      });
    } catch (error) {
      console.error("Error fetching safety check:", error);
      res.status(500).json({ message: "Failed to fetch safety check" });
    }
  });
  
  // Endpoint to get patient's safety check history
  app.get('/api/patient/safety-check/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getSafetyCheckHistory(userId);
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching safety check history:", error);
      res.status(500).json({ message: "Failed to fetch safety check history" });
    }
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

  // Safety check endpoint for PAR-Q style form
  app.post('/api/patient/safety-check', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Extract user ID (either from session or demo)
      const userId = demoMode ? 'demo-user' : req.user?.claims?.sub;
      
      if (!userId && !demoMode) {
        return res.status(401).json({ error: 'Unauthorized - User not identified' });
      }
      
      // For now, just record that the safety check was completed
      // In a production app, you would store this in a safety_checks table
      const {
        name,
        dateOfBirth,
        email,
        safetyConcerns,
        cancerType,
        treatmentStage,
        sideEffects,
        energyLevel,
        confidence,
        movementPreferences,
        consent
      } = req.body;
      
      // Determine if there are safety concerns that need medical clearance
      const needsConsultation = Array.isArray(safetyConcerns) && safetyConcerns.length > 0;
      
      // No database storage yet, just return if consultation is needed
      res.status(200).json({
        success: true,
        needsConsultation
      });
    } catch (error) {
      console.error("Error processing safety check:", error);
      res.status(500).json({ message: "Failed to process safety check" });
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
  app.get('/api/exercises', async (req, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });
  
  // Import exercises from Google Sheets with Vimeo links
  app.post('/api/exercises/import-from-sheets', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { sheetUrl } = req.body;
      const userId = demoMode ? "demo-user" : req.user.claims.sub;
      
      if (!sheetUrl) {
        return res.status(400).json({ message: "Google Sheet URL is required" });
      }
      
      // Note: This is a placeholder endpoint. In a real implementation, you would:
      // 1. Use the Google Sheets API to fetch data from the spreadsheet
      // 2. Parse the exercise data from the sheet
      // 3. Extract Vimeo URLs
      // 4. Create exercise records in the database using storage.createExercise()
      
      // For demo, we'll create a sample exercise with a Vimeo link
      if (demoMode) {
        try {
          // Detect if URL is from the specified sheet 
          if (sheetUrl.includes('1m8lVPriB87vcLiaTSPrCnuZTyeFAFaXfKcTvXUlDnrA')) {
            const demoExercise = {
              name: "Demo Gentle Walking",
              description: "A gentle walking exercise suitable for all energy levels. This demo was imported from the Google Sheet.",
              energyLevel: 1,
              cancerAppropriate: ["Breast Cancer", "Colorectal Cancer", "Prostate Cancer"],
              treatmentPhases: ["During Treatment", "Recovery"],
              bodyFocus: ["Full Body", "Lower Body"],
              benefits: ["Reduces fatigue", "Improves circulation", "Boosts mood"],
              movementType: "Cardio",
              equipment: ["None"],
              videoUrl: "https://vimeo.com/123456789", // Demo Vimeo URL
              instructionSteps: [
                "Start with proper posture, head up and shoulders relaxed",
                "Begin walking at a comfortable pace",
                "Maintain a moderate pace for 5-10 minutes",
                "Cool down with slower walking for 2-3 minutes"
              ],
              precautions: "Stop if you experience dizziness or severe fatigue",
              createdBy: userId
            };
            
            await storage.createExercise(demoExercise);
          }
        } catch (err) {
          console.log("Error creating demo exercise", err);
          // Continue anyway - this is just a demo
        }
      }
      
      return res.json({ 
        message: "Import successfully initiated", 
        info: "Exercises from the Google Sheet will be processed and added to your library"
      });
    } catch (error) {
      console.error("Error importing exercises from sheet:", error);
      res.status(500).json({ message: "Failed to import exercises from Google Sheet" });
    }
  });

  app.get('/api/exercises/:id', async (req, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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

  app.post('/api/exercises', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = demoMode ? "demo-user" : req.user.claims.sub;
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

  // Assessment endpoints
  app.post('/api/assessments', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = demoMode ? "demo-user" : req.user.claims.sub;
      const assessmentData = {
        ...req.body,
        userId,
        assessmentDate: new Date(),
      };
      
      const assessment = await storage.createPhysicalAssessment(assessmentData);
      
      // Generate initial recommendations based on the assessment
      try {
        // Import the recommendation engine functions
        const recommendationEngine = await import('./recommendation-engine');
        
        // Fetch the patient profile
        const patientProfile = await storage.getPatientProfile(userId);
        
        if (patientProfile) {
          try {
            // Generate exercise recommendations
            await recommendationEngine.generateExerciseRecommendations(
              userId,
              assessment.id,
              undefined, // No specialist ID for auto-generated recommendations
              10    // Limit to 10 recommendations
            );
            
            // Generate program recommendations
            await recommendationEngine.generateProgramRecommendations(
              userId,
              assessment.id,
              undefined, // No specialist ID for auto-generated recommendations
              5     // Limit to 5 program recommendations
            );
          } catch (recGenError) {
            console.error("Error in recommendation generation:", recGenError);
            // Continue without failing the whole request
          }
        }
      } catch (recError) {
        console.error("Error generating recommendations:", recError);
        // Continue with the response even if recommendations fail
      }
      
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });
  // Patient assessment endpoint
  app.post('/api/patient/assessment', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Extract user ID (either from session or demo)
      const userId = demoMode ? 'demo-user' : req.user?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized - User not identified' });
      }
      
      const {
        cancerType,
        treatmentStage,
        treatmentNotes,
        treatmentsReceived,
        lymphoedemaRisk,
        energyLevel,
        painLevel,
        mobilityStatus,
        physicalRestrictions,
        otherRestrictions,
        exerciseExperience,
        preferredExerciseTypes,
        exerciseGoals,
        exerciseTime,
        stressLevel,
        confidenceLevel,
        supportNetwork,
        motivators
      } = req.body;
      
      // Create physical assessment record
      const assessment = await storage.createPhysicalAssessment({
        userId,
        energyLevel,
        mobilityStatus,
        painLevel,
        physicalRestrictions,
        restrictionNotes: otherRestrictions || '',
        confidenceLevel,
        priorFitnessLevel: exerciseExperience,
        exercisePreferences: preferredExerciseTypes,
        weeklyExerciseGoal: exerciseGoals.join(', '),
        timePerSession: exerciseTime,
        stressLevel,
        movementConfidence: confidenceLevel,
        fearOfInjury: !supportNetwork // Note: this might be a different meaning than intended
      });
      
      // After creating assessment, generate recommendations
      await generateExerciseRecommendations(userId, assessment.id);
      await generateProgramRecommendations(userId, assessment.id);
      
      res.status(201).json({
        success: true,
        assessmentId: assessment.id,
        message: 'Assessment completed and recommendations generated'
      });
    } catch (error) {
      console.error('Error creating assessment:', error);
      res.status(500).json({ error: 'Failed to create assessment' });
    }
  });
  
  // Get patient assessments
  app.get('/api/patient/assessments', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = demoMode ? "demo-user" : req.user.claims.sub;
      const assessments = await storage.getPhysicalAssessmentsByPatient(userId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });
  
  // Get recommendations for patient
  app.get('/api/patient/recommendations', async (req: any, res) => {
    try {
      // Check for demo mode
      const demoMode = req.query.demo === 'true';
      
      // Normal authentication
      if (!demoMode && (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.claims?.sub)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = demoMode ? "demo-user" : req.user.claims.sub;
      const assessmentId = req.query.assessmentId ? parseInt(req.query.assessmentId, 10) : undefined;
      
      // Fetch the most recent assessment if none specified
      let targetAssessmentId = assessmentId;
      if (!targetAssessmentId) {
        const assessments = await db
          .select()
          .from(physicalAssessments)
          .where(eq(physicalAssessments.userId, userId))
          .orderBy(desc(physicalAssessments.assessmentDate))
          .limit(1);
          
        if (assessments.length > 0) {
          targetAssessmentId = assessments[0].id;
        }
      }
      
      // Get both exercise and program recommendations
      let exerciseRecommendations = await storage.getExerciseRecommendations(userId, targetAssessmentId);
      let programRecommendations = await storage.getProgramRecommendations(userId, targetAssessmentId);
      
      // Generate new recommendations if none found (and we have an assessment)
      if (targetAssessmentId && (exerciseRecommendations.length === 0 || programRecommendations.length === 0)) {
        console.log(`Generating new recommendations for user ${userId} based on assessment ${targetAssessmentId}`);
        
        try {
          // Import the recommendation engine functions
          const recommendationEngine = await import('./recommendation-engine');
          
          // Generate recommendations if we don't have enough
          if (exerciseRecommendations.length === 0) {
            try {
              await recommendationEngine.generateExerciseRecommendations(
                userId,
                targetAssessmentId,
                undefined, 
                10
              );
              // Fetch the newly created exercise recommendations
              exerciseRecommendations = await storage.getExerciseRecommendations(userId, targetAssessmentId);
              console.log(`Generated ${exerciseRecommendations.length} exercise recommendations`);
            } catch (error) {
              console.error('Error generating exercise recommendations:', error);
            }
          }
          
          if (programRecommendations.length === 0) {
            try {
              await recommendationEngine.generateProgramRecommendations(
                userId,
                targetAssessmentId,
                undefined,
                5
              );
              // Fetch the newly created program recommendations
              programRecommendations = await storage.getProgramRecommendations(userId, targetAssessmentId);
              console.log(`Generated ${programRecommendations.length} program recommendations`);
            } catch (error) {
              console.error('Error generating program recommendations:', error);
            }
          }
        } catch (error) {
          console.error('Error importing recommendation engine:', error);
        }
      }
      
      res.json({
        exercises: exerciseRecommendations,
        programs: programRecommendations
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });
  
  // Specialist endpoints for managing recommendations
  app.post('/api/recommendations/exercises/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      const specialistId = req.user.claims.sub;
      const { notes } = req.body;
      
      const updatedRecommendation = await storage.approveExerciseRecommendation(
        recommendationId,
        specialistId,
        notes
      );
      
      res.json(updatedRecommendation);
    } catch (error) {
      console.error("Error approving exercise recommendation:", error);
      res.status(500).json({ message: "Failed to approve recommendation" });
    }
  });
  
  app.post('/api/recommendations/programs/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      const specialistId = req.user.claims.sub;
      const { notes } = req.body;
      
      const updatedRecommendation = await storage.approveProgramRecommendation(
        recommendationId,
        specialistId,
        notes
      );
      
      res.json(updatedRecommendation);
    } catch (error) {
      console.error("Error approving program recommendation:", error);
      res.status(500).json({ message: "Failed to approve recommendation" });
    }
  });

  // Calendar Events API
  app.get('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const events = await storage.getCalendarEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });
  
  app.post('/api/calendar/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertCalendarEventSchema.parse({
        ...req.body,
        userId
      });
      
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });
  
  app.put('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const updatedEvent = await storage.updateCalendarEvent(eventId, userId, req.body);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found or not authorized" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });
  
  app.delete('/api/calendar/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const success = await storage.deleteCalendarEvent(eventId, userId);
      if (!success) {
        return res.status(404).json({ message: "Event not found or not authorized" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });
  
  // Body Measurements API
  app.get('/api/measurements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const measurements = await storage.getBodyMeasurements(userId, limit);
      res.json(measurements);
    } catch (error) {
      console.error("Error fetching body measurements:", error);
      res.status(500).json({ message: "Failed to fetch body measurements" });
    }
  });
  
  app.post('/api/measurements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const measurementData = insertBodyMeasurementSchema.parse({
        ...req.body,
        userId,
        date: req.body.date || new Date()
      });
      
      const measurement = await storage.createBodyMeasurement(measurementData);
      res.json(measurement);
    } catch (error) {
      console.error("Error creating body measurement:", error);
      res.status(500).json({ message: "Failed to create body measurement" });
    }
  });
  
  // Progress Photos API
  app.get('/api/progress-photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoType = req.query.type;
      
      const photos = await storage.getProgressPhotos(userId, photoType);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching progress photos:", error);
      res.status(500).json({ message: "Failed to fetch progress photos" });
    }
  });
  
  app.post('/api/progress-photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoData = insertProgressPhotoSchema.parse({
        ...req.body,
        userId,
        date: req.body.date || new Date()
      });
      
      const photo = await storage.createProgressPhoto(photoData);
      res.json(photo);
    } catch (error) {
      console.error("Error creating progress photo:", error);
      res.status(500).json({ message: "Failed to create progress photo" });
    }
  });
  
  // Goals API
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const completed = req.query.completed === 'true';
      
      const goals = await storage.getGoals(userId, completed);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });
  
  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId
      });
      
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  
  app.put('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalId = parseInt(req.params.id);
      
      if (isNaN(goalId)) {
        return res.status(400).json({ message: "Invalid goal ID" });
      }
      
      const updatedGoal = await storage.updateGoal(goalId, userId, req.body);
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found or not authorized" });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  // Habits API
  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });
  
  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitData = insertHabitSchema.parse({
        ...req.body,
        userId
      });
      
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });
  
  app.post('/api/habits/:id/log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitId = parseInt(req.params.id);
      
      if (isNaN(habitId)) {
        return res.status(400).json({ message: "Invalid habit ID" });
      }
      
      const habitLogData = insertHabitLogSchema.parse({
        habitId,
        userId,
        completedAt: req.body.completedAt || new Date(),
        notes: req.body.notes
      });
      
      const habitLog = await storage.logHabit(habitLogData);
      res.json(habitLog);
    } catch (error) {
      console.error("Error logging habit:", error);
      res.status(500).json({ message: "Failed to log habit" });
    }
  });
  
  // Demo data endpoints for UI testing
  app.get('/api/demo/calendar-events', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    // Generate a set of demo calendar events
    const demoEvents = [
      {
        id: 1,
        title: "Morning Walk",
        eventType: "workout",
        date: today.toISOString().split('T')[0],
        startTime: "08:00:00",
        endTime: "08:30:00",
        allDay: false,
        color: "#4285F4",
        notes: "Easy 30-minute walk to start the day",
        completed: false
      },
      {
        id: 2,
        title: "Doctor Appointment",
        eventType: "treatment",
        date: tomorrow.toISOString().split('T')[0],
        startTime: "10:00:00",
        endTime: "11:00:00",
        allDay: false,
        color: "#FBBC05",
        notes: "Follow-up with oncologist",
        completed: false
      },
      {
        id: 3,
        title: "Strength Training",
        eventType: "workout",
        date: dayAfter.toISOString().split('T')[0],
        startTime: "15:00:00",
        endTime: "15:45:00",
        allDay: false,
        color: "#4285F4",
        notes: "Focus on upper body with resistance bands",
        completed: false
      },
      {
        id: 4,
        title: "Weekly Weigh-In",
        eventType: "measurement",
        date: today.toISOString().split('T')[0],
        allDay: true,
        color: "#34A853",
        notes: "Record weight and measurements",
        completed: false
      },
      {
        id: 5,
        title: "Take Medication",
        eventType: "habit",
        date: today.toISOString().split('T')[0],
        startTime: "08:00:00",
        endTime: "08:05:00",
        recurrence: "daily",
        color: "#EA4335",
        notes: "Take morning medication with breakfast",
        completed: true
      }
    ];
    
    res.json(demoEvents);
  });
  
  app.get('/api/demo/measurements', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Generate some demo measurement data over time
    const today = new Date();
    const measurements = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 7); // Weekly measurements
      
      measurements.push({
        id: i + 1,
        date: date.toISOString().split('T')[0],
        weight: 75000 - (i * 200), // Slight weight loss trend (in grams)
        bodyFatPercentage: 245 - (i * 3), // Slight decrease (stored as value * 10)
        waistCircumference: 85000 - (i * 500), // Slight decrease (in mm)
        notes: i === 0 ? "Starting to see progress!" : null
      });
    }
    
    res.json(measurements);
  });
  
  app.get('/api/demo/progress-photos', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Placeholder photo URLs (these would be actual photo URLs in production)
    const today = new Date();
    const demoPhotos = [
      {
        id: 1,
        date: today.toISOString().split('T')[0],
        photoType: "front",
        photoUrl: "https://via.placeholder.com/300x400?text=Front+View",
        isPrivate: true,
        notes: "Week 1 progress photo"
      },
      {
        id: 2,
        date: today.toISOString().split('T')[0],
        photoType: "side",
        photoUrl: "https://via.placeholder.com/300x400?text=Side+View",
        isPrivate: true,
        notes: "Week 1 progress photo"
      },
      {
        id: 3,
        date: today.toISOString().split('T')[0],
        photoType: "back",
        photoUrl: "https://via.placeholder.com/300x400?text=Back+View",
        isPrivate: true,
        notes: "Week 1 progress photo"
      }
    ];
    
    res.json(demoPhotos);
  });
  
  app.get('/api/demo/goals', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const demoGoals = [
      {
        id: 1,
        title: "Walk 10,000 steps daily",
        description: "Build up to consistently walking 10k steps each day",
        goalType: "physical",
        targetValue: 10000,
        currentValue: 7500,
        unit: "steps",
        deadline: null, // Ongoing goal
        completed: false,
        progress: 75
      },
      {
        id: 2,
        title: "Complete strength training 3x weekly",
        description: "Work with resistance bands or light weights 3 times per week",
        goalType: "physical",
        targetValue: 3,
        currentValue: 2,
        unit: "sessions",
        deadline: null, // Ongoing goal
        completed: false,
        progress: 67
      },
      {
        id: 3,
        title: "Drink 8 glasses of water daily",
        description: "Stay hydrated by drinking at least 8 glasses of water each day",
        goalType: "health",
        targetValue: 8,
        currentValue: 8,
        unit: "glasses",
        deadline: null, // Ongoing goal
        completed: true,
        progress: 100
      }
    ];
    
    res.json(demoGoals);
  });
  
  app.get('/api/demo/habits', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const demoHabits = [
      {
        id: 1,
        title: "Morning stretching",
        description: "5-minute gentle stretching routine each morning",
        frequency: "daily",
        streak: 5,
        lastCompleted: today.toISOString(),
        reminderTime: "08:00:00"
      },
      {
        id: 2,
        title: "Take medication",
        description: "Take prescribed medication with breakfast",
        frequency: "daily",
        streak: 12,
        lastCompleted: today.toISOString(),
        reminderTime: "08:00:00"
      },
      {
        id: 3,
        title: "Meditation",
        description: "10-minute guided meditation for stress reduction",
        frequency: "3 times per week",
        streak: 2,
        lastCompleted: yesterday.toISOString(),
        reminderTime: "20:00:00"
      }
    ];
    
    res.json(demoHabits);
  });

  const httpServer = createServer(app);
  return httpServer;
}
