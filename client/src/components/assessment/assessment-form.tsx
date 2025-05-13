import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, addDemoParam } from "@/lib/queryClient";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, ChevronRight, Stethoscope, Heart, Brain, Activity } from "lucide-react";
import { useLocation } from "wouter";

// Define the assessment stages
const ASSESSMENT_STAGES = [
  {
    id: "medical-history",
    title: "Medical History",
    icon: <Stethoscope className="h-5 w-5" />,
    description: "Tell us about your cancer diagnosis and treatment history"
  },
  {
    id: "physical-condition",
    title: "Physical Condition",
    icon: <Activity className="h-5 w-5" />,
    description: "Help us understand your current physical capabilities"
  },
  {
    id: "preferences",
    title: "Exercise Preferences",
    icon: <Heart className="h-5 w-5" />,
    description: "Share your exercise preferences and goals"
  },
  {
    id: "cognitive",
    title: "Mental & Cognitive",
    icon: <Brain className="h-5 w-5" />,
    description: "Understand how your mental state affects your exercise"
  }
];

type AssessmentFormData = {
  // Medical History
  cancerType: string;
  treatmentStage: string;
  treatmentNotes: string;
  treatmentsReceived: string[];
  lymphoedemaRisk: boolean;
  
  // Physical Condition
  energyLevel: number;
  painLevel: number;
  mobilityStatus: string;
  physicalRestrictions: string[];
  
  // Exercise Preferences
  exerciseExperience: string;
  preferredExerciseTypes: string[];
  exerciseGoals: string[];
  exerciseTime: number;
  
  // Mental & Cognitive
  stressLevel: number;
  confidenceLevel: string;
  supportNetwork: boolean;
  motivators: string[];
};

const defaultFormData: AssessmentFormData = {
  // Medical History
  cancerType: "",
  treatmentStage: "",
  treatmentNotes: "",
  treatmentsReceived: [],
  lymphoedemaRisk: false,
  
  // Physical Condition
  energyLevel: 5,
  painLevel: 0,
  mobilityStatus: "",
  physicalRestrictions: [],
  
  // Exercise Preferences
  exerciseExperience: "beginner",
  preferredExerciseTypes: [],
  exerciseGoals: [],
  exerciseTime: 20,
  
  // Mental & Cognitive
  stressLevel: 5,
  confidenceLevel: "moderate",
  supportNetwork: false,
  motivators: []
};

export function PatientAssessmentForm() {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [formData, setFormData] = useState<AssessmentFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const totalStages = ASSESSMENT_STAGES.length;
  const progress = ((currentStage + 1) / (totalStages + 1)) * 100;
  
  const submitAssessment = useMutation({
    mutationFn: (data: AssessmentFormData) => {
      return apiRequest('POST', '/api/patient/assessment', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient/assessments'] });
      toast({
        title: "Assessment completed",
        description: "Your health assessment has been saved and recommendations are being generated.",
      });
      setIsSubmitting(false);
      setLocation("/recommendations");
    },
    onError: (error) => {
      console.error("Assessment submission error:", error);
      toast({
        title: "Submission error",
        description: "There was a problem saving your assessment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  const handleNextStage = () => {
    if (currentStage < totalStages - 1) {
      setCurrentStage(currentStage + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit the final form
      setIsSubmitting(true);
      submitAssessment.mutate(formData);
    }
  };
  
  const handlePreviousStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const updateFormData = (field: keyof AssessmentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const toggleArrayItem = (field: keyof AssessmentFormData, item: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    
    updateFormData(field, newArray);
  };
  
  // Render different form sections based on current stage
  const renderFormContent = () => {
    switch (ASSESSMENT_STAGES[currentStage].id) {
      case "medical-history":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cancerType">Type of Cancer</Label>
              <Select
                value={formData.cancerType}
                onValueChange={(value) => updateFormData("cancerType", value)}
              >
                <SelectTrigger id="cancerType">
                  <SelectValue placeholder="Select cancer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breast">Breast Cancer</SelectItem>
                  <SelectItem value="Prostate">Prostate Cancer</SelectItem>
                  <SelectItem value="Lung">Lung Cancer</SelectItem>
                  <SelectItem value="Colorectal">Colorectal Cancer</SelectItem>
                  <SelectItem value="Lymphoma">Lymphoma</SelectItem>
                  <SelectItem value="Leukemia">Leukemia</SelectItem>
                  <SelectItem value="Other">Other/Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatmentStage">Current Treatment Stage</Label>
              <Select
                value={formData.treatmentStage}
                onValueChange={(value) => updateFormData("treatmentStage", value)}
              >
                <SelectTrigger id="treatmentStage">
                  <SelectValue placeholder="Select treatment stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre-Treatment">Pre-Treatment / Newly Diagnosed</SelectItem>
                  <SelectItem value="During Treatment">Currently Undergoing Treatment</SelectItem>
                  <SelectItem value="Post-Treatment">Recently Completed Treatment (0-6 months)</SelectItem>
                  <SelectItem value="Recovery">Recovery Phase (6+ months post-treatment)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Treatments Received (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Surgery", "Chemotherapy", "Radiation", "Hormone Therapy", "Immunotherapy", "Targeted Therapy", "Stem Cell Transplant", "Other"].map((treatment) => (
                  <div key={treatment} className="flex items-center space-x-2">
                    <Checkbox
                      id={`treatment-${treatment}`}
                      checked={formData.treatmentsReceived.includes(treatment)}
                      onCheckedChange={() => toggleArrayItem("treatmentsReceived", treatment)}
                    />
                    <Label htmlFor={`treatment-${treatment}`}>{treatment}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lymphoedemaRisk"
                  checked={formData.lymphoedemaRisk}
                  onCheckedChange={(checked) => updateFormData("lymphoedemaRisk", !!checked)}
                />
                <Label htmlFor="lymphoedemaRisk">I have lymphoedema risk or concerns</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatmentNotes">Additional Information</Label>
              <Textarea
                id="treatmentNotes"
                placeholder="Any other details about your diagnosis or treatment you'd like to share"
                value={formData.treatmentNotes}
                onChange={(e) => updateFormData("treatmentNotes", e.target.value)}
              />
            </div>
          </div>
        );
        
      case "physical-condition":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Current Energy Level (1 = Very Low, 10 = Very High)</Label>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.energyLevel]}
                  onValueChange={(values) => updateFormData("energyLevel", values[0])}
                />
                <div className="flex justify-between text-xs">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
                <div className="text-center font-medium">
                  {formData.energyLevel}/10
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Pain Level (0 = No Pain, 10 = Severe Pain)</Label>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[formData.painLevel]}
                  onValueChange={(values) => updateFormData("painLevel", values[0])}
                />
                <div className="flex justify-between text-xs">
                  <span>No Pain</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
                <div className="text-center font-medium">
                  {formData.painLevel}/10
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobilityStatus">Current Mobility Status</Label>
              <Select
                value={formData.mobilityStatus}
                onValueChange={(value) => updateFormData("mobilityStatus", value)}
              >
                <SelectTrigger id="mobilityStatus">
                  <SelectValue placeholder="Select mobility status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Mobility">Full mobility (no restrictions)</SelectItem>
                  <SelectItem value="Mostly Mobile">Mostly mobile (minor restrictions)</SelectItem>
                  <SelectItem value="Moderate Restrictions">Some difficulty with certain movements</SelectItem>
                  <SelectItem value="Significant Restrictions">Significant mobility restrictions</SelectItem>
                  <SelectItem value="Uses Mobility Aid">Requires mobility aids (cane, walker, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Physical Restrictions (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Limited arm movement",
                  "Limited leg movement",
                  "Balance issues",
                  "Limited stamina",
                  "Breathing difficulties",
                  "Coordination issues",
                  "Neuropathy",
                  "Muscle weakness"
                ].map((restriction) => (
                  <div key={restriction} className="flex items-center space-x-2">
                    <Checkbox
                      id={`restriction-${restriction}`}
                      checked={formData.physicalRestrictions.includes(restriction)}
                      onCheckedChange={() => toggleArrayItem("physicalRestrictions", restriction)}
                    />
                    <Label htmlFor={`restriction-${restriction}`}>{restriction}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case "preferences":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exerciseExperience">Exercise Experience</Label>
              <Select
                value={formData.exerciseExperience}
                onValueChange={(value) => updateFormData("exerciseExperience", value)}
              >
                <SelectTrigger id="exerciseExperience">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (new to exercise)</SelectItem>
                  <SelectItem value="limited">Limited experience</SelectItem>
                  <SelectItem value="moderately-active">Moderately active (occasional exercise)</SelectItem>
                  <SelectItem value="experienced">Experienced (regular exercise routine before diagnosis)</SelectItem>
                  <SelectItem value="very-active">Very active (consistent exercise throughout treatment)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Preferred Exercise Types (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Walking",
                  "Swimming",
                  "Yoga",
                  "Strength training",
                  "Pilates",
                  "Cycling",
                  "Stretching routines",
                  "Chair-based exercises",
                  "Balance exercises",
                  "Tai Chi"
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exercise-${type}`}
                      checked={formData.preferredExerciseTypes.includes(type)}
                      onCheckedChange={() => toggleArrayItem("preferredExerciseTypes", type)}
                    />
                    <Label htmlFor={`exercise-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Exercise Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Reduce fatigue",
                  "Improve strength",
                  "Maintain weight",
                  "Improve mobility",
                  "Reduce stress/anxiety",
                  "Improve sleep",
                  "Manage pain",
                  "Social connection",
                  "Improve mood",
                  "Increase endurance"
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={`goal-${goal}`}
                      checked={formData.exerciseGoals.includes(goal)}
                      onCheckedChange={() => toggleArrayItem("exerciseGoals", goal)}
                    />
                    <Label htmlFor={`goal-${goal}`}>{goal}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Preferred exercise duration per session (minutes)</Label>
              <div className="space-y-2">
                <Slider
                  min={5}
                  max={60}
                  step={5}
                  value={[formData.exerciseTime]}
                  onValueChange={(values) => updateFormData("exerciseTime", values[0])}
                />
                <div className="flex justify-between text-xs">
                  <span>5 min</span>
                  <span>30 min</span>
                  <span>60 min</span>
                </div>
                <div className="text-center font-medium">
                  {formData.exerciseTime} minutes
                </div>
              </div>
            </div>
          </div>
        );
        
      case "cognitive":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Current Stress Level (1 = Very Low, 10 = Very High)</Label>
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[formData.stressLevel]}
                  onValueChange={(values) => updateFormData("stressLevel", values[0])}
                />
                <div className="flex justify-between text-xs">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
                <div className="text-center font-medium">
                  {formData.stressLevel}/10
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confidenceLevel">Confidence in Physical Activity</Label>
              <RadioGroup
                value={formData.confidenceLevel}
                onValueChange={(value) => updateFormData("confidenceLevel", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-low" id="confidence-very-low" />
                  <Label htmlFor="confidence-very-low">Very low (fearful of movement)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="confidence-low" />
                  <Label htmlFor="confidence-low">Low (hesitant about most activities)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="confidence-moderate" />
                  <Label htmlFor="confidence-moderate">Moderate (comfortable with guidance)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="confidence-high" />
                  <Label htmlFor="confidence-high">High (confident in most activities)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-high" id="confidence-very-high" />
                  <Label htmlFor="confidence-very-high">Very high (fully confident)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="supportNetwork"
                  checked={formData.supportNetwork}
                  onCheckedChange={(checked) => updateFormData("supportNetwork", !!checked)}
                />
                <Label htmlFor="supportNetwork">I have support from family/friends for exercise</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>What motivates you to exercise? (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Feeling better physically",
                  "Improving mood",
                  "Following doctor's advice",
                  "Spending time with others",
                  "Setting and achieving goals",
                  "Building strength",
                  "Tracking progress",
                  "Reducing symptoms",
                  "Regaining control",
                  "Focusing on wellness"
                ].map((motivator) => (
                  <div key={motivator} className="flex items-center space-x-2">
                    <Checkbox
                      id={`motivator-${motivator}`}
                      checked={formData.motivators.includes(motivator)}
                      onCheckedChange={() => toggleArrayItem("motivators", motivator)}
                    />
                    <Label htmlFor={`motivator-${motivator}`}>{motivator}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown stage</div>;
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            {ASSESSMENT_STAGES[currentStage].icon}
            <span className="ml-2">{ASSESSMENT_STAGES[currentStage].title}</span>
          </CardTitle>
          <CardDescription>{ASSESSMENT_STAGES[currentStage].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-1 text-sm">
              <span>Stage {currentStage + 1} of {totalStages}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {renderFormContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStage}
            disabled={currentStage === 0 || isSubmitting}
          >
            Back
          </Button>
          
          <Button
            onClick={handleNextStage}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : currentStage === totalStages - 1 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Assessment
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Alert>
        <AlertTitle>Privacy Notice</AlertTitle>
        <AlertDescription>
          Your assessment data is private and will only be used to generate personalized exercise recommendations.
          Only your healthcare provider or fitness specialist can view this information.
        </AlertDescription>
      </Alert>
    </div>
  );
}