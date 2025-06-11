import { storage } from './storage';
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface ExercisePrescriptionInput {
  userId: string;
  cancerType: string;
  treatmentStage: 'pre-treatment' | 'during-treatment' | 'post-treatment' | 'survivorship';
  medicalClearance: 'cleared' | 'modified' | 'restricted';
  physicalAssessment: {
    energyLevel: number; // 1-10
    mobilityStatus: number; // 1-10
    painLevel: number; // 1-10
    strengthLevel?: number; // 1-10
    balanceLevel?: number; // 1-10
    cardiovascularFitness?: number; // 1-10
  };
  currentPrograms?: any[];
  progressHistory?: any[];
  goals?: string[];
  limitations?: string[];
}

export interface PrescribedExercise {
  exerciseId: number;
  exerciseName: string;
  sets: number;
  reps: string; // e.g., "8-12" or "30 seconds"
  intensity: 'low' | 'moderate' | 'vigorous';
  restPeriod: string;
  modifications: string[];
  safetyNotes: string[];
  progressionTriggers: string[];
}

export interface ExercisePrescription {
  programName: string;
  duration: number; // weeks
  frequency: number; // sessions per week
  tier: 1 | 2 | 3 | 4;
  exercises: PrescribedExercise[];
  warmup: PrescribedExercise[];
  cooldown: PrescribedExercise[];
  progressionPlan: {
    week: number;
    modifications: string[];
  }[];
  safetyGuidelines: string[];
  medicalNotes: string[];
  reviewSchedule: string[];
}

// ACSM Guidelines for Cancer Patients
export const ACSM_GUIDELINES = {
  tier1: {
    description: "Just starting or significant limitations",
    aerobic: { frequency: "2-3 days/week", intensity: "40-60% HRmax", duration: "10-15 minutes" },
    resistance: { frequency: "2 days/week", intensity: "40-60% 1RM", sets: "1-2", reps: "8-15" },
    flexibility: { frequency: "2-3 days/week", duration: "10-30 seconds per stretch" }
  },
  tier2: {
    description: "Building foundation with moderate activity",
    aerobic: { frequency: "3-4 days/week", intensity: "50-70% HRmax", duration: "15-30 minutes" },
    resistance: { frequency: "2-3 days/week", intensity: "60-75% 1RM", sets: "2-3", reps: "8-12" },
    flexibility: { frequency: "3-4 days/week", duration: "15-30 seconds per stretch" }
  },
  tier3: {
    description: "Moderate intensity with good tolerance",
    aerobic: { frequency: "4-5 days/week", intensity: "60-80% HRmax", duration: "20-45 minutes" },
    resistance: { frequency: "3 days/week", intensity: "70-85% 1RM", sets: "2-4", reps: "6-12" },
    flexibility: { frequency: "4-5 days/week", duration: "15-30 seconds per stretch" }
  },
  tier4: {
    description: "High performance and sport-specific training",
    aerobic: { frequency: "5-6 days/week", intensity: "70-90% HRmax", duration: "30-60 minutes" },
    resistance: { frequency: "3-4 days/week", intensity: "80-95% 1RM", sets: "3-5", reps: "4-8" },
    flexibility: { frequency: "5-6 days/week", duration: "15-30 seconds per stretch" }
  }
};

// Cancer-specific exercise considerations
export const CANCER_SPECIFIC_GUIDELINES = {
  'breast': {
    precautions: ['Avoid overhead movements if lymphedema risk', 'Monitor surgical site'],
    recommended: ['Upper body strengthening', 'Range of motion exercises', 'Lymphatic drainage'],
    contraindications: ['Heavy lifting initially', 'Excessive arm elevation']
  },
  'prostate': {
    precautions: ['Monitor fatigue from hormone therapy', 'Bone health considerations'],
    recommended: ['Pelvic floor exercises', 'Bone-loading activities', 'Cardiovascular training'],
    contraindications: ['High-impact activities if bone metastases']
  },
  'colorectal': {
    precautions: ['Ostomy considerations', 'Dehydration risk'],
    recommended: ['Core strengthening', 'Walking program', 'Flexibility training'],
    contraindications: ['Excessive abdominal pressure']
  },
  'lung': {
    precautions: ['Respiratory function monitoring', 'Oxygen saturation tracking'],
    recommended: ['Breathing exercises', 'Low-impact cardio', 'Upper body strength'],
    contraindications: ['High-intensity aerobic if severe dysfunction']
  },
  'hematologic': {
    precautions: ['Infection risk', 'Bleeding precautions', 'Fatigue management'],
    recommended: ['Gentle resistance training', 'Walking', 'Balance exercises'],
    contraindications: ['Contact sports', 'High-intensity exercise during active treatment']
  }
};

export async function generateExercisePrescription(input: ExercisePrescriptionInput): Promise<ExercisePrescription> {
  try {
    // Get available exercises from database
    const exercises = await storage.getExercises();
    
    // Determine appropriate tier based on assessment
    const tier = calculateTier(input.physicalAssessment, input.treatmentStage, input.medicalClearance);
    
    // Get cancer-specific guidelines
    const cancerGuidelines = CANCER_SPECIFIC_GUIDELINES[input.cancerType.toLowerCase() as keyof typeof CANCER_SPECIFIC_GUIDELINES] || {
      precautions: ['Monitor general cancer symptoms'],
      recommended: ['Moderate exercise as tolerated'],
      contraindications: ['Avoid if severe symptoms present']
    };
    
    // Create AI prompt for intelligent exercise selection
    const prompt = createPrescriptionPrompt(input, tier, exercises, cancerGuidelines);
    
    // Generate AI-powered prescription
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: `You are an expert exercise physiologist and oncology rehabilitation specialist. Create evidence-based exercise prescriptions following ACSM guidelines for cancer patients. Always prioritize safety and individualization.`
    });
    
    // Parse AI response into structured prescription
    const prescriptionText = aiResponse.content[0].text;
    const prescription = parseAIPrescription(prescriptionText, tier, exercises);
    
    // Store prescription in database
    await storage.createExercisePrescription({
      userId: input.userId,
      prescriptionData: prescription,
      tier,
      createdByAI: true,
      medicalConsiderations: cancerGuidelines.precautions.join('; ')
    });
    
    return prescription;
    
  } catch (error) {
    console.error('Error generating exercise prescription:', error);
    throw new Error('Failed to generate personalized exercise prescription');
  }
}

function calculateTier(assessment: ExercisePrescriptionInput['physicalAssessment'], treatmentStage: string, clearance: string): 1 | 2 | 3 | 4 {
  let score = 0;
  
  // Base scores from physical assessment
  score += (assessment.energyLevel || 5) * 0.3;
  score += (assessment.mobilityStatus || 5) * 0.25;
  score += (10 - (assessment.painLevel || 5)) * 0.2; // Lower pain = higher score
  score += (assessment.strengthLevel || 5) * 0.15;
  score += (assessment.cardiovascularFitness || 5) * 0.1;
  
  // Treatment stage adjustments
  const stageAdjustments = {
    'pre-treatment': 0,
    'during-treatment': -2,
    'post-treatment': -1,
    'survivorship': 1
  };
  score += stageAdjustments[treatmentStage as keyof typeof stageAdjustments] || 0;
  
  // Medical clearance adjustments
  const clearanceAdjustments = {
    'cleared': 1,
    'modified': 0,
    'restricted': -2
  };
  score += clearanceAdjustments[clearance as keyof typeof clearanceAdjustments] || 0;
  
  // Convert to tier (1-4)
  if (score <= 3) return 1;
  if (score <= 5.5) return 2;
  if (score <= 7.5) return 3;
  return 4;
}

function createPrescriptionPrompt(
  input: ExercisePrescriptionInput,
  tier: number,
  exercises: any[],
  cancerGuidelines: any
): string {
  return `
Create a personalized exercise prescription for a ${input.cancerType} cancer patient.

PATIENT PROFILE:
- Cancer Type: ${input.cancerType}
- Treatment Stage: ${input.treatmentStage}
- Medical Clearance: ${input.medicalClearance}
- Calculated Tier: ${tier}

PHYSICAL ASSESSMENT:
- Energy Level: ${input.physicalAssessment.energyLevel}/10
- Mobility: ${input.physicalAssessment.mobilityStatus}/10
- Pain Level: ${input.painLevel}/10
- Strength: ${input.physicalAssessment.strengthLevel || 'Not assessed'}/10
- Balance: ${input.physicalAssessment.balanceLevel || 'Not assessed'}/10
- Cardiovascular Fitness: ${input.physicalAssessment.cardiovascularFitness || 'Not assessed'}/10

ACSM GUIDELINES FOR TIER ${tier}:
${JSON.stringify(ACSM_GUIDELINES[`tier${tier}` as keyof typeof ACSM_GUIDELINES], null, 2)}

CANCER-SPECIFIC CONSIDERATIONS:
- Precautions: ${cancerGuidelines.precautions.join(', ')}
- Recommended: ${cancerGuidelines.recommended.join(', ')}
- Contraindications: ${cancerGuidelines.contraindications.join(', ')}

AVAILABLE EXERCISES:
${exercises.map(ex => `- ${ex.name} (ID: ${ex.id}, Tier: ${ex.tier}, Type: ${ex.type})`).join('\n')}

GOALS: ${input.goals?.join(', ') || 'General fitness and wellbeing'}
LIMITATIONS: ${input.limitations?.join(', ') || 'None specified'}

Please create a comprehensive exercise prescription in JSON format with:
1. Program name and duration
2. Selected exercises with specific sets, reps, intensity
3. Warmup and cooldown routines
4. Progressive plan over 4-8 weeks
5. Safety guidelines specific to this patient
6. Medical notes for healthcare providers
7. Review schedule recommendations

Ensure all exercises are appropriate for the calculated tier and cancer type. Prioritize safety and gradual progression.
`;
}

function parseAIPrescription(aiResponse: string, tier: number, exercises: any[]): ExercisePrescription {
  try {
    // Extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        tier,
        ...parsed,
        // Ensure exercises have valid IDs from our database
        exercises: parsed.exercises?.map((ex: any) => ({
          ...ex,
          exerciseId: exercises.find(e => e.name.toLowerCase().includes(ex.exerciseName.toLowerCase()))?.id || exercises[0]?.id
        })) || []
      };
    }
  } catch (error) {
    console.error('Error parsing AI prescription:', error);
  }
  
  // Fallback to structured prescription based on tier
  return createFallbackPrescription(tier, exercises);
}

function createFallbackPrescription(tier: number, exercises: any[]): ExercisePrescription {
  const tierExercises = exercises.filter(ex => ex.tier <= tier);
  const guidelines = ACSM_GUIDELINES[`tier${tier}` as keyof typeof ACSM_GUIDELINES];
  
  return {
    programName: `Tier ${tier} Cancer Recovery Program`,
    duration: 8,
    frequency: tier <= 2 ? 2 : 3,
    tier: tier as 1 | 2 | 3 | 4,
    exercises: tierExercises.slice(0, 6).map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: tier <= 2 ? 1 : 2,
      reps: guidelines.resistance.reps,
      intensity: tier <= 2 ? 'low' : 'moderate',
      restPeriod: '60-90 seconds',
      modifications: ['Progress as tolerated', 'Stop if experiencing pain or fatigue'],
      safetyNotes: ['Monitor heart rate', 'Stay hydrated'],
      progressionTriggers: ['Complete all sets without excessive fatigue', 'No adverse symptoms for 1 week']
    })),
    warmup: [
      {
        exerciseId: 0,
        exerciseName: 'Gentle Walking',
        sets: 1,
        reps: '5-10 minutes',
        intensity: 'low',
        restPeriod: 'None',
        modifications: ['Adjust pace as needed'],
        safetyNotes: ['Monitor breathing'],
        progressionTriggers: []
      }
    ],
    cooldown: [
      {
        exerciseId: 0,
        exerciseName: 'Gentle Stretching',
        sets: 1,
        reps: '10-15 minutes',
        intensity: 'low',
        restPeriod: 'None',
        modifications: ['Hold stretches comfortably'],
        safetyNotes: ['Never force stretches'],
        progressionTriggers: []
      }
    ],
    progressionPlan: [
      { week: 1, modifications: ['Focus on form and adaptation'] },
      { week: 3, modifications: ['Increase duration by 10-20%'] },
      { week: 5, modifications: ['Consider adding 1 additional set'] },
      { week: 7, modifications: ['Prepare for tier progression assessment'] }
    ],
    safetyGuidelines: [
      'Stop exercise if experiencing chest pain, excessive fatigue, or dizziness',
      'Monitor heart rate and stay within prescribed zones',
      'Report any adverse symptoms to healthcare team',
      'Maintain adequate hydration',
      'Get adequate rest between sessions'
    ],
    medicalNotes: [
      `Prescription based on Tier ${tier} ACSM guidelines`,
      'Patient should be monitored for treatment-related side effects',
      'Regular reassessment recommended every 4-6 weeks',
      'Coordinate with oncology team for any modifications'
    ],
    reviewSchedule: [
      'Week 2: Initial tolerance assessment',
      'Week 4: Mid-program evaluation',
      'Week 6: Progress review and adjustments',
      'Week 8: Program completion and next phase planning'
    ]
  };
}

// Additional AI functions for program adaptation
export async function adaptPrescriptionBasedOnProgress(
  userId: string,
  currentPrescription: ExercisePrescription,
  progressData: any
): Promise<ExercisePrescription> {
  // AI-powered program adaptation based on progress
  const prompt = `
  Analyze this patient's progress and adapt their exercise prescription:
  
  CURRENT PRESCRIPTION: ${JSON.stringify(currentPrescription, null, 2)}
  
  PROGRESS DATA: ${JSON.stringify(progressData, null, 2)}
  
  Provide adaptations for:
  1. Exercise intensity adjustments
  2. Volume modifications
  3. New exercise additions
  4. Safety considerations
  5. Progression timeline
  `;
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    system: 'You are an exercise physiologist specializing in cancer rehabilitation. Adapt exercise prescriptions based on patient progress data.'
  });
  
  // Parse and apply adaptations
  return parseAdaptations(response.content[0].text, currentPrescription);
}

function parseAdaptations(aiResponse: string, currentPrescription: ExercisePrescription): ExercisePrescription {
  // Implementation for parsing AI adaptations and updating prescription
  // This would include logic to safely modify the current prescription
  return currentPrescription; // Placeholder
}