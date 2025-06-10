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
import { CANCER_TYPE_GUIDELINES, getClientOnboardingTier, generateSessionRecommendations } from "./acsm-guidelines";
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
  insertDailyCheckInSchema,
  insertMedicalResearchSourceSchema,
  insertExerciseGuidelineSchema,
  insertSymptomManagementGuidelineSchema,
  insertMedicalOrganizationGuidelineSchema,
  physicalAssessments
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Demo middleware - adds demo user credentials when demo=true is in query
  const demoAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const isDemoMode = req.query.demo === 'true' || 
                      req.headers.referer?.includes('demo=true') ||
                      req.headers['x-demo-mode'] === 'true' ||
                      req.url.includes('demo=true') ||
                      req.originalUrl?.includes('demo=true');
    
    if (isDemoMode) {
      // Add fake user object for demo mode
      (req as any).user = {
        claims: {
          sub: "demo-user",
          email: "demo@nowercise.com",
          first_name: "Demo",
          last_name: "User"
        }
      };
      (req as any).isAuthenticated = () => true;
    }
    next();
  };
  
  // Apply demo middleware to all routes
  app.use(demoAuthMiddleware);
  
  // Override isAuthenticated middleware for demo mode
  const demoOrAuthMiddleware = (req: any, res: any, next: any) => {
    if (req.query.demo === 'true') {
      // Demo mode - already authenticated by demoAuthMiddleware
      return next();
    }
    // Normal authentication
    return isAuthenticated(req, res, next);
  };

  // Auth routes
  app.get('/api/auth/user', demoAuthMiddleware, async (req: any, res) => {
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
  
  // ACSM Guidelines Test page route
  app.get('/acsm-test', (req, res) => {
    res.sendFile('acsm-guidelines-test.html', { root: '.' });
  });
  
  // Client onboarding tier calculation endpoint
  app.post('/api/guidelines/onboarding-tier', async (req, res) => {
    try {
      const { 
        cancerType, 
        symptoms = [], 
        confidenceScore = 5, 
        energyScore = 5 
      } = req.body;
      
      // Calculate tier and get considerations
      const { tier, considerations } = getClientOnboardingTier(
        cancerType,
        symptoms,
        confidenceScore,
        energyScore
      );
      
      res.json({
        tier,
        considerations,
        message: `Based on your profile, we recommend starting at Tier ${tier} exercises.`
      });
    } catch (error) {
      console.error("Error calculating onboarding tier:", error);
      res.status(500).json({ message: "Failed to calculate exercise tier" });
    }
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
  app.get('/api/exercises', demoOrAuthMiddleware, async (req, res) => {
    try {
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
  app.get('/api/programs', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const specialistId = req.user.claims.sub;
      const programs = await storage.getAllPrograms();
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

  app.post('/api/programs', demoAuthMiddleware, async (req: any, res) => {
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
  
  // Cardio Activities endpoints
  app.get('/api/cardio-activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      
      const activities = await storage.getCardioActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching cardio activities:", error);
      res.status(500).json({ message: "Failed to fetch cardio activities" });
    }
  });
  
  app.get('/api/cardio-activities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityId = parseInt(req.params.id);
      
      const activity = await storage.getCardioActivityById(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Cardio activity not found" });
      }
      
      if (activity.userId !== userId) {
        return res.status(403).json({ message: "You don't have access to this activity" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error fetching cardio activity:", error);
      res.status(500).json({ message: "Failed to fetch cardio activity" });
    }
  });
  
  app.get('/api/cardio-activities/date-range/:start/:end', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { start, end } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(start) || !dateRegex.test(end)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const activities = await storage.getCardioActivitiesByDateRange(userId, start, end);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching cardio activities by date range:", error);
      res.status(500).json({ message: "Failed to fetch cardio activities" });
    }
  });
  
  app.post('/api/cardio-activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const activityData = {
        ...req.body,
        userId,
        date: req.body.date || new Date().toISOString().split('T')[0]
      };
      
      // Validate required fields
      if (!activityData.activityType) {
        return res.status(400).json({ message: "Activity type is required" });
      }
      
      if (!activityData.duration) {
        return res.status(400).json({ message: "Duration is required" });
      }
      
      const newActivity = await storage.createCardioActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      console.error("Error creating cardio activity:", error);
      res.status(500).json({ message: "Failed to create cardio activity" });
    }
  });
  
  app.patch('/api/cardio-activities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityId = parseInt(req.params.id);
      
      // Get the activity to check ownership
      const existingActivity = await storage.getCardioActivityById(activityId);
      
      if (!existingActivity) {
        return res.status(404).json({ message: "Cardio activity not found" });
      }
      
      if (existingActivity.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this activity" });
      }
      
      const updatedActivity = await storage.updateCardioActivity(activityId, userId, req.body);
      res.json(updatedActivity);
    } catch (error) {
      console.error("Error updating cardio activity:", error);
      res.status(500).json({ message: "Failed to update cardio activity" });
    }
  });
  
  app.delete('/api/cardio-activities/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activityId = parseInt(req.params.id);
      
      // Get the activity to check ownership
      const existingActivity = await storage.getCardioActivityById(activityId);
      
      if (!existingActivity) {
        return res.status(404).json({ message: "Cardio activity not found" });
      }
      
      if (existingActivity.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this activity" });
      }
      
      const result = await storage.deleteCardioActivity(activityId, userId);
      
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Cardio activity not found" });
      }
    } catch (error) {
      console.error("Error deleting cardio activity:", error);
      res.status(500).json({ message: "Failed to delete cardio activity" });
    }
  });
  
  app.get('/api/cardio-activities/stats/:period', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const period = req.params.period as 'week' | 'month' | 'year';
      
      // Validate period
      if (!['week', 'month', 'year'].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Use 'week', 'month', or 'year'" });
      }
      
      const stats = await storage.getCardioStats(userId, period);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching cardio stats:", error);
      res.status(500).json({ message: "Failed to fetch cardio statistics" });
    }
  });
  
  // Demo endpoint for cardio activities
  app.get('/api/demo/cardio-activities', async (req, res) => {
    // Only available in demo mode
    if (req.query.demo !== 'true') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const demoCardioActivities = [
      {
        id: 1,
        date: today.toISOString().split('T')[0],
        activityType: "walking",
        duration: 30,
        distance: 2000,
        avgHeartRate: 105,
        perceivedExertion: 3,
        energyLevel: 7,
        feelingBefore: 3,
        feelingAfter: 4,
        notes: "Gentle walk in the neighborhood, felt a bit tired initially but better afterward."
      },
      {
        id: 2,
        date: yesterday.toISOString().split('T')[0],
        activityType: "cycling",
        duration: 20,
        distance: 5000,
        avgHeartRate: 120,
        perceivedExertion: 5,
        energyLevel: 6,
        feelingBefore: 2,
        feelingAfter: 4,
        notes: "Stationary bike session while watching TV. Good pace but kept it moderate."
      },
      {
        id: 3,
        date: twoDaysAgo.toISOString().split('T')[0],
        activityType: "walking",
        duration: 15,
        distance: 1000,
        avgHeartRate: 100,
        perceivedExertion: 2,
        energyLevel: 4,
        feelingBefore: 2,
        feelingAfter: 3,
        notes: "Short walk during lunch break. Lower energy day."
      }
    ];
    
    res.json(demoCardioActivities);
  });
  
  // ========================
  // MEDICAL RESEARCH & GUIDELINES ROUTES
  // ========================
  
  // Medical Research Sources routes
  app.get('/api/medical-research', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sources = await storage.getMedicalResearchSources(limit);
      res.json(sources);
    } catch (error) {
      console.error("Error fetching medical research sources:", error);
      res.status(500).json({ message: "An error occurred while fetching medical research sources" });
    }
  });
  
  app.get('/api/medical-research/:id', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const source = await storage.getMedicalResearchSourceById(id);
      
      if (!source) {
        return res.status(404).json({ message: "Medical research source not found" });
      }
      
      res.json(source);
    } catch (error) {
      console.error("Error fetching medical research source:", error);
      res.status(500).json({ message: "An error occurred while fetching the medical research source" });
    }
  });
  
  app.post('/api/medical-research', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertMedicalResearchSourceSchema.parse(req.body);
      const newSource = await storage.createMedicalResearchSource(data);
      
      res.status(201).json(newSource);
    } catch (error) {
      console.error("Error creating medical research source:", error);
      res.status(400).json({ 
        message: "Invalid data for medical research source", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.patch('/api/medical-research/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedSource = await storage.updateMedicalResearchSource(id, updates);
      
      if (!updatedSource) {
        return res.status(404).json({ message: "Medical research source not found" });
      }
      
      res.json(updatedSource);
    } catch (error) {
      console.error("Error updating medical research source:", error);
      res.status(400).json({ 
        message: "Invalid data for medical research source update", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Exercise Guidelines routes
  app.get('/api/exercise-guidelines', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const cancerType = req.query.cancerType as string | undefined;
      const treatmentPhase = req.query.treatmentPhase as string | undefined;
      
      const guidelines = await storage.getExerciseGuidelines(cancerType, treatmentPhase);
      res.json(guidelines);
    } catch (error) {
      console.error("Error fetching exercise guidelines:", error);
      res.status(500).json({ message: "An error occurred while fetching exercise guidelines" });
    }
  });
  
  app.get('/api/exercise-guidelines/:id', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideline = await storage.getExerciseGuidelineById(id);
      
      if (!guideline) {
        return res.status(404).json({ message: "Exercise guideline not found" });
      }
      
      res.json(guideline);
    } catch (error) {
      console.error("Error fetching exercise guideline:", error);
      res.status(500).json({ message: "An error occurred while fetching the exercise guideline" });
    }
  });
  
  // ACSM Cancer Exercise Guidelines API
  app.get('/api/guidelines/:cancerType', async (req, res) => {
    try {
      const cancerType = req.params.cancerType;
      // Normalize cancer type to match our database
      const normalizedType = cancerType.toLowerCase().trim();
      
      // Find appropriate guideline in CANCER_TYPE_GUIDELINES
      let matchedType = 'general'; // Default to general guidelines
      
      Object.keys(CANCER_TYPE_GUIDELINES).forEach(key => {
        if (normalizedType.includes(key)) {
          matchedType = key;
        }
      });
      
      const guideline = CANCER_TYPE_GUIDELINES[matchedType as keyof typeof CANCER_TYPE_GUIDELINES];
      
      if (!guideline) {
        return res.status(404).json({ message: "Cancer type guidelines not found" });
      }
      
      // Format response to match client expectations
      res.json({
        recommendedTier: guideline.base_tier,
        preferredModes: guideline.preferred_modes,
        restrictions: guideline.restrictions,
        notes: guideline.considerations,
        source: guideline.source
      });
    } catch (error) {
      console.error("Error fetching cancer guidelines:", error);
      res.status(500).json({ message: "An error occurred while fetching cancer guidelines" });
    }
  });
  
  // Patient onboarding endpoint for calculating exercise tier and recommendations
  app.post('/api/patient/onboarding', async (req, res) => {
    try {
      const { 
        cancerType, 
        symptoms, 
        confidenceScore, 
        energyScore, 
        comorbidities = [], 
        treatmentPhase = "Post-Treatment",
        parqData 
      } = req.body;
      
      if (!cancerType || !Array.isArray(symptoms) || 
          typeof confidenceScore !== 'number' || typeof energyScore !== 'number') {
        return res.status(400).json({ message: "Invalid request data. Please provide cancerType, symptoms array, confidenceScore, and energyScore" });
      }
      
      // Validate comorbidities if provided
      if (comorbidities && !Array.isArray(comorbidities)) {
        return res.status(400).json({ message: "Comorbidities must be an array of strings" });
      }
      
      // Process PAR-Q+ data if provided
      let parqRequired = false;
      let medicalClearanceRequired = false;
      
      if (parqData && parqData.parqAnswers && Array.isArray(parqData.parqAnswers)) {
        parqRequired = parqData.parqRequired || parqData.parqAnswers.includes("Yes");
        
        // If they answered yes to 3+ questions, definitely need medical clearance
        const yesCount = parqData.parqAnswers.filter(a => a === "Yes").length;
        medicalClearanceRequired = yesCount >= 3;
        
        // Check for specific high-risk combinations that require medical clearance
        const hasHeartCondition = parqData.parqAnswers[0] === "Yes"; // Question 1
        const hasChestPain = parqData.parqAnswers[1] === "Yes" || parqData.parqAnswers[2] === "Yes"; // Question 2 or 3
        const hasDizziness = parqData.parqAnswers[3] === "Yes"; // Question 4
        
        if ((hasHeartCondition && hasChestPain) || (hasHeartCondition && hasDizziness)) {
          medicalClearanceRequired = true;
        }
      }
      
      // Use the established tier calculation function
      const { tier, considerations } = getClientOnboardingTier(
        cancerType, 
        symptoms, 
        confidenceScore, 
        energyScore,
        comorbidities
      );
      
      // Enhanced with treatment phase consideration
      const phaseIntensityMap: Record<string, number> = {
        "Pre-Treatment": 1.0,
        "During Treatment": 0.7,
        "Post-Surgery": 0.6,
        "Post-Treatment": 0.8,
        "Maintenance Treatment": 0.8,
        "Recovery": 0.9,
        "Advanced/Palliative": 0.5
      };
      
      const intensityModifier = phaseIntensityMap[treatmentPhase] || 0.8;
      
      // Check for high-risk combination
      const hasDizziness = symptoms.some(s => s.toLowerCase().includes('dizz'));
      const hasSeriousComorbidity = comorbidities.some(c => {
        const normalizedCond = c.toLowerCase().replace(/\s+/g, '_');
        return ['heart_disease', 'diabetes', 'lung_disease'].includes(normalizedCond);
      });
      const safetyFlag = hasDizziness && hasSeriousComorbidity;
      
      // Get appropriate guideline with improved matching
      const normalizedType = cancerType.toLowerCase().trim();
      let matchedType = 'general';
      
      Object.keys(CANCER_TYPE_GUIDELINES).forEach(key => {
        if (normalizedType.includes(key)) {
          matchedType = key;
        }
      });
      
      const guideline = CANCER_TYPE_GUIDELINES[matchedType as keyof typeof CANCER_TYPE_GUIDELINES];
      
      // Generate suggested session names
      const suggestedSessions = [
        tier === 1 ? 'Gentle Session 1 – Small Wins Start Here' :
        tier === 2 ? 'Gentle Session 2 – Balance & Breathe' :
        tier === 3 ? 'Gentle Session 3 – Steady with Bands' :
        tier === 4 ? 'Weekly Movement: Functional Start' : 'Gentle Session 1 – Small Wins Start Here',
        'Seated Breathing Flow',
        'Balance Basics'
      ];
      
      // Get session recommendations
      const sessionRecommendations = generateSessionRecommendations(tier, matchedType);
      
      // Generate weekly plan
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      let daysWithExercise: string[];
      
      // Tier determines exercise frequency
      switch(tier) {
        case 1: daysWithExercise = ["Monday", "Wednesday", "Friday"]; break;
        case 2: daysWithExercise = ["Monday", "Tuesday", "Thursday", "Saturday"]; break;
        case 3: daysWithExercise = ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"]; break;
        case 4: daysWithExercise = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; break;
        default: daysWithExercise = ["Monday", "Wednesday", "Friday"];
      }
      
      const weeklyPlan = dayNames.map(day => ({
        day,
        activity: daysWithExercise.includes(day) ? 
          suggestedSessions[dayNames.indexOf(day) % suggestedSessions.length] : 
          'Rest / Recovery'
      }));
      
      // Build the enhanced response with PAR-Q+ data
      res.json({
        recommendedTier: tier,
        preferredModes: guideline.preferred_modes,
        restrictions: guideline.restrictions,
        notes: considerations,
        source: guideline.source,
        treatmentPhase,
        intensityModifier,
        safetyFlag,
        parqRequired,
        medicalClearanceRequired,
        suggestedSession: suggestedSessions[0],
        sessionRecommendations,
        weeklyPlan
      });
    } catch (error) {
      console.error("Error processing patient onboarding:", error);
      res.status(500).json({ message: "An error occurred during onboarding processing" });
    }
  });
  
  app.post('/api/exercise-guidelines', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertExerciseGuidelineSchema.parse(req.body);
      const newGuideline = await storage.createExerciseGuideline(data);
      
      res.status(201).json(newGuideline);
    } catch (error) {
      console.error("Error creating exercise guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for exercise guideline", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.patch('/api/exercise-guidelines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGuideline = await storage.updateExerciseGuideline(id, updates);
      
      if (!updatedGuideline) {
        return res.status(404).json({ message: "Exercise guideline not found" });
      }
      
      res.json(updatedGuideline);
    } catch (error) {
      console.error("Error updating exercise guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for exercise guideline update", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Symptom Management Guidelines routes
  app.get('/api/symptom-guidelines', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const symptomName = req.query.symptomName as string | undefined;
      
      const guidelines = await storage.getSymptomManagementGuidelines(symptomName);
      res.json(guidelines);
    } catch (error) {
      console.error("Error fetching symptom management guidelines:", error);
      res.status(500).json({ message: "An error occurred while fetching symptom management guidelines" });
    }
  });
  
  app.get('/api/symptom-guidelines/:id', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideline = await storage.getSymptomManagementGuidelineById(id);
      
      if (!guideline) {
        return res.status(404).json({ message: "Symptom management guideline not found" });
      }
      
      res.json(guideline);
    } catch (error) {
      console.error("Error fetching symptom management guideline:", error);
      res.status(500).json({ message: "An error occurred while fetching the symptom management guideline" });
    }
  });
  
  app.post('/api/symptom-guidelines', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertSymptomManagementGuidelineSchema.parse(req.body);
      const newGuideline = await storage.createSymptomManagementGuideline(data);
      
      res.status(201).json(newGuideline);
    } catch (error) {
      console.error("Error creating symptom management guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for symptom management guideline", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.patch('/api/symptom-guidelines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGuideline = await storage.updateSymptomManagementGuideline(id, updates);
      
      if (!updatedGuideline) {
        return res.status(404).json({ message: "Symptom management guideline not found" });
      }
      
      res.json(updatedGuideline);
    } catch (error) {
      console.error("Error updating symptom management guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for symptom management guideline update", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Medical Organization Guidelines routes
  app.get('/api/organization-guidelines', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const organizationName = req.query.organizationName as string | undefined;
      
      const guidelines = await storage.getMedicalOrganizationGuidelines(organizationName);
      res.json(guidelines);
    } catch (error) {
      console.error("Error fetching medical organization guidelines:", error);
      res.status(500).json({ message: "An error occurred while fetching medical organization guidelines" });
    }
  });
  
  app.get('/api/organization-guidelines/:id', demoAuthMiddleware, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideline = await storage.getMedicalOrganizationGuidelineById(id);
      
      if (!guideline) {
        return res.status(404).json({ message: "Medical organization guideline not found" });
      }
      
      res.json(guideline);
    } catch (error) {
      console.error("Error fetching medical organization guideline:", error);
      res.status(500).json({ message: "An error occurred while fetching the medical organization guideline" });
    }
  });
  
  app.post('/api/organization-guidelines', isAuthenticated, async (req: any, res) => {
    try {
      const data = insertMedicalOrganizationGuidelineSchema.parse(req.body);
      const newGuideline = await storage.createMedicalOrganizationGuideline(data);
      
      res.status(201).json(newGuideline);
    } catch (error) {
      console.error("Error creating medical organization guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for medical organization guideline", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  app.patch('/api/organization-guidelines/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedGuideline = await storage.updateMedicalOrganizationGuideline(id, updates);
      
      if (!updatedGuideline) {
        return res.status(404).json({ message: "Medical organization guideline not found" });
      }
      
      res.json(updatedGuideline);
    } catch (error) {
      console.error("Error updating medical organization guideline:", error);
      res.status(400).json({ 
        message: "Invalid data for medical organization guideline update", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Research-based recommendation endpoints
  app.get('/api/exercise-safety-guidelines', demoAuthMiddleware, isAuthenticated, async (req: any, res) => {
    try {
      const { cancerType, treatmentPhase } = req.query;
      let comorbidities = req.query.comorbidities;
      
      // Convert comorbidities to array if provided as string
      if (comorbidities && typeof comorbidities === 'string') {
        comorbidities = comorbidities.split(',');
      }
      
      if (!cancerType || !treatmentPhase) {
        return res.status(400).json({ message: "Cancer type and treatment phase are required parameters" });
      }
      
      const safetyGuidelines = await storage.getExerciseSafetyGuidelines(
        cancerType as string, 
        treatmentPhase as string, 
        comorbidities as string[]
      );
      
      res.json(safetyGuidelines);
    } catch (error) {
      console.error("Error fetching exercise safety guidelines:", error);
      res.status(500).json({ message: "An error occurred while fetching exercise safety guidelines" });
    }
  });
  
  // Demo endpoint for medical research data
  app.get('/api/demo/medical-research', async (req, res) => {
    try {
      // Only available in demo mode
      if (req.query.demo !== 'true') {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const sources = await storage.getMedicalResearchSources();
      
      if (sources.length > 0) {
        res.json(sources);
      } else {
        res.status(404).json({ message: "No medical research sources found. Please run the application startup process to generate demo data." });
      }
    } catch (error) {
      console.error("Error in demo medical research:", error);
      res.status(500).json({ message: "Error fetching demo data" });
    }
  });

  // Daily Check-in Routes
  app.get('/api/daily-checkins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 7;
      
      const checkins = await storage.getDailyCheckIns(userId, limit);
      res.json(checkins);
    } catch (error) {
      console.error('Error fetching daily check-ins:', error);
      res.status(500).json({ message: 'Failed to fetch daily check-ins' });
    }
  });

  app.get('/api/daily-checkins/range', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      const checkins = await storage.getDailyCheckInsByDateRange(userId, startDate as string, endDate as string);
      res.json(checkins);
    } catch (error) {
      console.error('Error fetching daily check-ins by range:', error);
      res.status(500).json({ message: 'Failed to fetch daily check-ins' });
    }
  });

  app.get('/api/daily-checkins/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkIn = await storage.getTodayCheckIn(userId);
      
      if (!checkIn) {
        return res.status(404).json({ message: 'No check-in found for today' });
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error('Error fetching today\'s check-in:', error);
      res.status(500).json({ message: 'Failed to fetch today\'s check-in' });
    }
  });

  app.get('/api/daily-checkins/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkInId = parseInt(req.params.id);
      
      if (isNaN(checkInId)) {
        return res.status(400).json({ message: 'Invalid check-in ID' });
      }
      
      const checkIn = await storage.getDailyCheckInById(checkInId);
      
      if (!checkIn) {
        return res.status(404).json({ message: 'Check-in not found' });
      }
      
      // Security check - make sure user can only access their own check-ins
      if (checkIn.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to check-in' });
      }
      
      res.json(checkIn);
    } catch (error) {
      console.error('Error fetching check-in by ID:', error);
      res.status(500).json({ message: 'Failed to fetch check-in' });
    }
  });

  app.post('/api/daily-checkins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validatedData = insertDailyCheckInSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if there's already a check-in for today
      const today = new Date().toISOString().split('T')[0];
      const existingCheckIn = await storage.getTodayCheckIn(userId);
      
      if (existingCheckIn) {
        // Update existing check-in instead of creating a new one
        const updatedCheckIn = await storage.updateDailyCheckIn(
          existingCheckIn.id, 
          userId, 
          validatedData
        );
        
        return res.json(updatedCheckIn);
      }
      
      // Create new check-in
      const checkIn = await storage.createDailyCheckIn({
        ...validatedData,
        date: today
      });
      
      res.status(201).json(checkIn);
    } catch (error) {
      console.error('Error creating daily check-in:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid check-in data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create check-in' });
    }
  });

  app.put('/api/daily-checkins/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkInId = parseInt(req.params.id);
      
      if (isNaN(checkInId)) {
        return res.status(400).json({ message: 'Invalid check-in ID' });
      }
      
      // Get existing check-in to verify ownership
      const existingCheckIn = await storage.getDailyCheckInById(checkInId);
      
      if (!existingCheckIn) {
        return res.status(404).json({ message: 'Check-in not found' });
      }
      
      // Security check - make sure user can only update their own check-ins
      if (existingCheckIn.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to check-in' });
      }
      
      // Validate update data
      const validatedData = insertDailyCheckInSchema.partial().parse(req.body);
      
      // Update check-in
      const updatedCheckIn = await storage.updateDailyCheckIn(
        checkInId, 
        userId, 
        validatedData
      );
      
      res.json(updatedCheckIn);
    } catch (error) {
      console.error('Error updating check-in:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid check-in data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to update check-in' });
    }
  });

  // Smart Exercise Prescription Routes
  
  // Generate recommendations from daily check-in (client-facing)
  app.post('/api/daily-checkins/:id/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const checkInId = parseInt(req.params.id);
      
      if (isNaN(checkInId)) {
        return res.status(400).json({ message: 'Invalid check-in ID' });
      }
      
      // Get existing check-in to verify ownership
      const existingCheckIn = await storage.getDailyCheckInById(checkInId);
      
      if (!existingCheckIn) {
        return res.status(404).json({ message: 'Check-in not found' });
      }
      
      // Security check - make sure user can only get recommendations for their own check-ins
      if (existingCheckIn.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized access to check-in' });
      }
      
      // Generate recommendations based on check-in data
      const recommendations = await storage.generateRecommendationsFromCheckIn(userId, checkInId);
      
      // For client-facing responses, only show approved recommendations
      if (recommendations.status === 'approved' || recommendations.status === 'modified') {
        res.json(recommendations);
      } else {
        // If still pending review, show a simplified response
        res.json({
          message: 'Your personalized plan is being prepared by your coach',
          readyForReview: true,
          tier: recommendations.tier,
          status: recommendations.status
        });
      }
    } catch (error) {
      console.error('Error generating recommendations from check-in:', error);
      res.status(500).json({ message: 'Failed to generate recommendations' });
    }
  });
  
  // Coach-facing recommendation endpoints
  
  // Get all pending recommendations that need coach review (coach-facing)
  app.get('/api/coach/recommendations/pending', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is a coach/specialist
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'specialist') {
        return res.status(403).json({ message: 'Unauthorized - requires specialist role' });
      }
      
      const pendingRecommendations = await storage.getPendingRecommendations();
      res.json(pendingRecommendations);
    } catch (error) {
      console.error('Error fetching pending recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch pending recommendations' });
    }
  });
  
  // Get detailed recommendation for a specific assessment (coach-facing)
  app.get('/api/coach/recommendations/assessment/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is a coach/specialist
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'specialist') {
        return res.status(403).json({ message: 'Unauthorized - requires specialist role' });
      }
      
      const assessmentId = parseInt(req.params.id);
      
      if (isNaN(assessmentId)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }
      
      // Get assessment
      const assessment = await storage.getPhysicalAssessment(assessmentId);
      
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      
      // Get related recommendations
      const exerciseRecs = await storage.getExerciseRecommendations(assessment.userId, assessmentId);
      const programRecs = await storage.getProgramRecommendations(assessment.userId, assessmentId);
      
      // Get patient profile for context
      const patientProfile = await storage.getPatientProfile(assessment.userId);
      
      // Get user info
      const patient = await storage.getUser(assessment.userId);
      
      res.json({
        assessment,
        exerciseRecommendations: exerciseRecs,
        programRecommendations: programRecs,
        patient: {
          id: patient?.id,
          name: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() || patient?.email || 'Unknown',
          profile: patientProfile
        },
        tier: assessment.strengthLevel || 1, // Using strengthLevel to store tier
        riskFlags: assessment.restrictionNotes ? assessment.restrictionNotes.split(',') : []
      });
    } catch (error) {
      console.error('Error fetching assessment details:', error);
      res.status(500).json({ message: 'Failed to fetch assessment details' });
    }
  });
  
  // Update recommendation status (approve/modify) (coach-facing)
  app.post('/api/coach/recommendations/assessment/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user is a coach/specialist
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'specialist') {
        return res.status(403).json({ message: 'Unauthorized - requires specialist role' });
      }
      
      const assessmentId = parseInt(req.params.id);
      
      if (isNaN(assessmentId)) {
        return res.status(400).json({ message: 'Invalid assessment ID' });
      }
      
      // Validate request body
      const { 
        status, 
        coachNotes, 
        modifiedTier, 
        selectedExerciseIds, 
        selectedProgramIds 
      } = req.body;
      
      if (!status || (status !== 'approved' && status !== 'modified')) {
        return res.status(400).json({ message: 'Status must be either "approved" or "modified"' });
      }
      
      // Update recommendation status
      const updated = await storage.updateRecommendationStatus(
        assessmentId,
        status,
        coachNotes,
        modifiedTier,
        selectedExerciseIds,
        selectedProgramIds
      );
      
      if (!updated) {
        return res.status(500).json({ message: 'Failed to update recommendation status' });
      }
      
      res.json({ 
        message: `Recommendation ${status === 'approved' ? 'approved' : 'modified'} successfully`,
        status
      });
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      res.status(500).json({ message: 'Failed to update recommendation status' });
    }
  });

  // ACSM Cancer Guidelines API
  app.post('/api/guidelines/cancer-type', async (req, res) => {
    try {
      const { cancerType } = req.body;
      
      if (!cancerType) {
        return res.status(400).json({ error: 'Cancer type is required' });
      }
      
      // Normalize cancer type for matching
      const normalizedType = cancerType.toLowerCase().trim();
      let matchedType = 'general'; // Default to general guidelines
      
      // Determine which guideline type to use
      if (normalizedType.includes('breast')) {
        matchedType = 'breast';
      } 
      else if (normalizedType.includes('prostate')) {
        matchedType = 'prostate';
      } 
      else if (normalizedType.includes('blood') || normalizedType.includes('leukemia') || 
              normalizedType.includes('lymphoma') || normalizedType.includes('hematologic')) {
        matchedType = 'hematologic';
      }
      else if (normalizedType.includes('colon') || normalizedType.includes('colorectal') || 
              normalizedType.includes('rectal')) {
        matchedType = 'colorectal';
      }
      else if (normalizedType.includes('lung')) {
        matchedType = 'lung';
      }
      else if (normalizedType.includes('head') || normalizedType.includes('neck')) {
        matchedType = 'head_neck';
      }
      
      // Get the guidelines for the matched type
      const guideline = CANCER_TYPE_GUIDELINES[matchedType as keyof typeof CANCER_TYPE_GUIDELINES] || CANCER_TYPE_GUIDELINES.general;
      
      res.json({
        base_tier: guideline.base_tier,
        considerations: guideline.considerations,
        restrictions: guideline.restrictions,
        preferred_modes: guideline.preferred_modes,
        source: guideline.source
      });
    } catch (error) {
      console.error("Error fetching cancer guidelines:", error);
      res.status(500).json({ message: "Failed to fetch cancer guidelines" });
    }
  });
  
  // Session recommendations API
  app.post('/api/guidelines/sessions', async (req, res) => {
    try {
      const { tier, cancerType, symptomLevel } = req.body;
      
      if (typeof tier !== 'number' || tier < 1 || tier > 4) {
        return res.status(400).json({ error: 'Tier must be a number between 1 and 4' });
      }
      
      if (!cancerType || typeof cancerType !== 'string') {
        return res.status(400).json({ error: 'Cancer type is required' });
      }
      
      const validSymptomLevels = ['low', 'moderate', 'high'];
      const normalizedSymptomLevel = symptomLevel?.toLowerCase() || 'moderate';
      
      if (!validSymptomLevels.includes(normalizedSymptomLevel)) {
        return res.status(400).json({ 
          error: 'Symptom level must be one of: low, moderate, high',
          valid_options: validSymptomLevels
        });
      }
      
      const recommendations = generateSessionRecommendations(tier, cancerType, normalizedSymptomLevel);
      
      res.json({
        message: `Generated ${recommendations.length} session recommendations for tier ${tier} ${cancerType} patient.`,
        sessions: recommendations
      });
    } catch (error) {
      console.error("Error generating session recommendations:", error);
      res.status(500).json({ message: "Failed to generate session recommendations" });
    }
  });

  // YouTube integration routes
  app.get("/api/youtube/videos", demoAuthMiddleware, async (req, res) => {
    try {
      const { query, maxResults = 25 } = req.query;
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      // Use simpler search terms that are more likely to find results
      const searchQuery = query || 'exercise cancer rehabilitation';
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&order=relevance&maxResults=${maxResults}&key=${apiKey}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        console.error("YouTube API error:", data);
        return res.status(response.status).json({ message: data.error?.message || "Failed to fetch YouTube videos" });
      }

      // Get video details including duration
      const videoIds = data.items.map(item => item.id.videoId).join(',');
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      // Format duration from ISO 8601 to readable format
      const formatDuration = (duration) => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      // Combine search results with video details
      const videos = data.items.map(item => {
        const details = detailsData.items.find(detail => detail.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          duration: details ? formatDuration(details.contentDetails.duration) : "Unknown",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: details ? parseInt(details.statistics.viewCount) : 0
        };
      });

      res.json(videos);
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      res.status(500).json({ message: "Failed to fetch YouTube videos" });
    }
  });

  // Search videos by channel ID
  app.get("/api/youtube/channel/:channelId/videos", demoAuthMiddleware, async (req, res) => {
    try {
      const { channelId } = req.params;
      const { maxResults = 50 } = req.query;
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      // First verify the channel exists and get contentDetails for uploads playlist
      const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
      const channelInfoResponse = await fetch(channelInfoUrl);
      const channelInfo = await channelInfoResponse.json();
      
      console.log(`Channel info for ${channelId}:`, channelInfo);

      if (!channelInfo.items || channelInfo.items.length === 0) {
        return res.status(404).json({ message: `Channel ${channelId} not found or not accessible` });
      }

      // For unlisted videos, we need to use the channel's uploads playlist
      // First get the channel's uploads playlist ID
      const channelData = channelInfo.items[0];
      const uploadsPlaylistId = channelData.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        return res.status(404).json({ message: "Could not find uploads playlist for this channel" });
      }

      // Get videos from the uploads playlist (includes unlisted videos)
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
      const response = await fetch(playlistUrl);
      const data = await response.json();

      if (!response.ok) {
        console.error("YouTube API error:", data);
        return res.status(response.status).json({ message: data.error?.message || "Failed to fetch channel videos" });
      }

      console.log(`Channel API response:`, data);

      if (!data.items || data.items.length === 0) {
        console.log(`No videos found for channel ${channelId}`);
        return res.json([]);
      }

      // Get video details including duration - playlist items use different structure
      const videoIds = data.items.map(item => item.snippet.resourceId.videoId).join(',');
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      // Format duration from ISO 8601 to readable format
      const formatDuration = (duration) => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1]) || 0;
        const minutes = parseInt(match[2]) || 0;
        const seconds = parseInt(match[3]) || 0;
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      // Combine search results with video details
      const videos = data.items.map(item => {
        const details = detailsData.items.find(detail => detail.id === item.id.videoId);
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          duration: details ? formatDuration(details.contentDetails.duration) : "Unknown",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: details ? parseInt(details.statistics.viewCount) : 0,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });

      res.json(videos);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      res.status(500).json({ message: "Failed to fetch channel videos" });
    }
  });

  // Get specific Nowercise channel info
  app.get("/api/youtube/channel", demoAuthMiddleware, async (req, res) => {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      // Search for Nowercise channel specifically
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=Nowercise&key=${apiKey}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        console.error("YouTube API error:", data);
        return res.status(response.status).json({ message: data.error?.message || "Failed to fetch channel info" });
      }

      // Find the best matching Nowercise channel
      const nowerciseChannel = data.items.find(channel => 
        channel.snippet.title.toLowerCase().includes('nowercise')
      ) || data.items[0];

      if (nowerciseChannel) {
        // Get detailed channel statistics
        const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${nowerciseChannel.snippet.channelId}&key=${apiKey}`;
        const detailsResponse = await fetch(channelDetailsUrl);
        const detailsData = await detailsResponse.json();

        const channelDetails = detailsData.items[0];
        res.json({
          id: channelDetails.id,
          title: channelDetails.snippet.title,
          description: channelDetails.snippet.description,
          thumbnail: channelDetails.snippet.thumbnails.default.url,
          subscriberCount: channelDetails.statistics.subscriberCount,
          videoCount: channelDetails.statistics.videoCount,
          viewCount: channelDetails.statistics.viewCount
        });
      } else {
        res.status(404).json({ message: "Nowercise channel not found" });
      }
    } catch (error) {
      console.error("Error fetching channel info:", error);
      res.status(500).json({ message: "Failed to fetch channel info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
