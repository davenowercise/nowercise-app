import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { generateExercisePrescription, adaptPrescriptionBasedOnProgress } from '../ai-prescription';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Zod schemas for validation
const prescriptionInputSchema = z.object({
  cancerType: z.string().min(1, "Cancer type is required"),
  treatmentStage: z.enum(['pre-treatment', 'during-treatment', 'post-treatment', 'survivorship']),
  medicalClearance: z.enum(['cleared', 'modified', 'restricted']),
  physicalAssessment: z.object({
    energyLevel: z.number().min(1).max(10),
    mobilityStatus: z.number().min(1).max(10),
    painLevel: z.number().min(1).max(10),
    strengthLevel: z.number().min(1).max(10).optional(),
    balanceLevel: z.number().min(1).max(10).optional(),
    cardiovascularFitness: z.number().min(1).max(10).optional()
  }),
  goals: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional()
});

const progressUpdateSchema = z.object({
  prescriptionId: z.number(),
  workoutLogs: z.array(z.object({
    exerciseId: z.number(),
    completed: z.boolean(),
    reps: z.number(),
    sets: z.number(),
    rpe: z.number(),
    painLevel: z.number(),
    notes: z.string().optional()
  })),
  overallFeedback: z.object({
    energyLevel: z.number().min(1).max(10),
    fatigueLevel: z.number().min(1).max(10),
    painLevel: z.number().min(1).max(10),
    enjoymentLevel: z.number().min(1).max(10),
    difficultyLevel: z.number().min(1).max(10),
    feedback: z.string().optional()
  })
});

// Generate new exercise prescription
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedInput = prescriptionInputSchema.parse(req.body);
    
    // Get user's previous prescriptions and progress
    const user = await storage.getUser(userId);
    const previousPrescriptions = await storage.getUserPrescriptions(userId);
    const progressHistory = await storage.getProgressHistory(userId);

    const prescriptionInput = {
      userId,
      ...validatedInput,
      currentPrograms: previousPrescriptions,
      progressHistory
    };

    // Generate AI prescription
    const prescription = await generateExercisePrescription(prescriptionInput);
    
    // Save prescription to database
    const savedPrescription = await storage.savePrescription(userId, prescription);
    
    // Log prescription generation
    console.log(`Generated prescription for user ${userId}:`, {
      programName: prescription.programName,
      tier: prescription.tier,
      exerciseCount: prescription.exercises.length,
      duration: prescription.duration
    });

    res.json({
      success: true,
      prescription: savedPrescription,
      message: 'Exercise prescription generated successfully'
    });

  } catch (error) {
    console.error('Error generating prescription:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to generate prescription',
      details: error.message
    });
  }
});

// Update prescription based on progress
router.post('/adapt', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedInput = progressUpdateSchema.parse(req.body);
    
    // Get current prescription
    const currentPrescription = await storage.getPrescription(validatedInput.prescriptionId);
    if (!currentPrescription || currentPrescription.userId !== userId) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Generate adapted prescription
    const adaptedPrescription = await adaptPrescriptionBasedOnProgress(
      currentPrescription,
      validatedInput.workoutLogs,
      validatedInput.overallFeedback
    );

    // Save adapted prescription
    const savedPrescription = await storage.savePrescription(userId, adaptedPrescription);
    
    // Log adaptation
    console.log(`Adapted prescription for user ${userId}:`, {
      originalTier: currentPrescription.tier,
      newTier: adaptedPrescription.tier,
      changes: adaptedPrescription.adaptationNotes
    });

    res.json({
      success: true,
      prescription: savedPrescription,
      changes: adaptedPrescription.adaptationNotes,
      message: 'Prescription adapted successfully'
    });

  } catch (error) {
    console.error('Error adapting prescription:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to adapt prescription',
      details: error.message
    });
  }
});

// Get user's current prescription
router.get('/current', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const currentPrescription = await storage.getCurrentPrescription(userId);
    
    if (!currentPrescription) {
      return res.status(404).json({ 
        error: 'No current prescription found',
        message: 'Please complete the assessment to get your personalized exercise prescription'
      });
    }

    res.json({
      success: true,
      prescription: currentPrescription
    });

  } catch (error) {
    console.error('Error fetching current prescription:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prescription',
      details: error.message
    });
  }
});

// Get prescription history
router.get('/history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const prescriptions = await storage.getUserPrescriptions(userId);
    
    res.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p.id,
        programName: p.programName,
        tier: p.tier,
        createdAt: p.createdAt,
        status: p.status,
        duration: p.duration,
        exerciseCount: p.exercises.length
      }))
    });

  } catch (error) {
    console.error('Error fetching prescription history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prescription history',
      details: error.message
    });
  }
});

export default router;