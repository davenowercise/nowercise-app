import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import aiPrescriptionRoutes from "./routes/ai-prescription";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { jsonb as Json } from "drizzle-orm/pg-core";
import { generateExerciseRecommendations, generateProgramRecommendations } from "./recommendation-engine";
import { CANCER_TYPE_GUIDELINES, getClientOnboardingTier, generateSessionRecommendations } from "./acsm-guidelines";
import { generateExercisePrescription, adaptPrescriptionBasedOnProgress } from "./ai-prescription";
import { fetchChannelVideos, convertVideoToExercise } from "./youtube-api";
import { importCSVVideos } from "./csv-video-importer";
import {
  insertPatientSchema,
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
  insertExercisePrescriptionSchema,
  insertPrescriptionExerciseSchema,
  insertPrescriptionProgressSchema,
  physicalAssessments,
  exercises,
  coachFlags,
  pathwayAssignments,
  pathwaySessionLogs
} from "@shared/schema";
import { generateExercisePrescription, adaptPrescriptionBasedOnProgress } from "./ai-prescription";

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
      // Check for role override (demo-role=specialist or demo-role=patient)
      const demoRole = req.query['demo-role'] || 
                       new URLSearchParams(req.headers.referer?.split('?')[1] || '').get('demo-role') ||
                       'patient';
      
      // Add fake user object for demo mode
      (req as any).user = {
        claims: {
          sub: "demo-user",
          email: "demo@nowercise.com",
          first_name: "Demo",
          last_name: demoRole === 'specialist' ? "Coach" : "Patient"
        }
      };
      (req as any).demoRole = demoRole;
      (req as any).isAuthenticated = () => true;
    }
    next();
  };
  
  // Apply demo middleware to all routes
  app.use(demoAuthMiddleware);
  
  // Override isAuthenticated middleware for demo mode
  const demoOrAuthMiddleware = (req: any, res: any, next: any) => {
    const isDemoMode = req.query.demo === 'true' || 
                      req.headers.referer?.includes('demo=true') ||
                      req.headers['x-demo-mode'] === 'true' ||
                      req.url.includes('demo=true') ||
                      req.originalUrl?.includes('demo=true');
    
    if (isDemoMode) {
      // Demo mode - already authenticated by demoAuthMiddleware
      req.demoMode = true;
      return next();
    }
    req.demoMode = false;
    // Normal authentication
    return isAuthenticated(req, res, next);
  };

  // Auth routes
  app.get('/api/auth/user', demoOrAuthMiddleware, async (req: any, res: any) => {
    try {
      // Check if demo mode
      if (req.query.demo === 'true') {
        const demoRole = req.query['demo-role'] || 'patient';
        return res.json({
          id: "demo-user",
          email: "demo@nowercise.com",
          firstName: "Demo",
          lastName: demoRole === 'specialist' ? "Coach" : "Patient",
          profileImageUrl: null,
          role: demoRole, // Controlled by demo-role query param
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      const user = req.user;
      const userId = user?.claims?.sub || "unknown-user";

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
  
  // Get exercises filtered by cancer type safety rules
  app.get('/api/exercises/safe-for-cancer', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const { cancerType, treatmentPhase } = req.query;
      
      if (!cancerType) {
        return res.status(400).json({ message: "Cancer type is required" });
      }
      
      const exercises = await storage.getAllExercises();
      const { filterExercisesByCancerSafety, getExerciseLimits } = await import('./acsm-guidelines');
      
      const categorized = filterExercisesByCancerSafety(
        exercises.map(e => ({
          id: e.id,
          name: e.name,
          movementType: e.movementType || undefined,
          bodyFocus: e.bodyFocus as string[] || undefined,
          description: e.description,
          precautions: e.precautions || undefined,
          energyLevel: e.energyLevel
        })),
        cancerType as string,
        treatmentPhase as string | undefined
      );
      
      const limits = getExerciseLimits(cancerType as string);
      
      // Map back to full exercise objects
      const safeExercises = exercises.filter(e => categorized.safe.some(s => s.id === e.id));
      const cautionExercises = exercises.filter(e => categorized.caution.some(c => c.id === e.id));
      const avoidExercises = exercises.filter(e => categorized.avoid.some(a => a.id === e.id));
      
      res.json({
        safe: safeExercises,
        caution: cautionExercises,
        avoid: avoidExercises,
        limits
      });
    } catch (error) {
      console.error("Error filtering exercises by cancer safety:", error);
      res.status(500).json({ message: "Failed to filter exercises" });
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

  // Smart batch processing for exercise descriptions
  app.post('/api/exercises/batch-fix-descriptions', demoOrAuthMiddleware, async (req, res) => {
    try {
      const { batchSize = 10, useTemplates = false } = req.body;
      console.log('🔍 Starting smart batch processing...');
      
      // Get truncated exercises in batches
      const truncatedExercises = await db.select().from(exercises)
        .where(like(exercises.description, '%...'))
        .limit(batchSize);
      
      console.log(`📋 Processing ${truncatedExercises.length} exercises in this batch`);

      if (truncatedExercises.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No more truncated descriptions found!',
          updated: 0,
          remaining: 0,
          completed: true
        });
      }

      let updated = 0;
      let failed = 0;

      for (const exercise of truncatedExercises) {
        try {
          console.log(`📝 Processing: ${exercise.name}`);
          
          let completeDescription = '';
          
          if (useTemplates) {
            // Use template-based descriptions
            completeDescription = generateTemplateDescription(exercise);
          } else {
            // Try AI first, fall back to templates
            try {
              const OpenAI = (await import('openai')).default;
              const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
              
              const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: `You are a certified exercise physiologist specializing in cancer recovery. Generate a clear, step-by-step exercise description (4-6 numbered steps) focusing on proper form, safety, and modifications for cancer patients.`
                  },
                  {
                    role: "user",
                    content: `Generate a complete exercise description for: "${exercise.name}"`
                  }
                ],
                max_tokens: 300,
                temperature: 0.7
              });

              completeDescription = response.choices[0].message.content?.trim() || '';
            } catch (aiError) {
              console.log(`AI failed for ${exercise.name}, using template fallback`);
              completeDescription = generateTemplateDescription(exercise);
            }
          }
          
          if (completeDescription) {
            await db.update(exercises)
              .set({ description: completeDescription })
              .where(eq(exercises.id, exercise.id));
            
            updated++;
            console.log(`✅ Updated: ${exercise.name}`);
          } else {
            failed++;
            console.log(`❌ Failed to generate description for: ${exercise.name}`);
          }

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          failed++;
          console.error(`❌ Error processing ${exercise.name}:`, error);
        }
      }

      // Check remaining count
      const remainingCount = await db.select().from(exercises)
        .where(like(exercises.description, '%...'));

      console.log(`📊 Batch Summary: Updated ${updated}, Failed ${failed}, Remaining ${remainingCount.length}`);

      // Provide helpful messaging based on results
      let message = `Batch complete! Updated: ${updated}`;
      if (failed > 0) {
        message += `, Failed: ${failed}`;
      }
      if (remainingCount.length === 0) {
        message = `🎉 All videos processed! Total updated: ${updated}`;
      } else if (updated === 0 && failed > 0) {
        message = `⚠️ Batch failed to process any videos. You may have hit API limits or need to check your OpenAI API key.`;
      }

      res.json({
        success: true,
        message,
        updated,
        failed,
        remaining: remainingCount.length,
        completed: remainingCount.length === 0,
        batchSize: truncatedExercises.length,
        hasErrors: failed > 0,
        suggestions: failed > 0 ? ['Try using Template Mode for faster processing', 'Reduce batch size to avoid API limits'] : []
      });

    } catch (error) {
      console.error('💥 Batch processing failed:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process batch",
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Template description generator function
  function generateTemplateDescription(exercise: any): string {
    const name = exercise.name.toLowerCase();
    const exerciseName = exercise.name;
    
    // Exercise type detection
    if (name.includes('squat')) {
      return `1. Stand with feet shoulder-width apart and maintain good posture. 2. Lower yourself by bending at the hips and knees, keeping your chest up. 3. Go as deep as comfortable while maintaining proper form. 4. Drive through your heels to return to standing position. 5. Keep your core engaged throughout the movement for ${exerciseName}.`;
    } else if (name.includes('push') || name.includes('press')) {
      return `1. Set up in proper starting position with good alignment. 2. Keep your core engaged and shoulder blades stable. 3. Lower yourself with control, going only as far as comfortable. 4. Push back up to the starting position using proper form. 5. Focus on controlled movement throughout ${exerciseName}.`;
    } else if (name.includes('pull') || name.includes('row')) {
      return `1. Start with your arms fully extended and shoulders in proper position. 2. Pull with your back muscles while keeping your core engaged. 3. Squeeze your shoulder blades together at the end of the movement. 4. Control the return to starting position. 5. Maintain good posture throughout ${exerciseName}.`;
    } else if (name.includes('lunge')) {
      return `1. Step forward or backward into a lunge position with good balance. 2. Lower your body until both knees are at about 90 degrees. 3. Keep your torso upright and core engaged. 4. Push through your front heel to return to starting position. 5. Focus on control and balance during ${exerciseName}.`;
    } else if (name.includes('stretch') || name.includes('mobility')) {
      return `1. Begin in a comfortable position with good posture. 2. Slowly move into the stretch position, breathing naturally. 3. Hold the stretch for 15-30 seconds without bouncing. 4. Feel a gentle stretch without pain or discomfort. 5. Release slowly and repeat as needed for ${exerciseName}.`;
    } else if (name.includes('cardio') || name.includes('walk') || name.includes('dance')) {
      return `1. Start at a comfortable pace and warm up gradually. 2. Maintain steady breathing throughout the exercise. 3. Keep your posture upright with relaxed shoulders. 4. Move at a pace that allows you to speak comfortably. 5. Cool down gradually when completing ${exerciseName}.`;
    } else if (name.includes('core') || name.includes('ab')) {
      return `1. Engage your core muscles while maintaining proper spinal alignment. 2. Breathe naturally throughout the exercise, don't hold your breath. 3. Focus on controlled movements rather than speed. 4. Keep your neck in neutral position if lying down. 5. Stop if you feel strain in your lower back during ${exerciseName}.`;
    } else {
      return `1. Begin ${exerciseName} in proper starting position with good posture. 2. Focus on controlled movements and proper breathing throughout. 3. Maintain good form rather than trying to go fast or with heavy resistance. 4. Listen to your body and modify as needed for comfort. 5. Complete the exercise with controlled movement back to starting position.`;
    }
  }

  // Fix all truncated exercise descriptions
  app.post('/api/exercises/fix-descriptions', demoOrAuthMiddleware, async (req, res) => {
    try {
      console.log('🔍 Starting exercise description fix...');
      
      // Import OpenAI here to avoid circular dependencies
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Get all exercises with truncated descriptions
      const truncatedExercises = await db.select().from(exercises).where(like(exercises.description, '%...'));
      
      console.log(`📋 Found ${truncatedExercises.length} exercises with truncated descriptions`);

      if (truncatedExercises.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No truncated descriptions found!',
          updated: 0,
          failed: 0
        });
      }

      let updated = 0;
      let failed = 0;

      for (const exercise of truncatedExercises) {
        try {
          console.log(`📝 Processing: ${exercise.name}`);
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a certified exercise physiologist specializing in cancer recovery and adaptive fitness. Generate a clear, step-by-step exercise description for cancer patients and survivors. 

Requirements:
- Provide 4-6 numbered steps
- Focus on proper form and safety
- Include modifications for different fitness levels
- Use clear, encouraging language
- Emphasize controlled movements and breathing
- Consider limitations that cancer patients might have
- Keep each step concise but informative`
              },
              {
                role: "user",
                content: `Generate a complete exercise description for: "${exercise.name}"`
              }
            ],
            max_tokens: 400,
            temperature: 0.7
          });

          const completeDescription = response.choices[0].message.content?.trim() || '';
          
          if (completeDescription) {
            await db.update(exercises)
              .set({ description: completeDescription })
              .where(eq(exercises.id, exercise.id));
            
            updated++;
            console.log(`✅ Updated: ${exercise.name}`);
          } else {
            failed++;
            console.log(`❌ Failed to generate description for: ${exercise.name}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          failed++;
          console.error(`❌ Error processing ${exercise.name}:`, error);
        }
      }

      console.log('\n📊 Summary:');
      console.log(`✅ Successfully updated: ${updated} exercises`);
      console.log(`❌ Failed: ${failed} exercises`);

      res.json({
        success: true,
        message: `Fixed exercise descriptions! Updated: ${updated}, Failed: ${failed}`,
        updated,
        failed,
        total: truncatedExercises.length
      });

    } catch (error) {
      console.error('💥 Exercise description fix failed:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fix exercise descriptions",
        error: error.message 
      });
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
      
      // Log the request body for debugging
      console.log("Creating exercise with data:", req.body);
      
      // Create exercise data with only the required fields and those provided
      const exerciseData = {
        name: req.body.name,
        description: req.body.description,
        energyLevel: req.body.energyLevel,
        videoUrl: req.body.videoUrl || null,
        createdBy: userId,
        // Set all optional fields to null or empty arrays
        cancerAppropriate: null,
        treatmentPhases: null,
        bodyFocus: null,
        benefits: null,
        movementType: req.body.movementType || null,
        equipment: null,
        imageUrl: null,
        duration: req.body.duration || null,
        instructionSteps: null,
        modifications: null,
        precautions: req.body.precautions || null,
        citations: null
      };
      
      console.log("Parsed exercise data:", exerciseData);
      
      // Validate with Zod schema
      const validatedData = insertExerciseSchema.parse(exerciseData);
      
      const exercise = await storage.createExercise(validatedData);
      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      if (error.name === 'ZodError') {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ message: "Validation failed", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create exercise" });
      }
    }
  });

  // YouTube Exercise Import - Admin/Specialist Only
  app.post('/api/exercises/import-youtube', demoAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.demoMode ? "demo-user" : req.user?.claims?.sub;
      
      // Only allow demo mode or verified admin users to sync videos
      if (!req.demoMode && (!req.user || req.user.claims?.role !== 'specialist')) {
        return res.status(403).json({ 
          message: "Access denied. Video sync is only available to administrators.",
          error: "Insufficient permissions"
        });
      }
      const channelId = req.body.channelId || "UCW9ibzJH9xWAm922rVnHZtg";
      
      console.log("Starting YouTube import for user:", userId, "channel:", channelId);
      
      // Check YouTube API key
      if (!process.env.YOUTUBE_API_KEY) {
        console.error("YouTube API key missing");
        return res.status(500).json({ 
          message: "YouTube API key not configured",
          error: "Missing API credentials"
        });
      }
      
      // Fetch videos from YouTube
      console.log("Fetching videos from YouTube API...");
      const videos = await fetchChannelVideos(channelId);
      console.log(`Found ${videos.length} videos to import`);
      
      if (videos.length === 0) {
        return res.json({ 
          message: `No public videos found in YouTube channel ${channelId}. Please verify the channel ID and ensure it contains public videos.`,
          imported: 0,
          total: 0,
          exercises: [],
          suggestion: "Check that your YouTube channel has public videos and the channel ID is correct. You can find your channel ID in YouTube Studio > Settings > Channel > Advanced settings."
        });
      }
      
      const importedExercises = [];
      const failedImports = [];
      
      // Convert each video to an exercise and save it
      for (const video of videos) {
        try {
          console.log(`Processing video: ${video.title}`);
          const exerciseData = convertVideoToExercise(video, userId);
          console.log("Exercise data prepared:", {
            name: exerciseData.name,
            energyLevel: exerciseData.energyLevel,
            movementType: exerciseData.movementType
          });
          
          // Validate with schema
          const validatedData = insertExerciseSchema.parse(exerciseData);
          console.log("Data validated successfully");
          
          // Create exercise in database
          const exercise = await storage.createExercise(validatedData);
          importedExercises.push(exercise);
          
          console.log("Successfully imported exercise:", exercise.name);
        } catch (error) {
          console.error("Error importing video:", video.title, error);
          failedImports.push({
            video: video.title,
            error: error instanceof Error ? error.message : "Unknown error"
          });
          // Continue with other videos even if one fails
        }
      }
      
      res.json({ 
        message: `Successfully imported ${importedExercises.length} of ${videos.length} exercises from YouTube channel`,
        imported: importedExercises.length,
        total: videos.length,
        failed: failedImports.length,
        exercises: importedExercises,
        failedImports: failedImports
      });
      
    } catch (error) {
      console.error("Error importing YouTube exercises:", error);
      
      // Provide specific error details
      let errorMessage = "Failed to import exercises from YouTube";
      let errorDetails = error instanceof Error ? error.message : "Unknown error";
      
      if (errorDetails.includes("API key")) {
        errorMessage = "YouTube API key configuration issue";
      } else if (errorDetails.includes("quota")) {
        errorMessage = "YouTube API quota exceeded";
      } else if (errorDetails.includes("channel")) {
        errorMessage = "Channel not found or not accessible";
      }
      
      res.status(500).json({ 
        message: errorMessage,
        error: errorDetails,
        details: error instanceof Error ? {
          name: error.name,
          stack: error.stack?.split('\n')[0]
        } : null
      });
    }
  });

  // CSV Video Import - Admin/Specialist Only
  app.post('/api/exercises/import-csv', demoAuthMiddleware, async (req: any, res) => {
    try {
      // Only allow demo mode or verified admin users to import CSV
      if (!req.demoMode && (!req.user || req.user.claims?.role !== 'specialist')) {
        return res.status(403).json({ 
          message: "Access denied. CSV import is only available to administrators.",
          error: "Insufficient permissions"
        });
      }
      
      console.log("Starting CSV video import...");
      
      // Allow user to specify which CSV file to import
      const csvFileName = req.body.csvFile || 'youtube_video_list_replit_ready.csv';
      console.log("Using CSV file:", csvFileName);
      
      const result = await importCSVVideos(csvFileName);
      
      res.json({
        message: `Successfully imported ${result.imported} exercises from CSV file`,
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
        csvFile: csvFileName
      });
      
    } catch (error) {
      console.error("Error importing CSV videos:", error);
      res.status(500).json({ 
        message: "Failed to import CSV videos",
        error: error instanceof Error ? error.message : "Unknown error"
      });
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

  app.get('/api/programs/:id', demoOrAuthMiddleware, async (req, res) => {
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

  app.get('/api/programs/:id/workouts', demoOrAuthMiddleware, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const workouts = await storage.getProgramWorkouts(programId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching program workouts:", error);
      res.status(500).json({ message: "Failed to fetch program workouts" });
    }
  });

  // Add alias for exercises endpoint to match frontend expectations
  app.get('/api/programs/:id/exercises', demoOrAuthMiddleware, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const workouts = await storage.getProgramWorkouts(programId);
      res.json(workouts);
    } catch (error) {
      console.error("Error fetching program exercises:", error);
      res.status(500).json({ message: "Failed to fetch program exercises" });
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

  // Workout Tracking - Create workout log and sets
  app.post('/api/workout-logs', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      
      const workoutLog = await storage.createWorkoutLog({
        patientId,
        programAssignmentId: req.body.programAssignmentId || null,
        exerciseId: req.body.exerciseId,
        day: req.body.day || null,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        energyBefore: req.body.energyBefore || null,
        energyAfter: req.body.energyAfter || null,
        painLevel: req.body.painLevel || null,
        fatigueLevel: req.body.fatigueLevel || null,
        notes: req.body.notes || null
      });

      // Create workout sets if provided
      if (req.body.sets && Array.isArray(req.body.sets)) {
        for (const setData of req.body.sets) {
          await storage.createWorkoutSet({
            workoutLogId: workoutLog.id,
            setNumber: setData.setNumber,
            targetReps: setData.targetReps || null,
            actualReps: setData.actualReps || null,
            weight: setData.weight ? Math.round(setData.weight * 10) : null, // Convert to integer (kg * 10)
            duration: setData.duration || null,
            rpe: setData.rpe || null,
            restTime: setData.restTime || null,
            notes: setData.notes || null
          });
        }
      }

      // Create small win for completed exercise
      if (req.body.exerciseId) {
        const exercise = await storage.getExercise(req.body.exerciseId);
        if (exercise) {
          await storage.recordSmallWin({
            patientId,
            workoutLogId: workoutLog.id,
            description: `Completed exercise: ${exercise.name}`
          });
        }
      }
      
      res.status(201).json(workoutLog);
    } catch (error) {
      console.error("Error logging workout:", error);
      res.status(500).json({ message: "Failed to log workout" });
    }
  });

  app.get('/api/workout-logs', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const logs = await storage.getWorkoutLogs(patientId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching workout logs:", error);
      res.status(500).json({ message: "Failed to fetch workout logs" });
    }
  });

  app.get('/api/workout-progress/:exerciseId', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.user.claims.sub;
      const exerciseId = parseInt(req.params.exerciseId);
      const days = parseInt(req.query.days as string) || 30;
      
      const progress = await storage.getWorkoutProgress(patientId, exerciseId, days);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching workout progress:", error);
      res.status(500).json({ message: "Failed to fetch workout progress" });
    }
  });

  // Progress analytics endpoints
  app.get('/api/progress', demoAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id || "demo-user";
      const timeframe = parseInt(req.query.timeframe as string) || 30;
      const exerciseId = req.query.exerciseId as string;
      
      const progressData = await storage.getProgressMetrics(userId, timeframe, exerciseId);
      res.json(progressData);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress data" });
    }
  });

  app.get('/api/workout-history', demoAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id || "demo-user";
      const timeframe = parseInt(req.query.timeframe as string) || 30;
      
      const workoutHistory = await storage.getWorkoutHistoryForAnalytics(userId, timeframe);
      res.json(workoutHistory);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      res.status(500).json({ message: "Failed to fetch workout history" });
    }
  });

  app.get('/api/exercise-progress', demoAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id || "demo-user";
      const exerciseProgress = await storage.getExerciseProgressAnalytics(userId);
      res.json(exerciseProgress);
    } catch (error) {
      console.error("Error fetching exercise progress:", error);
      res.status(500).json({ message: "Failed to fetch exercise progress" });
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

  // Confidence Score routes (Psychological Safety feature)
  app.get('/api/confidence-scores', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const scores = await storage.getConfidenceScores(userId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching confidence scores:", error);
      res.status(500).json({ message: "Failed to fetch confidence scores" });
    }
  });

  app.post('/api/confidence-scores', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const scoreData = {
        userId,
        date: req.body.date,
        confidenceScore: req.body.confidenceScore,
        safeToMove: req.body.safeToMove,
        trustBody: req.body.trustBody,
        knowLimits: req.body.knowLimits,
        notes: req.body.notes
      };
      const score = await storage.createConfidenceScore(scoreData);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error creating confidence score:", error);
      res.status(500).json({ message: "Failed to create confidence score" });
    }
  });

  // Micro-workout logs (I Have 3 Minutes feature)
  app.get('/api/micro-workout-logs', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const logs = await storage.getMicroWorkoutLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching micro-workout logs:", error);
      res.status(500).json({ message: "Failed to fetch micro-workout logs" });
    }
  });

  app.post('/api/micro-workout-logs', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const logData = {
        userId,
        workoutType: req.body.workoutType,
        completedAt: new Date(req.body.completedAt),
        duration: req.body.duration,
        feelingBefore: req.body.feelingBefore,
        feelingAfter: req.body.feelingAfter,
        notes: req.body.notes
      };
      const log = await storage.createMicroWorkoutLog(logData);
      
      // Also create a small win for completing a micro-workout
      await storage.createSmallWin({
        patientId: userId,
        description: `Completed ${req.body.workoutType.replace(/-/g, ' ')} micro-workout`
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating micro-workout log:", error);
      res.status(500).json({ message: "Failed to create micro-workout log" });
    }
  });

  // ==============================================
  // PROGRESSION BACKBONE SYSTEM
  // ==============================================

  // Get patient's progression backbone
  app.get('/api/progression-backbone', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      let backbone = await storage.getProgressionBackbone(userId);
      
      // Create default backbone if none exists
      if (!backbone) {
        const { createDefaultBackbone } = await import('./progression-backbone');
        const defaultData = createDefaultBackbone(userId);
        backbone = await storage.upsertProgressionBackbone(defaultData);
      }
      
      // Add stage display info
      const { getStageDisplayInfo, getStageConfig } = await import('./progression-backbone');
      const stageInfo = getStageDisplayInfo(backbone.trainingStage as any);
      const stageConfig = getStageConfig(backbone.trainingStage as any);
      
      res.json({
        ...backbone,
        stageInfo,
        stageConfig
      });
    } catch (error) {
      console.error("Error fetching progression backbone:", error);
      res.status(500).json({ message: "Failed to fetch progression backbone" });
    }
  });

  // Get guideline info for current stage
  app.get('/api/progression-backbone/guidelines', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      let backbone = await storage.getProgressionBackbone(userId);
      
      if (!backbone) {
        const { createDefaultBackbone } = await import('./progression-backbone');
        const defaultBackbone = createDefaultBackbone(userId);
        backbone = await storage.upsertProgressionBackbone(defaultBackbone);
      }
      
      const { 
        getStageAerobicTargetRange, 
        getStageStrengthTarget, 
        getGuidelineZoneDescription,
        getGuidelineExplanation,
        AEROBIC_TARGET_RANGE,
        BENEFIT_THRESHOLD
      } = await import('./progression-backbone');
      
      const stage = backbone.trainingStage as string;
      const aerobicTarget = getStageAerobicTargetRange(stage);
      const strengthTarget = getStageStrengthTarget(stage);
      const zoneDescription = getGuidelineZoneDescription(stage);
      
      // Check if on active treatment (would need profile data)
      const onActiveTreatment = false; // TODO: Get from patient profile
      const guidelineExplanation = getGuidelineExplanation(stage, { onActiveTreatment });
      
      res.json({
        stage,
        aerobicTargetMinutes: aerobicTarget,
        strengthTargetSessions: strengthTarget,
        guidelineZone: zoneDescription,
        explanation: guidelineExplanation,
        guidelineConstants: {
          fullGuidelineMinutes: AEROBIC_TARGET_RANGE.MODERATE_MIN,
          benefitThresholdMinutes: BENEFIT_THRESHOLD.AEROBIC_MINUTES_PER_WEEK,
          strengthDaysPerWeek: BENEFIT_THRESHOLD.STRENGTH_SESSIONS_PER_WEEK
        }
      });
    } catch (error) {
      console.error("Error fetching guideline info:", error);
      res.status(500).json({ message: "Failed to fetch guideline info" });
    }
  });

  // Get today's planned session with symptom adaptation
  app.post('/api/progression-backbone/todays-session', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const symptoms = req.body.symptoms || {
        fatigue: 5,
        pain: 3,
        anxiety: 3,
        lowMood: false,
        qolLimits: false
      };
      
      // Get or create backbone
      let backbone = await storage.getProgressionBackbone(userId);
      if (!backbone) {
        const { createDefaultBackbone } = await import('./progression-backbone');
        const defaultData = createDefaultBackbone(userId);
        backbone = await storage.upsertProgressionBackbone(defaultData);
      }
      
      // Get today's planned session and adapt for symptoms
      const { 
        getTodaysPlannedSession, 
        adaptSessionForSymptoms, 
        getStageConfig,
        getStageDisplayInfo,
        calculateSymptomSeverity,
        applyGuidelineCeilings,
        calculateWeeklyVolume,
        getGuidelineZoneDescription
      } = await import('./progression-backbone');
      
      const plannedType = getTodaysPlannedSession(backbone);
      const stageConfig = getStageConfig(backbone.trainingStage as any);
      const stageInfo = getStageDisplayInfo(backbone.trainingStage as any);
      const symptomAdaptedSession = adaptSessionForSymptoms(plannedType, symptoms, backbone);
      const symptomSeverity = calculateSymptomSeverity(symptoms);
      
      // Get weekly volume and apply guideline ceilings
      const sessionLogs = await storage.getSessionLogs(userId, 7);
      const weeklyVolume = calculateWeeklyVolume(sessionLogs, backbone);
      
      // Apply ceiling enforcement to the symptom-adapted session
      const adaptedSession = applyGuidelineCeilings(
        symptomAdaptedSession,
        backbone,
        weeklyVolume.totalAerobicMinutes,
        weeklyVolume.totalStrengthSessions
      );
      
      // Get guideline zone for display - import the helper to resolve stage name
      const { resolveStageToName } = await import('./progression-backbone');
      const stageName = resolveStageToName(backbone.trainingStage);
      const guidelineZone = getGuidelineZoneDescription(stageName);
      
      res.json({
        backbone: {
          ...backbone,
          stageInfo,
          stageConfig
        },
        plannedType,
        plannedDuration: stageConfig.minutesPerSession,
        adaptedSession,
        symptomSeverity,
        symptoms,
        weeklyVolume,
        guidelineZone
      });
    } catch (error) {
      console.error("Error getting today's session:", error);
      res.status(500).json({ message: "Failed to get today's session" });
    }
  });

  // Log a session (planned vs actual)
  app.post('/api/session-logs', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const today = new Date().toISOString().split('T')[0];
      
      const logData = {
        userId,
        date: req.body.date || today,
        plannedType: req.body.plannedType,
        plannedDuration: req.body.plannedDuration,
        plannedStage: req.body.plannedStage,
        actualType: req.body.actualType,
        actualDuration: req.body.actualDuration,
        fatigueLevelAtSession: req.body.fatigue,
        painLevelAtSession: req.body.pain,
        anxietyLevelAtSession: req.body.anxiety,
        lowMoodAtSession: req.body.lowMood,
        qolLimitsAtSession: req.body.qolLimits,
        wasAdapted: req.body.wasAdapted || false,
        adaptationReason: req.body.adaptationReason,
        symptomSeverity: req.body.symptomSeverity,
        averageRpe: req.body.averageRpe,
        exercisesCompleted: req.body.exercisesCompleted,
        exercisesPlanned: req.body.exercisesPlanned,
        sessionCompleted: req.body.sessionCompleted || false,
        sessionSkipped: req.body.sessionSkipped || false,
        skipReason: req.body.skipReason,
        notes: req.body.notes
      };
      
      const log = await storage.createSessionLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating session log:", error);
      res.status(500).json({ message: "Failed to create session log" });
    }
  });

  // Get session logs
  app.get('/api/session-logs', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const limit = parseInt(req.query.limit as string) || 30;
      const logs = await storage.getSessionLogs(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching session logs:", error);
      res.status(500).json({ message: "Failed to fetch session logs" });
    }
  });

  // Weekly progression review
  app.post('/api/progression-backbone/weekly-review', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      
      // Get current backbone
      const backbone = await storage.getProgressionBackbone(userId);
      if (!backbone) {
        return res.status(404).json({ message: "No progression backbone found" });
      }
      
      // Calculate date range for last 7 days
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get weekly stats
      const stats = await storage.getWeeklySessionStats(userId, startDateStr, endDateStr);
      
      // Evaluate progression
      const { evaluateWeeklyProgression, getStageConfig } = await import('./progression-backbone');
      const decision = evaluateWeeklyProgression(backbone, {
        ...stats,
        treatmentPhaseChanged: req.body.treatmentPhaseChanged || false
      });
      
      // Apply the decision if not just viewing
      if (req.body.applyDecision) {
        const newConfig = getStageConfig(decision.newStage);
        await storage.updateTrainingStage(userId, decision.newStage, {
          weeklyTemplate: newConfig.weeklyTemplate,
          targetSessionsPerWeek: newConfig.sessionsPerWeek,
          targetMinutesPerSession: newConfig.minutesPerSession,
          targetSetsPerExercise: newConfig.setsPerExercise,
          targetRepsPerSet: newConfig.repsPerSet,
          consecutiveGoodWeeks: decision.decision === 'progress' 
            ? (backbone.consecutiveGoodWeeks || 0) + 1 
            : decision.decision === 'hold' 
              ? backbone.consecutiveGoodWeeks 
              : 0,
          currentWeekNumber: (backbone.currentWeekNumber || 1) + 1
        });
        
        // Log the review
        await storage.createWeeklyProgressionReview({
          userId,
          reviewDate: endDateStr,
          weekNumber: backbone.currentWeekNumber || 1,
          sessionsPlanned: stats.sessionsPlanned,
          sessionsCompleted: stats.sessionsCompleted,
          completionRate: stats.sessionsPlanned > 0 
            ? Math.round((stats.sessionsCompleted / stats.sessionsPlanned) * 100) 
            : 0,
          averageRpe: stats.averageRpe,
          redSymptomDays: stats.redSymptomDays,
          amberSymptomDays: stats.amberSymptomDays,
          previousStage: backbone.trainingStage,
          newStage: decision.newStage,
          decision: decision.decision,
          decisionReason: decision.reason,
          minutesChange: decision.minutesChange,
          sessionsChange: decision.sessionsChange,
          setsChange: decision.setsChange,
          wasManualOverride: false,
          overrideBySpecialist: null
        });
      }
      
      res.json({
        stats,
        decision,
        currentBackbone: backbone
      });
    } catch (error) {
      console.error("Error performing weekly review:", error);
      res.status(500).json({ message: "Failed to perform weekly review" });
    }
  });

  // Get progression history
  app.get('/api/progression-backbone/history', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const reviews = await storage.getWeeklyProgressionReviews(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching progression history:", error);
      res.status(500).json({ message: "Failed to fetch progression history" });
    }
  });

  // Analyze session patterns (safeguard against always choosing easiest option)
  app.get('/api/progression-backbone/pattern-analysis', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const sessionLogs = await storage.getSessionLogs(userId, 14); // Last 2 weeks
      
      const { analyzeSessionPatterns } = await import('./progression-backbone');
      const analysis = analyzeSessionPatterns(sessionLogs);
      
      // If deviating significantly, also check if backbone should be adjusted
      let adjustmentRecommendation = null;
      if (analysis.isDeviatingFromPlan && analysis.totalSessions >= 6) {
        // Count which types they're actually choosing
        const actualTypes: Record<string, number> = {};
        sessionLogs
          .filter(s => s.sessionCompleted && s.actualType)
          .forEach(s => {
            const type = s.actualType as string;
            actualTypes[type] = (actualTypes[type] || 0) + 1;
          });
        
        // Find most common actual type
        const sortedTypes = Object.entries(actualTypes).sort((a, b) => b[1] - a[1]);
        const preferredType = sortedTypes[0]?.[0];
        
        if (preferredType) {
          adjustmentRecommendation = {
            preferredType,
            message: `You seem to prefer ${preferredType.replace('_', '-')} sessions. We can adjust your weekly template to include more of these while still maintaining variety for your health.`,
            gentleMessage: "There's no wrong way to move. We're simply noticing what works best for you."
          };
        }
      }
      
      res.json({
        ...analysis,
        adjustmentRecommendation
      });
    } catch (error) {
      console.error("Error analyzing session patterns:", error);
      res.status(500).json({ message: "Failed to analyze session patterns" });
    }
  });

  // Update backbone template based on patient preference (specialist or auto-adjustment)
  app.post('/api/progression-backbone/adjust-template', demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const { preferredType, adjustmentReason } = req.body;
      
      // Get current backbone
      const backbone = await storage.getProgressionBackbone(userId);
      if (!backbone) {
        return res.status(404).json({ message: "No progression backbone found" });
      }
      
      // Get current stage config for template
      const { getStageConfig, SESSION_TYPES } = await import('./progression-backbone');
      const currentConfig = getStageConfig(backbone.trainingStage as any);
      
      // Modify template to include more of the preferred type while maintaining balance
      let newTemplate = { ...backbone.weeklyTemplate };
      if (newTemplate && preferredType) {
        // Find optional or mixed slots and convert some to preferred type
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        let changed = 0;
        
        for (const day of days) {
          if (changed >= 2) break; // Only change up to 2 slots
          if (newTemplate[day] === 'optional' || newTemplate[day] === 'mixed') {
            newTemplate[day] = preferredType;
            changed++;
          }
        }
      }
      
      // Update the backbone
      const updated = await storage.upsertProgressionBackbone({
        ...backbone,
        weeklyTemplate: newTemplate
      });
      
      res.json({
        success: true,
        message: "Template adjusted based on your preferences",
        gentleMessage: "We've adjusted your weekly plan to better match what works for you. You can always change this.",
        updatedBackbone: updated
      });
    } catch (error) {
      console.error("Error adjusting backbone template:", error);
      res.status(500).json({ message: "Failed to adjust template" });
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
  
  // Comprehensive Patient Management API
  app.get('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post('/api/patients', isAuthenticated, async (req: any, res) => {
    try {
      const patientData = req.body;
      
      // Calculate age from date of birth
      if (patientData.dateOfBirth) {
        const birthDate = new Date(patientData.dateOfBirth);
        const today = new Date();
        patientData.age = today.getFullYear() - birthDate.getFullYear();
        
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          patientData.age--;
        }
      }

      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ message: "Failed to create patient profile" });
    }
  });

  app.put('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const patientData = req.body;
      
      // Calculate age from date of birth if provided
      if (patientData.dateOfBirth) {
        const birthDate = new Date(patientData.dateOfBirth);
        const today = new Date();
        patientData.age = today.getFullYear() - birthDate.getFullYear();
        
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          patientData.age--;
        }
      }

      const patient = await storage.updatePatient(patientId, patientData);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete('/api/patients/:id', isAuthenticated, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.id);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }

      const success = await storage.deletePatient(patientId);
      if (!success) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  app.get('/api/patients/search', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      const patients = await storage.searchPatients(query.trim());
      res.json(patients);
    } catch (error) {
      console.error("Error searching patients:", error);
      res.status(500).json({ message: "Failed to search patients" });
    }
  });

  // Get all patients (for specialist dashboard)
  app.get("/api/patients", demoAuthMiddleware, async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Comprehensive Patient Intake Route - No auth required for new patient registration
  app.post('/api/patient-intake', async (req: any, res) => {
    try {
      const patientData = req.body;
      
      // Calculate age from date of birth
      if (patientData.dateOfBirth) {
        const birthDate = new Date(patientData.dateOfBirth);
        const today = new Date();
        patientData.age = today.getFullYear() - birthDate.getFullYear();
        
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          patientData.age--;
        }
      }

      // Convert empty date strings to null to prevent database errors
      const dateFields = ['dateOfBirth', 'diagnosisDate', 'surgeryDate', 'clearanceDate'];
      dateFields.forEach(field => {
        if (patientData[field] === '' || patientData[field] === null || patientData[field] === undefined) {
          patientData[field] = null;
        }
      });

      // Convert arrays to JSON strings for database storage
      if (patientData.currentTreatments && Array.isArray(patientData.currentTreatments)) {
        patientData.currentTreatments = JSON.stringify(patientData.currentTreatments);
      }
      if (patientData.comorbidities && Array.isArray(patientData.comorbidities)) {
        patientData.comorbidities = JSON.stringify(patientData.comorbidities);
      }
      if (patientData.exercisePreferences && Array.isArray(patientData.exercisePreferences)) {
        patientData.exercisePreferences = JSON.stringify(patientData.exercisePreferences);
      }
      if (patientData.mobilityAids && Array.isArray(patientData.mobilityAids)) {
        patientData.mobilityAids = JSON.stringify(patientData.mobilityAids);
      }
      if (patientData.fitnessGoals && Array.isArray(patientData.fitnessGoals)) {
        patientData.fitnessGoals = JSON.stringify(patientData.fitnessGoals);
      }

      const patient = await storage.createPatient(patientData);
      
      // Generate AI prescription automatically after patient creation
      try {
        const prescriptionName = `${patient.firstName}'s Personalized Exercise Plan`;
        const aiPrescription = await generateExercisePrescription(
          patient.id.toString(),
          prescriptionName,
          patient.cancerType || 'General',
          patient.treatmentStage || 'Survivorship',
          patient.energyLevel || 5,
          patient.painLevel || 0,
          patient.mobilityStatus || 8,
          patient.exercisePreferences ? JSON.parse(patient.exercisePreferences) : [],
          patient.fitnessGoals ? JSON.parse(patient.fitnessGoals) : [],
          patient.physicalRestrictions || '',
          patient.balanceIssues || false,
          patient.lymphedemaRisk || false
        );

        res.json({ 
          ...patient, 
          prescriptionGenerated: true,
          prescriptionId: aiPrescription.id 
        });
      } catch (prescriptionError) {
        console.error("Error generating prescription:", prescriptionError);
        // Still return patient data even if prescription generation fails
        res.json({ 
          ...patient, 
          prescriptionGenerated: false,
          prescriptionError: "Prescription will be generated manually" 
        });
      }
    } catch (error) {
      console.error("Error creating patient intake:", error);
      res.status(500).json({ message: "Failed to create patient profile" });
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
  
  // AI Exercise Prescription API Endpoints
  app.post('/api/ai-prescriptions/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Use data from request body directly
      const prescriptionInput = {
        userId,
        cancerType: req.body.cancerType || 'general',
        treatmentStage: (req.body.treatmentStage as 'pre-treatment' | 'during-treatment' | 'post-treatment' | 'survivorship') || 'post-treatment',
        medicalClearance: (req.body.medicalClearance as 'cleared' | 'modified' | 'restricted') || 'cleared',
        physicalAssessment: {
          energyLevel: req.body.physicalAssessment?.energyLevel || 5,
          mobilityStatus: req.body.physicalAssessment?.mobilityStatus || 5,
          painLevel: req.body.physicalAssessment?.painLevel || 3,
          strengthLevel: req.body.physicalAssessment?.strengthLevel || 5,
          balanceLevel: req.body.physicalAssessment?.balanceLevel || 5,
          cardiovascularFitness: req.body.physicalAssessment?.cardiovascularFitness || 5
        },
        currentPrograms: req.body.currentPrograms || [],
        progressHistory: req.body.progressHistory || [],
        goals: req.body.goals || [],
        limitations: req.body.limitations || []
      };
      
      // Generate AI prescription
      const aiPrescription = await generateExercisePrescription(prescriptionInput);
      
      // Store prescription in database
      const savedPrescription = await storage.createExercisePrescription({
        userId,
        prescriptionName: aiPrescription.programName,
        tier: aiPrescription.tier,
        duration: aiPrescription.duration,
        frequency: aiPrescription.frequency,
        prescriptionData: JSON.stringify(aiPrescription),
        medicalConsiderations: aiPrescription.medicalNotes.join('; '),
        status: 'active',
        startDate: new Date().toISOString().split('T')[0]
      });
      
      // Store prescription exercises
      const allExercises = [...aiPrescription.exercises, ...aiPrescription.warmup, ...aiPrescription.cooldown];
      for (let i = 0; i < allExercises.length; i++) {
        const exercise = allExercises[i];
        
        // Find matching exercise in database by name
        const exercises = await storage.getAllExercises();
        const matchingExercise = exercises.find(ex => 
          ex.name.toLowerCase().includes(exercise.exerciseName.toLowerCase()) ||
          exercise.exerciseName.toLowerCase().includes(ex.name.toLowerCase())
        );
        
        if (matchingExercise) {
          let exerciseType = 'main';
          if (i < aiPrescription.warmup.length) exerciseType = 'warmup';
          else if (i >= aiPrescription.exercises.length + aiPrescription.warmup.length) exerciseType = 'cooldown';
          
          await storage.createPrescriptionExercise({
            prescriptionId: savedPrescription.id,
            exerciseId: matchingExercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            intensity: exercise.intensity,
            restPeriod: exercise.restPeriod,
            modifications: JSON.stringify(exercise.modifications),
            safetyNotes: JSON.stringify(exercise.safetyNotes),
            progressionTriggers: JSON.stringify(exercise.progressionTriggers),
            exerciseType,
            orderIndex: i
          });
        }
      }
      
      res.json(aiPrescription);
    } catch (error) {
      console.error("Error generating AI prescription:", error);
      res.status(500).json({ message: "Failed to generate AI prescription" });
    }
  });
  
  app.get('/api/ai-prescriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptions = await storage.getExercisePrescriptionsByUser(userId);
      
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching AI prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch AI prescriptions" });
    }
  });
  
  app.get('/api/ai-prescriptions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activePrescription = await storage.getActiveExercisePrescription(userId);
      
      if (!activePrescription) {
        return res.status(404).json({ message: "No active prescription found" });
      }
      
      // Get prescription exercises
      const exercises = await storage.getPrescriptionExercises(activePrescription.id);
      
      res.json({
        prescription: activePrescription,
        exercises
      });
    } catch (error) {
      console.error("Error fetching active AI prescription:", error);
      res.status(500).json({ message: "Failed to fetch active AI prescription" });
    }
  });
  
  app.get('/api/ai-prescriptions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptionId = parseInt(req.params.id);
      
      const prescription = await storage.getExercisePrescription(prescriptionId);
      
      if (!prescription || prescription.userId !== userId) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      const exercises = await storage.getPrescriptionExercises(prescriptionId);
      const progress = await storage.getPrescriptionProgress(prescriptionId);
      
      res.json({
        prescription,
        exercises,
        progress
      });
    } catch (error) {
      console.error("Error fetching AI prescription:", error);
      res.status(500).json({ message: "Failed to fetch AI prescription" });
    }
  });
  
  app.post('/api/ai-prescriptions/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptionId = parseInt(req.params.id);
      
      // Verify prescription belongs to user
      const prescription = await storage.getExercisePrescription(prescriptionId);
      if (!prescription || prescription.userId !== userId) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      const progressData = insertPrescriptionProgressSchema.parse({
        ...req.body,
        prescriptionId
      });
      
      const progress = await storage.createPrescriptionProgress(progressData);
      
      res.json(progress);
    } catch (error) {
      console.error("Error creating prescription progress:", error);
      res.status(500).json({ message: "Failed to create prescription progress" });
    }
  });
  
  app.post('/api/ai-prescriptions/:id/adapt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptionId = parseInt(req.params.id);
      
      // Verify prescription belongs to user
      const prescription = await storage.getExercisePrescription(prescriptionId);
      if (!prescription || prescription.userId !== userId) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      // Get current prescription data and progress
      const progress = await storage.getPrescriptionProgress(prescriptionId);
      const currentPrescriptionData = JSON.parse(prescription.prescriptionData as string);
      
      // Prepare input for adaptation
      const adaptationInput = {
        userId,
        weeklyProgress: progress,
        symptoms: req.body.symptoms || [],
        adherenceRate: req.body.adherenceRate || 100,
        energyLevels: req.body.energyLevels || [],
        painLevels: req.body.painLevels || [],
        userFeedback: req.body.userFeedback || ''
      };
      
      // Generate adapted prescription
      const adaptedPrescription = await adaptPrescriptionBasedOnProgress(
        currentPrescriptionData,
        adaptationInput
      );
      
      // Update prescription with adaptations
      const updatedPrescription = await storage.updateExercisePrescription(prescriptionId, {
        prescriptionData: JSON.stringify(adaptedPrescription),
        adaptationHistory: JSON.stringify([
          ...(prescription.adaptationHistory ? JSON.parse(prescription.adaptationHistory as string) : []),
          {
            date: new Date().toISOString(),
            adaptationInput,
            changes: adaptedPrescription.progressionPlan
          }
        ])
      });
      
      res.json({
        prescription: updatedPrescription,
        adaptations: adaptedPrescription
      });
    } catch (error) {
      console.error("Error adapting AI prescription:", error);
      res.status(500).json({ message: "Failed to adapt AI prescription" });
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

  // Search videos by channel ID (POST endpoint for frontend)
  app.post("/api/youtube/channel", demoAuthMiddleware, async (req, res) => {
    try {
      const { channelId, maxResults = 50 } = req.body;
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "YouTube API key not configured" });
      }

      // First verify the channel exists and get contentDetails for uploads playlist
      const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${apiKey}`;
      const channelInfoResponse = await fetch(channelInfoUrl);
      const channelInfo = await channelInfoResponse.json();
      
      console.log(`POST Channel info for ${channelId}:`, JSON.stringify(channelInfo, null, 2));

      if (!channelInfo.items || channelInfo.items.length === 0) {
        return res.status(404).json({ message: `Channel ${channelId} not found or not accessible` });
      }

      // Since uploads playlist approach isn't working for unlisted videos,
      // try a different approach: search for videos from this specific channel
      console.log(`Attempting channel video search for ${channelId}`);
      
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`;
      const response = await fetch(searchUrl);
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

      // Combine playlist results with video details
      const videos = data.items.map(item => {
        const videoId = item.snippet.resourceId.videoId;
        const details = detailsData.items.find(detail => detail.id === videoId);
        return {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          duration: details ? formatDuration(details.contentDetails.duration) : "Unknown",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: details ? parseInt(details.statistics.viewCount) : 0,
          url: `https://www.youtube.com/watch?v=${videoId}`
        };
      });

      res.json(videos);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      res.status(500).json({ message: "Failed to fetch channel videos" });
    }
  });

  // Search videos by channel ID (GET endpoint for backwards compatibility)
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

      // Search for public videos from this specific channel
      console.log(`Searching videos for channel ${channelId}`);
      
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${apiKey}`;
      const response = await fetch(searchUrl);
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

      // Combine playlist results with video details
      const videos = data.items.map(item => {
        const videoId = item.snippet.resourceId.videoId;
        const details = detailsData.items.find(detail => detail.id === videoId);
        return {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
          duration: details ? formatDuration(details.contentDetails.duration) : "Unknown",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          viewCount: details ? parseInt(details.statistics.viewCount) : 0,
          url: `https://www.youtube.com/watch?v=${videoId}`
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

  // AI Prescription routes
  app.use("/api/ai-prescription", aiPrescriptionRoutes);

  // Enhanced onboarding endpoint
  app.post("/api/onboarding/complete", demoOrAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const onboardingData = req.body;
      
      
      // Calculate tier based on assessment
      const tier = calculateExerciseTier(onboardingData);
      
      // Generate recommendations
      const recommendations = generateRecommendations(onboardingData, tier);
      
      // Save onboarding data
      await storage.saveOnboardingData(userId, onboardingData);
      
      // Check if medical clearance is needed
      const medicalClearanceNeeded = checkMedicalClearanceNeeded(onboardingData);
      
      res.json({
        success: true,
        tier,
        tierDescription: getTierDescription(tier),
        recommendations,
        safetyNotes: generateSafetyNotes(onboardingData),
        medicalClearanceNeeded,
        message: "Onboarding completed successfully"
      });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // Enhanced progress tracking endpoints
  app.get("/api/progress/metrics", demoOrAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { timeframe = "30" } = req.query;
      
      const metrics = await storage.getProgressMetrics(userId, parseInt(timeframe.toString()));
      res.json(metrics);
    } catch (error) {
      console.error("Progress metrics error:", error);
      res.status(500).json({ error: "Failed to fetch progress metrics" });
    }
  });

  app.get("/api/progress/trends", demoOrAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { timeframe = "30" } = req.query;
      
      const trends = await storage.getWorkoutTrends(userId, parseInt(timeframe.toString()));
      res.json(trends);
    } catch (error) {
      console.error("Progress trends error:", error);
      res.status(500).json({ error: "Failed to fetch workout trends" });
    }
  });

  app.get("/api/progress/exercises", demoOrAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { timeframe = "30" } = req.query;
      
      const exerciseProgress = await storage.getExerciseProgress(userId, parseInt(timeframe.toString()));
      res.json(exerciseProgress);
    } catch (error) {
      console.error("Exercise progress error:", error);
      res.status(500).json({ error: "Failed to fetch exercise progress" });
    }
  });

  app.get("/api/progress/health", demoOrAuthMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { timeframe = "30" } = req.query;
      
      const healthMetrics = await storage.getHealthMetrics(userId, parseInt(timeframe.toString()));
      res.json(healthMetrics);
    } catch (error) {
      console.error("Health metrics error:", error);
      res.status(500).json({ error: "Failed to fetch health metrics" });
    }
  });

  // ============================================================================
  // BREAST CANCER PATHWAY v1 - API Routes
  // ============================================================================

  const { BreastCancerPathwayService } = await import("./breast-cancer-pathway");

  // Get current pathway assignment for user
  app.get("/api/pathway/assignment", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const assignment = await BreastCancerPathwayService.getPathwayAssignment(userId);
      if (!assignment) {
        return res.json({ hasPathway: false });
      }
      
      // Refresh stage based on surgery date
      const refreshed = await BreastCancerPathwayService.refreshStageIfNeeded(userId);
      const stageInfo = BreastCancerPathwayService.getStageInfo(refreshed?.pathwayStage || 1);
      
      res.json({
        hasPathway: true,
        assignment: refreshed,
        stageInfo
      });
    } catch (error) {
      console.error("Pathway assignment error:", error);
      res.status(500).json({ error: "Failed to fetch pathway assignment" });
    }
  });

  // Create new pathway assignment (onboarding)
  app.post("/api/pathway/assignment", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const assignment = await BreastCancerPathwayService.createPathwayAssignment({
        userId,
        pathwayId: req.body.pathwayId || "breast_cancer",
        cancerType: req.body.cancerType || "breast",
        surgeryType: req.body.surgeryType,
        axillarySurgery: req.body.axillarySurgery,
        surgeryDate: req.body.surgeryDate,
        currentTreatments: req.body.currentTreatments || [],
        movementReadiness: req.body.movementReadiness,
        shoulderRestriction: req.body.shoulderRestriction || false,
        neuropathy: req.body.neuropathy || false,
        fatigueBaseline: req.body.fatigueBaseline,
        redFlagsChecked: req.body.redFlagsChecked || false,
        hasActiveRedFlags: req.body.hasActiveRedFlags || false
      });
      
      const stageInfo = BreastCancerPathwayService.getStageInfo(assignment.pathwayStage);
      
      res.json({
        success: true,
        assignment,
        stageInfo
      });
    } catch (error) {
      console.error("Create pathway assignment error:", error);
      res.status(500).json({ error: "Failed to create pathway assignment" });
    }
  });

  // Update pathway assignment
  app.patch("/api/pathway/assignment", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const updated = await BreastCancerPathwayService.updatePathwayAssignment(userId, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Pathway assignment not found" });
      }
      
      res.json({ success: true, assignment: updated });
    } catch (error) {
      console.error("Update pathway assignment error:", error);
      res.status(500).json({ error: "Failed to update pathway assignment" });
    }
  });

  // Get today's suggested session
  app.get("/api/pathway/today", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const energyLevel = req.query.energy ? parseInt(req.query.energy.toString()) : undefined;
      const todaySession = await BreastCancerPathwayService.getTodaySession(userId, energyLevel);
      
      if (!todaySession) {
        return res.json({ hasPathway: false });
      }
      
      res.json({
        hasPathway: true,
        ...todaySession
      });
    } catch (error) {
      console.error("Today session error:", error);
      res.status(500).json({ error: "Failed to fetch today's session" });
    }
  });

  // Get session template with exercises
  app.get("/api/pathway/template/:code", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const { code } = req.params;
      
      const template = await BreastCancerPathwayService.getSessionTemplateByCode(code);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const exercises = await BreastCancerPathwayService.getTemplateExercises(template.id);
      
      res.json({
        template,
        exercises
      });
    } catch (error) {
      console.error("Template fetch error:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  // Record session completion
  app.post("/api/pathway/complete", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { 
        templateCode,
        sessionType, 
        durationMinutes, 
        energyLevel, 
        painLevel, 
        painLocation,
        painQuality,
        averageRPE,
        isEasyMode,
        exercisesCompleted,
        exercisesTotal,
        restReason,
        completed,
        skipped,
        note
      } = req.body;
      
      // Record session completion with full telemetry
      // If skipped, don't increment counters (pass sessionType as 'skipped')
      const actualSessionType = skipped ? 'skipped' : sessionType;
      const updated = await BreastCancerPathwayService.recordSessionCompletion(
        userId,
        actualSessionType,
        durationMinutes || 0,
        {
          templateCode,
          averageRPE,
          maxPain: painLevel,
          isEasyMode,
          exercisesCompleted: skipped ? 0 : exercisesCompleted,
          exercisesTotal,
          restReason,
          completed: skipped ? false : completed,
          energyLevel,
          patientNote: note
        }
      );
      
      // Check for coach flags based on energy/pain/RPE
      // Always check if energyLevel is explicitly provided (including 0/1/2)
      const shouldCheckFlags = energyLevel !== undefined || painLevel || (averageRPE && averageRPE >= 8);
      if (shouldCheckFlags) {
        await BreastCancerPathwayService.checkAndCreateFlags(
          userId,
          energyLevel ?? 3, // default to 3 if not provided
          painLevel,
          painLocation
        );
        
        // High RPE triggers additional flag (with deduplication)
        if (averageRPE && averageRPE >= 8) {
          await BreastCancerPathwayService.checkAndCreateHighRPEFlag(
            userId,
            averageRPE,
            templateCode
          );
        }
        
        // Sharp or worrying pain triggers immediate red flag
        if (painQuality && (painQuality === 'sharp' || painQuality === 'worrying')) {
          await BreastCancerPathwayService.checkAndCreatePainQualityFlag(
            userId,
            painQuality,
            painLevel,
            painLocation
          );
        }
      }
      
      // Choose affirming message based on session type and completion status
      let message: string;
      if (sessionType === 'rest') {
        message = "Rest day recorded. Recovery is important!";
      } else if (completed === false) {
        // Stopped early - extra affirming message
        message = "Great job listening to your body! Every bit of movement counts.";
      } else {
        message = "Well done! Your session has been recorded.";
      }
      
      res.json({
        success: true,
        assignment: updated,
        message,
        stoppedEarly: completed === false
      });
    } catch (error) {
      console.error("Session completion error:", error);
      res.status(500).json({ error: "Failed to record session completion" });
    }
  });

  // Get available session templates for a stage
  app.get("/api/pathway/templates", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const { pathwayId, stage, sessionType } = req.query;
      
      const templates = await BreastCancerPathwayService.getSessionTemplatesForStage(
        pathwayId?.toString() || "breast_cancer",
        parseInt(stage?.toString() || "1"),
        sessionType?.toString()
      );
      
      res.json({ templates });
    } catch (error) {
      console.error("Templates fetch error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Get coach flags for user
  app.get("/api/pathway/flags", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const flags = await BreastCancerPathwayService.getUnresolvedFlags(userId);
      res.json({ flags });
    } catch (error) {
      console.error("Coach flags error:", error);
      res.status(500).json({ error: "Failed to fetch coach flags" });
    }
  });

  // Get stage information
  app.get("/api/pathway/stages", async (_req, res) => {
    try {
      const { PATHWAY_STAGES } = await import("./breast-cancer-pathway");
      res.json({ stages: PATHWAY_STAGES });
    } catch (error) {
      console.error("Stages fetch error:", error);
      res.status(500).json({ error: "Failed to fetch stages" });
    }
  });

  // Get all unresolved coach flags (for specialists only)
  app.get("/api/coach/flags", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user is a specialist (demo user allowed in demo mode for testing)
      const demoMode = req.demoMode;
      if (!demoMode) {
        const user = await storage.getUserById(userId);
        if (!user || user.role !== 'specialist') {
          return res.status(403).json({ error: "Access denied. Specialists only." });
        }
      }
      
      const flags = await BreastCancerPathwayService.getAllUnresolvedFlags();
      res.json({ flags });
    } catch (error) {
      console.error("Coach flags fetch error:", error);
      res.status(500).json({ error: "Failed to fetch coach flags" });
    }
  });

  // Resolve a coach flag (specialists only)
  app.post("/api/coach/flags/:id/resolve", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const flagId = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      const { notes } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user is a specialist (demo user allowed in demo mode for testing)
      const demoMode = req.demoMode;
      if (!demoMode) {
        const user = await storage.getUserById(userId);
        if (!user || user.role !== 'specialist') {
          return res.status(403).json({ error: "Access denied. Specialists only." });
        }
      }
      
      await BreastCancerPathwayService.resolveFlag(flagId, userId, notes);
      res.json({ success: true, message: "Flag resolved" });
    } catch (error) {
      console.error("Flag resolution error:", error);
      res.status(500).json({ error: "Failed to resolve flag" });
    }
  });

  // Get patient session history for coach view (includes rest days)
  app.get("/api/coach/patient/:patientId/sessions", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const patientId = req.params.patientId;
      const limit = parseInt(req.query.limit) || 30;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check if user is a specialist or is viewing their own data
      const demoMode = req.demoMode;
      if (!demoMode && patientId !== userId) {
        const user = await storage.getUserById(userId);
        if (!user || user.role !== 'specialist') {
          return res.status(403).json({ error: "Access denied. Specialists only." });
        }
      }
      
      // Fetch session logs from database - order by createdAt to show multiple same-day entries in order
      const logs = await db
        .select()
        .from(pathwaySessionLogs)
        .where(eq(pathwaySessionLogs.userId, patientId))
        .orderBy(desc(pathwaySessionLogs.createdAt))
        .limit(limit);
      
      // Format logs for coach display
      const formattedLogs = logs.map(log => ({
        id: log.id,
        date: log.sessionDate,
        sessionType: log.sessionType,
        templateCode: log.templateCode,
        durationMinutes: log.durationMinutes,
        energyLevel: log.energyLevel,
        painLevel: log.painLevel,
        painQuality: log.painQuality,
        averageRPE: log.averageRPE,
        restReason: log.restReason,
        wasPlannedRest: log.wasPlannedRest,
        exercisesCompleted: log.exercisesCompleted,
        exercisesTotal: log.exercisesTotal,
        isEasyMode: log.isEasyMode,
        completed: log.completed,
        patientNote: log.patientNote,
        coachReviewed: log.coachReviewed,
        coachNotes: log.coachNotes,
        createdAt: log.createdAt
      }));
      
      res.json({ sessions: formattedLogs });
    } catch (error) {
      console.error("Patient sessions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch patient sessions" });
    }
  });

  // ============ TEST MODE API (Development Only) ============
  // These endpoints allow simulating day advancement for 14-day testing
  
  // Get current test mode state
  app.get("/api/test/state", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const state = BreastCancerPathwayService.getTestState(userId);
      const assignment = await BreastCancerPathwayService.getPathwayAssignment(userId);
      
      res.json({
        testMode: true,
        ...state,
        assignment: assignment ? {
          daysSinceSurgery: assignment.daysSinceSurgery,
          pathwayStage: assignment.pathwayStage,
          weekStrengthSessions: assignment.weekStrengthSessions,
          weekWalkMinutes: assignment.weekWalkMinutes,
          weekRestDays: assignment.weekRestDays
        } : null
      });
    } catch (error) {
      console.error("Test state error:", error);
      res.status(500).json({ error: "Failed to get test state" });
    }
  });

  // Advance to next simulated day
  app.post("/api/test/advance-day", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const result = BreastCancerPathwayService.advanceTestDay(userId);
      
      // Refresh stage based on new simulated date
      const assignment = await BreastCancerPathwayService.getPathwayAssignment(userId);
      if (assignment) {
        const newStage = BreastCancerPathwayService.calculateStage(assignment.surgeryDate, userId);
        const newDaysSinceSurgery = BreastCancerPathwayService.getDaysSinceSurgery(assignment.surgeryDate, userId);
        
        await BreastCancerPathwayService.updatePathwayAssignment(userId, {
          pathwayStage: newStage,
          daysSinceSurgery: newDaysSinceSurgery
        });
      }
      
      res.json({
        success: true,
        message: `Advanced to day ${result.dayOffset}`,
        ...result
      });
    } catch (error) {
      console.error("Advance day error:", error);
      res.status(500).json({ error: "Failed to advance day" });
    }
  });

  // Set specific day offset
  app.post("/api/test/set-day", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { dayOffset } = req.body;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      BreastCancerPathwayService.setTestDayOffset(userId, dayOffset || 0);
      
      // Refresh stage based on new simulated date
      const assignment = await BreastCancerPathwayService.getPathwayAssignment(userId);
      if (assignment) {
        const newStage = BreastCancerPathwayService.calculateStage(assignment.surgeryDate, userId);
        const newDaysSinceSurgery = BreastCancerPathwayService.getDaysSinceSurgery(assignment.surgeryDate, userId);
        
        await BreastCancerPathwayService.updatePathwayAssignment(userId, {
          pathwayStage: newStage,
          daysSinceSurgery: newDaysSinceSurgery
        });
      }
      
      const state = BreastCancerPathwayService.getTestState(userId);
      res.json({
        success: true,
        message: `Set day offset to ${dayOffset}`,
        ...state
      });
    } catch (error) {
      console.error("Set day error:", error);
      res.status(500).json({ error: "Failed to set day" });
    }
  });

  // Reset test mode (return to real time)
  app.post("/api/test/reset", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      BreastCancerPathwayService.resetTestMode(userId);
      
      // Also clear all pathway data for fresh test
      await db.delete(coachFlags).where(eq(coachFlags.userId, userId));
      await db.delete(pathwayAssignments).where(eq(pathwayAssignments.userId, userId));
      
      res.json({
        success: true,
        message: "Test mode reset. Pathway data cleared for fresh test."
      });
    } catch (error) {
      console.error("Reset test error:", error);
      res.status(500).json({ error: "Failed to reset test mode" });
    }
  });

  // Get coach dashboard data (session history, trends, flags)
  app.get("/api/coach/dashboard/:patientId", demoOrAuthMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { patientId } = req.params;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      // Get patient's pathway assignment with recent sessions
      const assignment = await BreastCancerPathwayService.getPathwayAssignment(patientId);
      if (!assignment) {
        return res.status(404).json({ error: "Patient pathway not found" });
      }
      
      // Get all flags for this patient
      const flags = await db
        .select()
        .from(coachFlags)
        .where(eq(coachFlags.userId, patientId))
        .orderBy(desc(coachFlags.createdAt));
      
      // Extract recent sessions from coachNotes
      const coachNotes = assignment.coachNotes as any || {};
      const recentSessions = coachNotes.recentSessions || [];
      
      // Calculate trends
      const last14Days = recentSessions.slice(0, 14);
      const energyTrend = last14Days.filter((s: any) => s.energyLevel).map((s: any) => ({
        date: s.date,
        energy: s.energyLevel
      }));
      const painTrend = last14Days.filter((s: any) => s.maxPain !== undefined).map((s: any) => ({
        date: s.date,
        pain: s.maxPain
      }));
      const rpeTrend = last14Days.filter((s: any) => s.averageRPE).map((s: any) => ({
        date: s.date,
        rpe: s.averageRPE
      }));
      
      res.json({
        patient: {
          id: patientId,
          daysSinceSurgery: assignment.daysSinceSurgery,
          pathwayStage: assignment.pathwayStage,
          status: assignment.status
        },
        sessionHistory: recentSessions,
        trends: {
          energy: energyTrend,
          pain: painTrend,
          rpe: rpeTrend
        },
        flags: flags.map(f => ({
          id: f.id,
          type: f.flagType,
          severity: f.severity,
          title: f.title,
          description: f.description,
          resolved: f.resolved,
          createdAt: f.createdAt
        })),
        weekProgress: {
          strengthSessions: assignment.weekStrengthSessions,
          walkMinutes: assignment.weekWalkMinutes,
          restDays: assignment.weekRestDays
        }
      });
    } catch (error) {
      console.error("Coach dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch coach dashboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for onboarding
function calculateExerciseTier(data: any): number {
  const { physicalAssessment, cancerInfo, medicalHistory, parqAssessment } = data;
  
  
  // CRITICAL SAFETY CHECKS - These conditions force Tier 1 (most conservative)
  // Anyone with restricted activities must be Tier 1 - NO EXCEPTIONS
  if (medicalHistory?.medicalClearance === 'restricted') {
    return 1;
  }
  
  // Check for high-risk medical conditions that require Tier 1
  const highRiskConditions = ['Heart Disease', 'High Blood Pressure', 'Diabetes', 'COPD', 'Osteoporosis'];
  if (medicalHistory?.comorbidities?.some((condition: string) => highRiskConditions.includes(condition))) {
    return 1;
  }
  
  // Multiple PAR-Q yes responses indicate high risk - force Tier 1
  const yesCount = Object.values(parqAssessment?.responses || {}).filter(Boolean).length;
  if (yesCount >= 3) {
    return 1;
  }
  
  // High pain levels require conservative approach
  if (physicalAssessment?.painLevel >= 7) {
    return 1;
  }
  
  // Very low energy during treatment requires conservative approach
  if (physicalAssessment?.energyLevel <= 2 && cancerInfo?.treatmentStage === 'during-treatment') {
    return 1;
  }

  // Balance issues or fall risk requires Tier 1 for safety
  if (physicalAssessment?.balanceIssues === true) {
    return 1;
  }

  // Significant physical restrictions require Tier 1
  const physicalRestrictions = medicalHistory?.physicalRestrictions?.toLowerCase() || '';
  const significantRestrictions = [
    'amputat', 'prosthetic', 'wheelchair', 'one leg', 'missing limb',
    'paralyz', 'stroke', 'spinal cord', 'severe arthritis', 'joint replacement',
    'fracture', 'broken bone', 'surgery recent', 'immobilized'
  ];
  
  if (significantRestrictions.some(restriction => physicalRestrictions.includes(restriction))) {
    return 1;
  }
  
  // NOW calculate tier for non-high-risk patients
  let tier = 2; // Base tier for most patients
  
  // Adjust based on energy level
  if (physicalAssessment?.energyLevel <= 3) tier = 1;
  else if (physicalAssessment?.energyLevel >= 8) tier = 3;
  
  // Adjust based on treatment stage
  if (cancerInfo?.treatmentStage === 'during-treatment') tier = Math.min(tier, 2);
  else if (cancerInfo?.treatmentStage === 'pre-treatment') tier = Math.max(tier, 2);
  
  // Adjust based on modified medical clearance
  if (medicalHistory?.medicalClearance === 'modified') tier = Math.min(tier, 2);
  
  // Single PAR-Q yes response limits to Tier 2 max
  if (yesCount >= 1) tier = Math.min(tier, 2);
  
  // Moderate pain levels limit to Tier 2
  if (physicalAssessment?.painLevel >= 5) tier = Math.min(tier, 2);
  
  return Math.max(1, Math.min(4, tier));
}

function getTierDescription(tier: number): string {
  switch (tier) {
    case 1: return "Gentle Start - Conservative approach with focus on safety";
    case 2: return "Building Foundation - Gradual progression with moderate activity";
    case 3: return "Moderate Intensity - Structured program with regular challenges";
    case 4: return "Advanced Training - Comprehensive program for active individuals";
    default: return "Unknown tier";
  }
}

function generateRecommendations(data: any, tier: number): string[] {
  const recommendations = [];
  
  // Base recommendations by tier
  switch (tier) {
    case 1:
      recommendations.push("Start with gentle walking for 5-10 minutes");
      recommendations.push("Chair-based exercises for strength building");
      recommendations.push("Simple stretching and flexibility work");
      break;
    case 2:
      recommendations.push("Walking 15-20 minutes, 3-4 times per week");
      recommendations.push("Light strength training with resistance bands");
      recommendations.push("Balance and coordination exercises");
      break;
    case 3:
      recommendations.push("Moderate cardio 30 minutes, 4-5 times per week");
      recommendations.push("Strength training 2-3 times per week");
      recommendations.push("Flexibility and mobility work daily");
      break;
    case 4:
      recommendations.push("Vigorous cardio 45 minutes, 5-6 times per week");
      recommendations.push("Comprehensive strength training 3-4 times per week");
      recommendations.push("Sport-specific or advanced movement patterns");
      break;
  }
  
  // Add cancer-specific recommendations
  if (data.cancerInfo?.cancerType === 'Breast Cancer') {
    recommendations.push("Avoid overhead movements initially");
    recommendations.push("Focus on lymphatic drainage exercises");
  }
  
  if (data.physicalAssessment?.lymphedemaRisk) {
    recommendations.push("Monitor for swelling during exercise");
    recommendations.push("Use compression garments as recommended");
  }
  
  return recommendations;
}

function generateSafetyNotes(data: any): string[] {
  const notes = [];
  
  // General safety notes
  notes.push("Listen to your body and rest when needed");
  notes.push("Stay hydrated throughout exercise");
  notes.push("Stop immediately if you feel chest pain or dizziness");
  
  // Treatment-specific notes
  if (data.cancerInfo?.treatmentStage === 'during-treatment') {
    notes.push("Exercise on days when you feel most energetic");
    notes.push("Avoid exercise on chemotherapy days");
  }
  
  // Pain-specific notes
  if (data.physicalAssessment?.painLevel >= 5) {
    notes.push("Modify exercises if pain increases");
    notes.push("Use heat/cold therapy as needed");
  }
  
  // Balance-specific notes
  if (data.physicalAssessment?.balanceIssues) {
    notes.push("Exercise near a wall or chair for support");
    notes.push("Avoid exercises that challenge balance initially");
  }
  
  return notes;
}

function checkMedicalClearanceNeeded(data: any): boolean {
  // Check PAR-Q responses - any YES answer requires clearance
  const yesCount = Object.values(data.parqAssessment?.responses || {}).filter(Boolean).length;
  if (yesCount >= 1) return true;
  
  // Check medical clearance status - anything other than "cleared" requires review
  if (data.medicalHistory?.medicalClearance === 'restricted') return true;
  if (data.medicalHistory?.medicalClearance === 'modified') return true;
  
  // Check high-risk conditions that require medical supervision
  const highRiskConditions = ['Heart Disease', 'High Blood Pressure', 'Diabetes', 'COPD', 'Osteoporosis'];
  if (data.medicalHistory?.comorbidities?.some((condition: string) => highRiskConditions.includes(condition))) {
    return true;
  }
  
  // Check high pain levels that indicate need for medical input
  if (data.physicalAssessment?.painLevel >= 7) return true;
  
  // Check very low energy levels during treatment
  if (data.physicalAssessment?.energyLevel <= 2 && data.cancerInfo?.treatmentStage === 'during-treatment') {
    return true;
  }
  
  // Check for lymphedema risk with restricted activities
  if (data.physicalAssessment?.lymphedemaRisk && data.medicalHistory?.medicalClearance !== 'cleared') {
    return true;
  }
  
  return false;
}
