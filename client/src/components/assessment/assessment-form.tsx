import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Heart, 
  Info, 
  Save 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the step names and schema separately for each step
const steps = [
  {
    id: 'safety',
    name: 'Safety Check',
    description: 'Before we begin, let\'s check if exercise is safe for you right now'
  },
  {
    id: 'personal',
    name: 'Personal Details',
    description: 'Tell us a bit about yourself'
  },
  {
    id: 'medical',
    name: 'Medical Background',
    description: 'Information about your cancer type and treatment'
  },
  {
    id: 'physical',
    name: 'Physical Assessment',
    description: 'Your current energy levels and physical capabilities'
  },
  {
    id: 'preferences',
    name: 'Exercise Preferences',
    description: 'What types of movement you enjoy or want to avoid'
  },
  {
    id: 'environment',
    name: 'Exercise Environment',
    description: "Where and how you'll be exercising"
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Review your information before submission'
  }
];

// Schema for Step 1: Safety Check
const safetyCheckSchema = z.object({
  safetyConcerns: z.array(z.string()).optional(),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must confirm to continue',
  }),
});

// Schema for Step 2: Personal Details
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, { message: 'Name is required' }),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, { 
    message: 'Date must be in DD/MM/YYYY format' 
  }),
  gender: z.string().optional(),
});

// Schema for Step 3: Medical Background
const medicalBackgroundSchema = z.object({
  cancerType: z.string().min(1, { message: 'Cancer type is required' }),
  treatmentStage: z.string().min(1, { message: 'Treatment stage is required' }),
  treatmentsReceived: z.array(z.string()).optional(),
  lymphoedemaRisk: z.boolean().optional(),
  comorbidities: z.array(z.string()).optional(),
  medicationEffects: z.array(z.string()).optional(),
  sideEffects: z.string().optional(),
});

// Schema for Step 4: Physical Assessment
const physicalAssessmentSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  mobilityStatus: z.string().min(1),
  painLevel: z.number().min(0).max(10),
  physicalRestrictions: z.array(z.string()).optional(),
  priorInjuries: z.array(z.string()).optional(),
  confidenceLevel: z.string(),
});

// Schema for Step 5: Exercise Preferences
const exercisePreferencesSchema = z.object({
  priorFitnessLevel: z.string(),
  exercisePreferences: z.array(z.string()).optional(),
  exerciseDislikes: z.array(z.string()).optional(),
  weeklyExerciseGoal: z.string(),
  timePerSession: z.number().min(5).max(60),
});

// Schema for Step 6: Exercise Environment
const environmentSchema = z.object({
  location: z.string(),
  equipmentAvailable: z.array(z.string()).optional(),
  sessionFormatPreference: z.array(z.string()).optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
});

// Combined schema for the entire form
const formSchema = z.object({
  safety: safetyCheckSchema,
  personal: personalDetailsSchema,
  medical: medicalBackgroundSchema,
  physical: physicalAssessmentSchema,
  preferences: exercisePreferencesSchema,
  environment: environmentSchema,
});

type FormData = z.infer<typeof formSchema>;

export function PatientAssessmentForm() {
  const [step, setStep] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Create a form with default values
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      safety: {
        safetyConcerns: [],
        consent: false,
      },
      personal: {
        fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        dateOfBirth: '',
        gender: '',
      },
      medical: {
        cancerType: '',
        treatmentStage: '',
        treatmentsReceived: [],
        lymphoedemaRisk: false,
        comorbidities: [],
        medicationEffects: [],
        sideEffects: '',
      },
      physical: {
        energyLevel: 5,
        mobilityStatus: '',
        painLevel: 0,
        physicalRestrictions: [],
        priorInjuries: [],
        confidenceLevel: '',
      },
      preferences: {
        priorFitnessLevel: '',
        exercisePreferences: [],
        exerciseDislikes: [],
        weeklyExerciseGoal: '',
        timePerSession: 15,
      },
      environment: {
        location: '',
        equipmentAvailable: [],
        sessionFormatPreference: [],
        accessibilityNeeds: [],
      },
    },
  });

  // Check if there are any safety concerns that would prevent exercise
  const hasCriticalSafetyConcerns = () => {
    const concerns = form.watch('safety.safetyConcerns') || [];
    const criticalConcerns = [
      'DoctorAdvisedNoExercise',
      'ChestPainOrDizziness',
      'RecentSurgery',
      'UnsureSafety'
    ];
    return concerns.some(concern => criticalConcerns.includes(concern));
  };

  const nextStep = () => {
    // For the safety step, validate and check for critical concerns
    if (step === 0) {
      form.trigger('safety').then(isValid => {
        if (isValid) {
          if (hasCriticalSafetyConcerns()) {
            // Show a warning, but still allow proceeding
            toast({
              title: "Exercise Safety Alert",
              description: "Based on your responses, we recommend consulting with your healthcare provider before starting. You can continue filling out the assessment, but please discuss with your doctor.",
              variant: "destructive"
            });
          }
          setStep(prev => prev + 1);
        }
      });
    } else {
      // For other steps, validate the current section before proceeding
      const currentStepId = steps[step].id;
      form.trigger(currentStepId as any).then(isValid => {
        if (isValid) {
          setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
      });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Map form data to the structure expected by our API/database
      const assessmentData = {
        userId: user?.id,
        // Personal details
        age: calculateAge(data.personal.dateOfBirth),
        gender: data.personal.gender,
        
        // Medical background
        cancerType: data.medical.cancerType,
        treatmentStage: data.medical.treatmentStage,
        treatmentsReceived: data.medical.treatmentsReceived,
        lymphoedemaRisk: data.medical.lymphoedemaRisk,
        comorbidities: data.medical.comorbidities,
        medicationEffects: data.medical.medicationEffects,
        
        // Physical function
        energyLevel: data.physical.energyLevel,
        mobilityStatus: data.physical.mobilityStatus,
        painLevel: data.physical.painLevel,
        physicalRestrictions: data.physical.physicalRestrictions,
        priorInjuries: data.physical.priorInjuries,
        confidenceLevel: data.physical.confidenceLevel,
        
        // Fitness history
        priorFitnessLevel: data.preferences.priorFitnessLevel,
        exercisePreferences: data.preferences.exercisePreferences,
        exerciseDislikes: data.preferences.exerciseDislikes,
        weeklyExerciseGoal: data.preferences.weeklyExerciseGoal,
        timePerSession: data.preferences.timePerSession,
        
        // Environment
        location: data.environment.location,
        equipmentAvailable: data.environment.equipmentAvailable,
        sessionFormatPreference: data.environment.sessionFormatPreference,
        accessibilityNeeds: data.environment.accessibilityNeeds,
      };
      
      // Submit the assessment
      await apiRequest('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(assessmentData),
      });
      
      toast({
        title: "Assessment Submitted",
        description: "Your assessment has been recorded. We're generating personalized exercise recommendations for you.",
      });
      
      // Navigate to recommendations page
      navigate('/recommendations');
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to calculate age from DD/MM/YYYY format
  const calculateAge = (dateString: string) => {
    if (!dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return null;
    }
    
    const [day, month, year] = dateString.split('/').map(Number);
    const dob = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  // Render the current step based on the step index
  const renderStep = () => {
    const currentStep = steps[step];
    
    switch (currentStep.id) {
      case 'safety':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Safety Check</AlertTitle>
              <AlertDescription>
                Before we recommend exercises, we need to make sure they're safe for you. Please check any that apply:
              </AlertDescription>
            </Alert>
            
            <FormField
              control={form.control}
              name="safety.safetyConcerns"
              render={() => (
                <FormItem>
                  <div className="space-y-3 mt-4">
                    {[
                      { id: 'DoctorAdvisedNoExercise', label: 'A doctor has advised me not to exercise' },
                      { id: 'ChestPainOrDizziness', label: 'I have chest pain or dizziness during activity' },
                      { id: 'BalanceIssues', label: 'I have balance issues or a history of falls' },
                      { id: 'RecentSurgery', label: 'I'm recovering from surgery and haven't been cleared to exercise yet' },
                      { id: 'MovementRestrictions', label: 'I've been told to avoid specific movements' },
                      { id: 'Lymphoedema', label: 'I experience swelling or lymphoedema' },
                      { id: 'UnsureSafety', label: 'I'm unsure if exercise is safe for me right now' },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="safety.safetyConcerns"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="safety.consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I confirm the above information is accurate and understand I may be advised to check with my healthcare provider before starting exercises.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'personal':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="personal.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="personal.dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input placeholder="DD/MM/YYYY" {...field} />
                  </FormControl>
                  <FormDescription>
                    Example: 25/12/1980
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="personal.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'medical':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="medical.cancerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Cancer</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Breast, Prostate, Colorectal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medical.treatmentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pre-treatment">About to start treatment</SelectItem>
                      <SelectItem value="during-treatment">Currently in treatment</SelectItem>
                      <SelectItem value="post-treatment">Recently finished treatment</SelectItem>
                      <SelectItem value="recovery">In recovery/rehabilitation</SelectItem>
                      <SelectItem value="remission">In remission</SelectItem>
                      <SelectItem value="living-with">Living with cancer long-term</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medical.treatmentsReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatments Received (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'surgery', label: 'Surgery' },
                      { id: 'chemotherapy', label: 'Chemotherapy' },
                      { id: 'radiation', label: 'Radiation/Radiotherapy' },
                      { id: 'hormone-therapy', label: 'Hormone Therapy' },
                      { id: 'immunotherapy', label: 'Immunotherapy' },
                      { id: 'targeted-therapy', label: 'Targeted Therapy' },
                      { id: 'stem-cell-transplant', label: 'Stem Cell Transplant' },
                      { id: 'other', label: 'Other' },
                      { id: 'none', label: 'None' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medical.lymphoedemaRisk"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I have lymphoedema or have been told I'm at risk
                    </FormLabel>
                    <FormDescription>
                      Lymphoedema is swelling in the body's tissues, often in the arms or legs
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="medical.sideEffects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Side Effects or Limitations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., fatigue, neuropathy, pain, limited range of motion..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps us tailor exercises to your specific needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'physical':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="physical.energyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Energy Level (1-10)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        defaultValue={[field.value || 5]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1: Very low energy</span>
                        <span>5: Moderate energy</span>
                        <span>10: High energy</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current value: {field.value}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="physical.mobilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobility Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current mobility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fully-mobile">Fully mobile without restrictions</SelectItem>
                      <SelectItem value="mostly-mobile">Mostly mobile with some limitations</SelectItem>
                      <SelectItem value="mobile-with-assistance">Mobile with assistance (walking aid)</SelectItem>
                      <SelectItem value="seated-and-standing">Can do both seated and standing exercises</SelectItem>
                      <SelectItem value="seated-only">Prefer seated exercises only</SelectItem>
                      <SelectItem value="bed-based">Primarily bed-based</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="physical.painLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Pain Level (0-10)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        defaultValue={[field.value || 0]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0: No pain</span>
                        <span>5: Moderate pain</span>
                        <span>10: Severe pain</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current value: {field.value}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="physical.physicalRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Restrictions (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'no-overhead-movement', label: 'No overhead movements' },
                      { id: 'no-heavy-lifting', label: 'No heavy lifting' },
                      { id: 'limited-balance', label: 'Limited balance' },
                      { id: 'limited-arm-movement', label: 'Limited arm movement' },
                      { id: 'limited-leg-movement', label: 'Limited leg movement' },
                      { id: 'avoid-high-impact', label: 'Avoid high-impact activities' },
                      { id: 'avoid-twisting', label: 'Avoid twisting movements' },
                      { id: 'none', label: 'No restrictions' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="physical.confidenceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence in Movement</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select confidence level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="very-confident">Very confident</SelectItem>
                      <SelectItem value="somewhat-confident">Somewhat confident</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="somewhat-unconfident">A little unsure</SelectItem>
                      <SelectItem value="not-confident">Not confident at all</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'preferences':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="preferences.priorFitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prior to Diagnosis/Treatment, How Active Were You?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="very-active">Very active (exercised 5+ times a week)</SelectItem>
                      <SelectItem value="moderately-active">Moderately active (exercised 3-4 times a week)</SelectItem>
                      <SelectItem value="somewhat-active">Somewhat active (exercised 1-2 times a week)</SelectItem>
                      <SelectItem value="lightly-active">Lightly active (occasional walking or light activity)</SelectItem>
                      <SelectItem value="sedentary">Mostly sedentary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferences.exercisePreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Types of Exercise You Enjoy (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'walking', label: 'Walking' },
                      { id: 'gentle-strength', label: 'Gentle strength training' },
                      { id: 'stretching', label: 'Stretching/flexibility' },
                      { id: 'yoga', label: 'Yoga or Pilates' },
                      { id: 'swimming', label: 'Swimming or water exercises' },
                      { id: 'cycling', label: 'Cycling' },
                      { id: 'dance', label: 'Dance' },
                      { id: 'cardio', label: 'Cardio' },
                      { id: 'balance', label: 'Balance exercises' },
                      { id: 'other', label: 'Other' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferences.exerciseDislikes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Types of Exercise You Dislike or Prefer to Avoid</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="E.g., running, high-impact activities, etc."
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? value.split(',').map(s => s.trim()) : []);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferences.weeklyExerciseGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Exercise Goal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="5-6-times">5-6 times per week</SelectItem>
                      <SelectItem value="3-4-times">3-4 times per week</SelectItem>
                      <SelectItem value="1-2-times">1-2 times per week</SelectItem>
                      <SelectItem value="occasional">Occasional/As able</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferences.timePerSession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time Per Session (minutes)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        min={5}
                        max={60}
                        step={5}
                        defaultValue={[field.value || 15]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5 mins</span>
                        <span>30 mins</span>
                        <span>60 mins</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current value: {field.value} minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'environment':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="environment.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Where Will You Primarily Exercise?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">At home</SelectItem>
                      <SelectItem value="gym">At a gym</SelectItem>
                      <SelectItem value="outdoors">Outdoors</SelectItem>
                      <SelectItem value="mixed">A mix of locations</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="environment.equipmentAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Available (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'none', label: 'None/just bodyweight' },
                      { id: 'chair', label: 'Chair' },
                      { id: 'resistance-bands', label: 'Resistance bands' },
                      { id: 'light-weights', label: 'Light weights/dumbbells' },
                      { id: 'yoga-mat', label: 'Yoga or exercise mat' },
                      { id: 'stability-ball', label: 'Stability ball' },
                      { id: 'treadmill', label: 'Treadmill' },
                      { id: 'stationary-bike', label: 'Stationary bike' },
                      { id: 'pool', label: 'Swimming pool access' },
                      { id: 'full-gym', label: 'Full gym equipment' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="environment.sessionFormatPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Exercise Format (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'video', label: 'Video instruction' },
                      { id: 'written', label: 'Written instructions with images' },
                      { id: 'audio', label: 'Audio guidance' },
                      { id: 'in-person', label: 'In-person guidance (if available)' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="environment.accessibilityNeeds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accessibility Needs (select all that apply)</FormLabel>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'closed-captions', label: 'Closed captions for videos' },
                      { id: 'large-text', label: 'Large text' },
                      { id: 'high-contrast', label: 'High contrast visuals' },
                      { id: 'simple-instructions', label: 'Simple, clear instructions' },
                    ].map((item) => (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Almost Done!</AlertTitle>
              <AlertDescription>
                Please review your information before submitting. Your answers will help us create personalized exercise recommendations for you.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Safety Check</CardTitle>
                </CardHeader>
                <CardContent>
                  {form.watch('safety.safetyConcerns')?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {form.watch('safety.safetyConcerns')?.map((concern) => (
                        <Badge key={concern} variant="outline">{concern}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No safety concerns selected</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-muted-foreground">{form.watch('personal.fullName')}</p>
                    </div>
                    <div>
                      <p className="font-medium">Date of Birth</p>
                      <p className="text-muted-foreground">{form.watch('personal.dateOfBirth')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Medical Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Cancer Type</p>
                      <p className="text-muted-foreground">{form.watch('medical.cancerType') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Treatment Stage</p>
                      <p className="text-muted-foreground">{form.watch('medical.treatmentStage') || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Physical Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Energy Level</p>
                      <p className="text-muted-foreground">{form.watch('physical.energyLevel')}/10</p>
                    </div>
                    <div>
                      <p className="font-medium">Pain Level</p>
                      <p className="text-muted-foreground">{form.watch('physical.painLevel')}/10</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Exercise Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-medium">Preferred Types</p>
                    {form.watch('preferences.exercisePreferences')?.length ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.watch('preferences.exercisePreferences')?.map((pref) => (
                          <Badge key={pref} variant="secondary">{pref}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">None specified</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-primary" />
            Health & Exercise Assessment
          </CardTitle>
          <CardDescription>
            This assessment helps us create personalized exercise recommendations that are safe and effective for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <div 
                  key={s.id}
                  className={`flex flex-col items-center ${i < step ? 'text-primary' : i === step ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      i < step 
                        ? 'bg-primary text-primary-foreground' 
                        : i === step 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-center hidden sm:block">{s.name}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${((step) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{steps[step].name}</h2>
                  <p className="text-muted-foreground">{steps[step].description}</p>
                </div>
                
                <Separator />
                
                {renderStep()}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 0}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {step < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    className="flex items-center"
                  >
                    Submit
                    <Save className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}