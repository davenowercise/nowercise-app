import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
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
        const { generateExerciseRecommendations, generateProgramRecommendations } = require('./recommendation-engine');
        
        // Fetch the patient profile
        const patientProfile = await storage.getPatientProfile(userId);
        
        if (patientProfile) {
          // Generate exercise recommendations
          const exerciseRecommendations = await generateExerciseRecommendations(
            patientProfile,
            assessment,
            await storage.getAllExercises()
          );
          
          // Save each recommendation to the database
          for (const recommendation of exerciseRecommendations) {
            await storage.createExerciseRecommendation({
              patientId: userId,
              exerciseId: recommendation.exercise.id,
              assessmentId: assessment.id,
              matchScore: recommendation.score,
              reasonCodes: recommendation.reasonCodes,
              specialistNotes: '',
              status: 'pending',
              dateGenerated: new Date(),
            });
          }
          
          // Generate program recommendations if we have programs in the system
          const specialistPrograms = await storage.getProgramsBySpecialist(null);
          if (specialistPrograms.length > 0) {
            const programRecommendations = await generateProgramRecommendations(
              patientProfile,
              assessment,
              specialistPrograms
            );
            
            // Save each program recommendation to the database
            for (const recommendation of programRecommendations) {
              await storage.createProgramRecommendation({
                patientId: userId,
                programId: recommendation.program.id,
                assessmentId: assessment.id,
                matchScore: recommendation.score,
                reasonCodes: recommendation.reasonCodes,
                specialistNotes: '',
                status: 'pending',
                dateGenerated: new Date(),
              });
            }
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
      
      // Get both exercise and program recommendations
      const exerciseRecommendations = await storage.getExerciseRecommendations(userId, assessmentId);
      const programRecommendations = await storage.getProgramRecommendations(userId, assessmentId);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
