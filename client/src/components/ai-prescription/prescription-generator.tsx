import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { 
  Brain, 
  Target, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  Heart,
  Dumbbell,
  Clock,
  TrendingUp
} from 'lucide-react';

interface PrescriptionInput {
  cancerType: string;
  treatmentStage: 'pre-treatment' | 'during-treatment' | 'post-treatment' | 'survivorship';
  medicalClearance: 'cleared' | 'modified' | 'restricted';
  physicalAssessment: {
    energyLevel: number;
    mobilityStatus: number;
    painLevel: number;
    strengthLevel?: number;
    balanceLevel?: number;
    cardiovascularFitness?: number;
  };
  goals: string[];
  limitations: string[];
}

interface GeneratedPrescription {
  id: number;
  programName: string;
  duration: number;
  frequency: number;
  tier: 1 | 2 | 3 | 4;
  exercises: Array<{
    exerciseId: number;
    exerciseName: string;
    sets: number;
    reps: string;
    intensity: 'low' | 'moderate' | 'vigorous';
    restPeriod: string;
    modifications: string[];
    safetyNotes: string[];
  }>;
  safetyGuidelines: string[];
  medicalNotes: string[];
  reviewSchedule: string[];
  estimatedCalories: number;
  expectedBenefits: string[];
}

const CANCER_TYPES = [
  'Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Prostate Cancer',
  'Lymphoma', 'Leukemia', 'Ovarian Cancer', 'Pancreatic Cancer',
  'Skin Cancer', 'Thyroid Cancer', 'Kidney Cancer', 'Liver Cancer'
];

const COMMON_GOALS = [
  'Increase energy levels',
  'Improve strength and muscle tone',
  'Enhance cardiovascular health',
  'Reduce fatigue',
  'Improve mobility and flexibility',
  'Boost mood and mental health',
  'Maintain bone health',
  'Improve sleep quality',
  'Enhance immune function',
  'Reduce treatment side effects'
];

const COMMON_LIMITATIONS = [
  'Joint pain or stiffness',
  'Balance issues',
  'Lymphedema risk',
  'Neuropathy',
  'Fatigue',
  'Shortness of breath',
  'Limited range of motion',
  'Bone density concerns',
  'Wound healing concerns',
  'Nausea or digestive issues'
];

export function PrescriptionGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PrescriptionInput>({
    cancerType: '',
    treatmentStage: 'post-treatment',
    medicalClearance: 'cleared',
    physicalAssessment: {
      energyLevel: 5,
      mobilityStatus: 5,
      painLevel: 3,
      strengthLevel: 5,
      balanceLevel: 5,
      cardiovascularFitness: 5
    },
    goals: [],
    limitations: []
  });
  
  const [generatedPrescription, setGeneratedPrescription] = useState<GeneratedPrescription | null>(null);
  const queryClient = useQueryClient();

  const generatePrescription = useMutation({
    mutationFn: async (input: PrescriptionInput) => {
      return await apiRequest('/api/ai-prescription/generate', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setGeneratedPrescription(data.prescription);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prescription/current'] });
    },
    onError: (error) => {
      console.error('Failed to generate prescription:', error);
    }
  });

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleLimitationToggle = (limitation: string) => {
    setFormData(prev => ({
      ...prev,
      limitations: prev.limitations.includes(limitation)
        ? prev.limitations.filter(l => l !== limitation)
        : [...prev.limitations, limitation]
    }));
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-info-panel text-action-blue';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: number) => {
    switch (tier) {
      case 1: return 'Gentle Start';
      case 2: return 'Building Foundation';
      case 3: return 'Moderate Intensity';
      case 4: return 'Advanced Training';
      default: return 'Unknown';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold">AI Exercise Prescription</h2>
              <p className="text-gray-600">
                Get a personalized, evidence-based exercise program designed specifically for your cancer journey
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cancerType">Cancer Type</Label>
                <Select 
                  value={formData.cancerType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cancerType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your cancer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCER_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Treatment Stage</Label>
                <RadioGroup 
                  value={formData.treatmentStage} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, treatmentStage: value }))}
                  className="mt-2"
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

              <div>
                <Label>Medical Clearance Status</Label>
                <RadioGroup 
                  value={formData.medicalClearance} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, medicalClearance: value }))}
                  className="mt-2"
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
            </div>

            <div className="flex justify-between">
              <Button variant="outline" disabled>Previous</Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!formData.cancerType}
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
              <Activity className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold">Physical Assessment</h2>
              <p className="text-gray-600">
                Help us understand your current physical capabilities and energy levels
              </p>
            </div>

            <div className="space-y-6">
              {[
                { key: 'energyLevel', label: 'Energy Level', description: 'How energetic do you feel on average?' },
                { key: 'mobilityStatus', label: 'Mobility', description: 'How well can you move around?' },
                { key: 'painLevel', label: 'Pain Level', description: 'What is your average pain level?' },
                { key: 'strengthLevel', label: 'Strength Level', description: 'How strong do you feel?' },
                { key: 'balanceLevel', label: 'Balance', description: 'How confident are you with your balance?' },
                { key: 'cardiovascularFitness', label: 'Cardio Fitness', description: 'How is your cardiovascular endurance?' }
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{label}</Label>
                    <Badge variant="outline">{formData.physicalAssessment[key as keyof typeof formData.physicalAssessment]}/10</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                  <div className="px-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.physicalAssessment[key as keyof typeof formData.physicalAssessment]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        physicalAssessment: {
                          ...prev.physicalAssessment,
                          [key]: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Previous</Button>
              <Button onClick={() => setCurrentStep(3)}>Next</Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold">Goals & Limitations</h2>
              <p className="text-gray-600">
                Select your fitness goals and any physical limitations we should consider
              </p>
            </div>

            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="limitations">Limitations</TabsTrigger>
              </TabsList>

              <TabsContent value="goals" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_GOALS.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="limitations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_LIMITATIONS.map(limitation => (
                    <div key={limitation} className="flex items-center space-x-2">
                      <Checkbox
                        id={limitation}
                        checked={formData.limitations.includes(limitation)}
                        onCheckedChange={() => handleLimitationToggle(limitation)}
                      />
                      <Label htmlFor={limitation} className="text-sm">{limitation}</Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Previous</Button>
              <Button 
                onClick={() => generatePrescription.mutate(formData)}
                disabled={generatePrescription.isPending}
              >
                {generatePrescription.isPending ? 'Generating...' : 'Generate Prescription'}
              </Button>
            </div>
          </div>
        );

      case 4:
        return generatedPrescription ? (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h2 className="text-2xl font-bold">Your Personalized Prescription</h2>
              <p className="text-gray-600">
                AI-generated exercise program tailored to your specific needs
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{generatedPrescription.programName}</CardTitle>
                    <CardDescription>
                      {generatedPrescription.duration} weeks • {generatedPrescription.frequency} sessions per week
                    </CardDescription>
                  </div>
                  <Badge className={getTierColor(generatedPrescription.tier)}>
                    Tier {generatedPrescription.tier}: {getTierLabel(generatedPrescription.tier)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{generatedPrescription.exercises.length} Exercises</p>
                      <p className="text-xs text-gray-600">Personalized selection</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">~30-45 minutes</p>
                      <p className="text-xs text-gray-600">Per session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{generatedPrescription.estimatedCalories} calories</p>
                      <p className="text-xs text-gray-600">Per session</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Expected Benefits</h4>
                    <ul className="text-sm space-y-1">
                      {generatedPrescription.expectedBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Safety Guidelines</h4>
                    <ul className="text-sm space-y-1">
                      {generatedPrescription.safetyGuidelines.slice(0, 3).map((guideline, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Start Over</Button>
              <Button onClick={() => window.location.href = '/workout-calendar'}>
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
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Progress value={(currentStep / 4) * 100} className="flex-1 mr-4" />
            <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
}