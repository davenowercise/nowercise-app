import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { 
  Heart, 
  Activity, 
  Shield, 
  Target, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  Brain,
  Award,
  Info
} from 'lucide-react';

interface OnboardingData {
  // Personal Information
  personalInfo: {
    dateOfBirth: string;
    gender: string;
    emergencyContact: string;
    emergencyPhone: string;
  };
  
  // Cancer Information
  cancerInfo: {
    cancerType: string;
    cancerStage: string;
    diagnosisDate: string;
    treatmentStage: 'pre-treatment' | 'during-treatment' | 'post-treatment' | 'survivorship';
    currentTreatments: string[];
  };
  
  // Medical History
  medicalHistory: {
    medicalClearance: 'cleared' | 'modified' | 'restricted';
    clearingPhysician: string;
    comorbidities: string[];
    currentMedications: string;
    physicalRestrictions: string;
  };
  
  // Physical Assessment
  physicalAssessment: {
    energyLevel: number;
    mobilityStatus: number;
    painLevel: number;
    fatigueLevel: number;
    balanceIssues: boolean;
    lymphedemaRisk: boolean;
    strengthLevel: number;
    cardiovascularFitness: number;
  };
  
  // Lifestyle & Goals
  lifestyle: {
    previousExerciseLevel: string;
    exercisePreferences: string[];
    fitnessGoals: string[];
    motivationLevel: number;
    timeAvailable: number;
    preferredSchedule: string[];
  };
  
  // PAR-Q+ Assessment
  parqAssessment: {
    responses: Record<string, boolean>;
    additionalInfo: string;
    riskLevel: 'low' | 'moderate' | 'high';
  };
}

const CANCER_TYPES = [
  'Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Prostate Cancer',
  'Lymphoma', 'Leukemia', 'Ovarian Cancer', 'Pancreatic Cancer',
  'Skin Cancer', 'Thyroid Cancer', 'Kidney Cancer', 'Liver Cancer'
];

const TREATMENT_OPTIONS = [
  'Chemotherapy', 'Radiation Therapy', 'Surgery', 'Immunotherapy',
  'Hormone Therapy', 'Targeted Therapy', 'Bone Marrow Transplant'
];

const COMORBIDITIES = [
  'Diabetes', 'Heart Disease', 'High Blood Pressure', 'Osteoporosis',
  'Arthritis', 'Chronic Fatigue', 'Depression', 'Anxiety', 'COPD'
];

const EXERCISE_PREFERENCES = [
  'Walking', 'Swimming', 'Yoga', 'Strength Training', 'Stretching',
  'Tai Chi', 'Cycling', 'Dancing', 'Pilates', 'Chair Exercises'
];

const FITNESS_GOALS = [
  'Increase energy levels', 'Improve strength', 'Reduce fatigue',
  'Enhance mobility', 'Boost mood', 'Improve sleep', 'Maintain weight',
  'Build confidence', 'Social connection', 'Stress management'
];

const PARQ_QUESTIONS = [
  'Has your doctor ever said that you have a heart condition?',
  'Do you feel pain in your chest when you do physical activity?',
  'In the past month, have you had chest pain when you were not doing physical activity?',
  'Do you lose your balance because of dizziness or do you ever lose consciousness?',
  'Do you have a bone or joint problem that could be made worse by activity?',
  'Is your doctor currently prescribing drugs for your blood pressure or heart condition?',
  'Do you know of any other reason why you should not do physical activity?'
];

export function EnhancedOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    personalInfo: {
      dateOfBirth: '',
      gender: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    cancerInfo: {
      cancerType: '',
      cancerStage: '',
      diagnosisDate: '',
      treatmentStage: 'post-treatment',
      currentTreatments: []
    },
    medicalHistory: {
      medicalClearance: 'cleared',
      clearingPhysician: '',
      comorbidities: [],
      currentMedications: '',
      physicalRestrictions: ''
    },
    physicalAssessment: {
      energyLevel: 5,
      mobilityStatus: 5,
      painLevel: 3,
      fatigueLevel: 5,
      balanceIssues: false,
      lymphedemaRisk: false,
      strengthLevel: 5,
      cardiovascularFitness: 5
    },
    lifestyle: {
      previousExerciseLevel: '',
      exercisePreferences: [],
      fitnessGoals: [],
      motivationLevel: 5,
      timeAvailable: 30,
      preferredSchedule: []
    },
    parqAssessment: {
      responses: {},
      additionalInfo: '',
      riskLevel: 'low'
    }
  });

  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  const submitOnboarding = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return await apiRequest('/api/onboarding/complete', {
        method: 'POST',
        data: data
      });
    },
    onSuccess: (data) => {
      setAssessmentResults(data);
      setCurrentStep(7);
    },
    onError: (error) => {
      console.error('Onboarding failed:', error);
    }
  });

  const updateFormData = (section: keyof OnboardingData, updates: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleArrayToggle = (section: keyof OnboardingData, field: string, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[section] as any)[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const calculatePARQRisk = () => {
    const yesCount = Object.values(formData.parqAssessment.responses).filter(Boolean).length;
    if (yesCount === 0) return 'low';
    if (yesCount <= 2) return 'moderate';
    return 'high';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">Welcome to Nowercise</h2>
              <p className="text-gray-600">
                Let's create your personalized cancer recovery exercise program
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => updateFormData('personalInfo', { dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.personalInfo.gender} 
                    onValueChange={(value) => updateFormData('personalInfo', { gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.personalInfo.emergencyContact}
                    onChange={(e) => updateFormData('personalInfo', { emergencyContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.personalInfo.emergencyPhone}
                    onChange={(e) => updateFormData('personalInfo', { emergencyPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" disabled>Previous</Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!formData.personalInfo.dateOfBirth || !formData.personalInfo.gender}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold">Cancer Information</h2>
              <p className="text-gray-600">
                Help us understand your cancer journey to personalize your program
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cancerType">Cancer Type</Label>
                  <Select 
                    value={formData.cancerInfo.cancerType} 
                    onValueChange={(value) => updateFormData('cancerInfo', { cancerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cancerStage">Cancer Stage</Label>
                  <Select 
                    value={formData.cancerInfo.cancerStage} 
                    onValueChange={(value) => updateFormData('cancerInfo', { cancerStage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage-0">Stage 0</SelectItem>
                      <SelectItem value="stage-1">Stage I</SelectItem>
                      <SelectItem value="stage-2">Stage II</SelectItem>
                      <SelectItem value="stage-3">Stage III</SelectItem>
                      <SelectItem value="stage-4">Stage IV</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                  <Input
                    id="diagnosisDate"
                    type="date"
                    value={formData.cancerInfo.diagnosisDate}
                    onChange={(e) => updateFormData('cancerInfo', { diagnosisDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Treatment Stage</Label>
                  <RadioGroup 
                    value={formData.cancerInfo.treatmentStage} 
                    onValueChange={(value: any) => updateFormData('cancerInfo', { treatmentStage: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pre-treatment" id="pre-treatment" />
                      <Label htmlFor="pre-treatment">Pre-Treatment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="during-treatment" id="during-treatment" />
                      <Label htmlFor="during-treatment">During Treatment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="post-treatment" id="post-treatment" />
                      <Label htmlFor="post-treatment">Post-Treatment</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="survivorship" id="survivorship" />
                      <Label htmlFor="survivorship">Survivorship</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label>Current Treatments (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {TREATMENT_OPTIONS.map(treatment => (
                    <div key={treatment} className="flex items-center space-x-2">
                      <Checkbox
                        id={treatment}
                        checked={formData.cancerInfo.currentTreatments.includes(treatment)}
                        onCheckedChange={() => handleArrayToggle('cancerInfo', 'currentTreatments', treatment)}
                      />
                      <Label htmlFor={treatment} className="text-sm">{treatment}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Previous</Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!formData.cancerInfo.cancerType}
              >
                Next
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold">Medical History & Safety</h2>
              <p className="text-gray-600">
                Medical clearance and health conditions that affect exercise
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Medical Clearance for Exercise</Label>
                <RadioGroup 
                  value={formData.medicalHistory.medicalClearance} 
                  onValueChange={(value: any) => updateFormData('medicalHistory', { medicalClearance: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cleared" id="cleared" />
                    <Label htmlFor="cleared">Cleared for all activities</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modified" id="modified" />
                    <Label htmlFor="modified">Cleared with modifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="restricted" id="restricted" />
                    <Label htmlFor="restricted">Restricted activities</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="clearingPhysician">Clearing Physician (Optional)</Label>
                <Input
                  id="clearingPhysician"
                  value={formData.medicalHistory.clearingPhysician}
                  onChange={(e) => updateFormData('medicalHistory', { clearingPhysician: e.target.value })}
                  placeholder="Dr. Smith, Oncologist"
                />
              </div>

              <div>
                <Label>Other Health Conditions (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {COMORBIDITIES.map(condition => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.medicalHistory.comorbidities.includes(condition)}
                        onCheckedChange={() => handleArrayToggle('medicalHistory', 'comorbidities', condition)}
                      />
                      <Label htmlFor={condition} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.medicalHistory.currentMedications}
                  onChange={(e) => updateFormData('medicalHistory', { currentMedications: e.target.value })}
                  placeholder="List your current medications..."
                />
              </div>

              <div>
                <Label htmlFor="physicalRestrictions">Physical Restrictions or Limitations</Label>
                <Textarea
                  id="physicalRestrictions"
                  value={formData.medicalHistory.physicalRestrictions}
                  onChange={(e) => updateFormData('medicalHistory', { physicalRestrictions: e.target.value })}
                  placeholder="Any physical limitations we should know about..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Previous</Button>
              <Button onClick={() => setCurrentStep(4)}>Next</Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Activity className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold">Physical Assessment</h2>
              <p className="text-gray-600">
                Rate your current physical capabilities and energy levels
              </p>
            </div>

            <div className="space-y-6">
              {[
                { key: 'energyLevel', label: 'Energy Level', description: 'How energetic do you feel on average?', icon: '⚡' },
                { key: 'mobilityStatus', label: 'Mobility', description: 'How well can you move around?', icon: '🚶' },
                { key: 'painLevel', label: 'Pain Level', description: 'What is your average pain level?', icon: '😓' },
                { key: 'fatigueLevel', label: 'Fatigue Level', description: 'How tired do you feel?', icon: '😴' },
                { key: 'strengthLevel', label: 'Strength', description: 'How strong do you feel?', icon: '💪' },
                { key: 'cardiovascularFitness', label: 'Cardio Fitness', description: 'How is your heart health?', icon: '❤️' }
              ].map(({ key, label, description, icon }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icon}</span>
                      <Label>{label}</Label>
                    </div>
                    <Badge variant="outline">{formData.physicalAssessment[key as keyof typeof formData.physicalAssessment]}/10</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                  <div className="px-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.physicalAssessment[key as keyof typeof formData.physicalAssessment]}
                      onChange={(e) => updateFormData('physicalAssessment', { [key]: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="balanceIssues"
                    checked={formData.physicalAssessment.balanceIssues}
                    onCheckedChange={(checked) => updateFormData('physicalAssessment', { balanceIssues: checked })}
                  />
                  <Label htmlFor="balanceIssues">I have balance issues or fall risk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lymphedemaRisk"
                    checked={formData.physicalAssessment.lymphedemaRisk}
                    onCheckedChange={(checked) => updateFormData('physicalAssessment', { lymphedemaRisk: checked })}
                  />
                  <Label htmlFor="lymphedemaRisk">I have lymphedema or risk of lymphedema</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Previous</Button>
              <Button onClick={() => setCurrentStep(5)}>Next</Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <h2 className="text-2xl font-bold">Lifestyle & Goals</h2>
              <p className="text-gray-600">
                Tell us about your exercise preferences and fitness goals
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="previousExerciseLevel">Previous Exercise Level</Label>
                <Select 
                  value={formData.lifestyle.previousExerciseLevel} 
                  onValueChange={(value) => updateFormData('lifestyle', { previousExerciseLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your previous activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light activity (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate activity (3-4 days/week)</SelectItem>
                    <SelectItem value="active">Active (5+ days/week)</SelectItem>
                    <SelectItem value="very-active">Very active (daily exercise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Exercise Preferences (Select all that interest you)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {EXERCISE_PREFERENCES.map(preference => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference}
                        checked={formData.lifestyle.exercisePreferences.includes(preference)}
                        onCheckedChange={() => handleArrayToggle('lifestyle', 'exercisePreferences', preference)}
                      />
                      <Label htmlFor={preference} className="text-sm">{preference}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Fitness Goals (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {FITNESS_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.lifestyle.fitnessGoals.includes(goal)}
                        onCheckedChange={() => handleArrayToggle('lifestyle', 'fitnessGoals', goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Motivation Level</Label>
                  <div className="mt-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.lifestyle.motivationLevel}
                      onChange={(e) => updateFormData('lifestyle', { motivationLevel: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High ({formData.lifestyle.motivationLevel}/10)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Time Available (minutes per session)</Label>
                  <Select 
                    value={formData.lifestyle.timeAvailable.toString()} 
                    onValueChange={(value) => updateFormData('lifestyle', { timeAvailable: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>Previous</Button>
              <Button onClick={() => setCurrentStep(6)}>Next</Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">PAR-Q+ Safety Assessment</h2>
              <p className="text-gray-600">
                Physical Activity Readiness Questionnaire - required for your safety
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please answer these questions honestly. They help us ensure your exercise program is safe for you.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {PARQ_QUESTIONS.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <p className="font-medium">{question}</p>
                    <RadioGroup 
                      value={formData.parqAssessment.responses[`q${index}`]?.toString() || ''} 
                      onValueChange={(value) => {
                        const newResponses = {
                          ...formData.parqAssessment.responses,
                          [`q${index}`]: value === 'true'
                        };
                        updateFormData('parqAssessment', { responses: newResponses });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`q${index}-no`} />
                        <Label htmlFor={`q${index}-no`}>No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`q${index}-yes`} />
                        <Label htmlFor={`q${index}-yes`}>Yes</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                value={formData.parqAssessment.additionalInfo}
                onChange={(e) => updateFormData('parqAssessment', { additionalInfo: e.target.value })}
                placeholder="Any additional health information or concerns..."
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>Previous</Button>
              <Button 
                onClick={() => {
                  const riskLevel = calculatePARQRisk();
                  updateFormData('parqAssessment', { riskLevel });
                  submitOnboarding.mutate(formData);
                }}
                disabled={submitOnboarding.isPending || Object.keys(formData.parqAssessment.responses).length < PARQ_QUESTIONS.length}
              >
                {submitOnboarding.isPending ? 'Processing...' : 'Complete Assessment'}
              </Button>
            </div>
          </div>
        );

      case 7:
        return assessmentResults ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h2 className="text-2xl font-bold">Assessment Complete!</h2>
              <p className="text-gray-600">
                Your personalized exercise program is ready
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Exercise Tier</CardTitle>
                <CardDescription>Based on your assessment, you've been assigned to:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="text-lg px-4 py-2">
                    Tier {assessmentResults.tier}
                  </Badge>
                  <span className="text-xl font-semibold">
                    {assessmentResults.tierDescription}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Recommended Activities</h4>
                    <ul className="text-sm space-y-1">
                      {assessmentResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Safety Considerations</h4>
                    <ul className="text-sm space-y-1">
                      {assessmentResults.safetyNotes.map((note: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {assessmentResults.medicalClearanceNeeded && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-medium text-red-800">Medical Clearance Required</p>
                    <p className="text-red-700">
                      Based on your responses, we recommend completing a PAR-Q+ assessment and consulting with your healthcare provider before starting the exercise program.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-700 hover:bg-red-100"
                        onClick={() => window.location.href = '/parq-demo'}
                      >
                        Take PAR-Q+ Assessment
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-300 text-red-700 hover:bg-red-100"
                        onClick={() => window.location.href = '/medical-clearance'}
                      >
                        Medical Clearance Guide
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.href = '/ai-prescriptions'}>
                <Brain className="h-4 w-4 mr-2" />
                Get AI Prescription
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/workout-calendar'}>
                <Calendar className="h-4 w-4 mr-2" />
                Start Program
              </Button>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Progress value={(currentStep / 7) * 100} className="flex-1 mr-4" />
            <span className="text-sm text-gray-600">Step {currentStep} of 7</span>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}