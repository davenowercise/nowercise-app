import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, addDemoParam } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";

// Safety check data type
type SafetyCheckData = {
  name: string;
  dateOfBirth: string;
  email: string;
  safetyConcerns: string[];
  cancerType: string;
  treatmentStage: string;
  sideEffects: string;
  energyLevel: string;
  confidence: string;
  movementPreferences: string;
  consent: boolean;
};

interface SafetyCheckProps {
  onComplete: (safeToExercise: boolean) => void;
}

export function SafetyCheck({ onComplete }: SafetyCheckProps) {
  const [formData, setFormData] = useState<SafetyCheckData>({
    name: "",
    dateOfBirth: "",
    email: "",
    safetyConcerns: [],
    cancerType: "",
    treatmentStage: "",
    sideEffects: "",
    energyLevel: "",
    confidence: "",
    movementPreferences: "",
    consent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const submitSafetyCheck = useMutation({
    mutationFn: (data: SafetyCheckData) => {
      return apiRequest('POST', addDemoParam('/api/patient/safety-check'), data);
    },
    onSuccess: (data: any) => {
      setIsSubmitting(false);
      
      // Determine if there are safety concerns that need medical clearance
      // In a real implementation, this would come from the server response
      // For demo purposes, we'll calculate it based on safety concerns
      const hasSafetyConcerns = formData.safetyConcerns.length > 0;
      
      if (hasSafetyConcerns) {
        toast({
          title: "Medical consultation recommended",
          description: "Based on your responses, we recommend consulting with your healthcare provider before proceeding.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Safety check completed",
          description: "You can now proceed with your detailed assessment.",
        });
      }
      
      // Notify parent component of completion and safety status
      onComplete(!hasSafetyConcerns);
    },
    onError: (error) => {
      console.error("Safety check submission error:", error);
      setIsSubmitting(false);
      toast({
        title: "Submission error",
        description: "There was a problem saving your safety check. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const updateFormData = (field: keyof SafetyCheckData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const toggleSafetyConcern = (item: string) => {
    const currentList = [...formData.safetyConcerns];
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    
    updateFormData('safetyConcerns', newList);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast({
        title: "Consent required",
        description: "Please confirm your consent to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    submitSafetyCheck.mutate(formData);
  };
  
  // Calculate if any safety concerns are present
  const hasSafetyConcerns = formData.safetyConcerns.length > 0;
  
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Nowercise Safety Check</CardTitle>
          <CardDescription>
            Help us ensure exercise is safe for your current situation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    placeholder="DD/MM/YYYY"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>General Safety Check (tick any that apply)</Label>
                <div className="grid gap-2">
                  {[
                    { id: "DoctorAdvisedNoExercise", label: "A doctor has advised me not to exercise" },
                    { id: "ChestPainOrDizziness", label: "I have chest pain or dizziness during activity" },
                    { id: "BalanceIssues", label: "I have balance issues or a history of falls" },
                    { id: "RecentSurgery", label: "I'm recovering from surgery and haven't been cleared to exercise yet" },
                    { id: "MovementRestrictions", label: "I've been told to avoid specific movements" },
                    { id: "Lymphoedema", label: "I experience swelling or lymphoedema" },
                    { id: "UnsureSafety", label: "I'm unsure if exercise is safe for me right now" }
                  ].map((concern) => (
                    <div key={concern.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`concern-${concern.id}`}
                        checked={formData.safetyConcerns.includes(concern.id)}
                        onCheckedChange={() => toggleSafetyConcern(concern.id)}
                      />
                      <Label htmlFor={`concern-${concern.id}`}>{concern.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cancerType">Type of Cancer</Label>
                <Input 
                  id="cancerType"
                  value={formData.cancerType}
                  onChange={(e) => updateFormData('cancerType', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentStage">Current Health Journey Phase</Label>
                <Select
                  value={formData.treatmentStage}
                  onValueChange={(value) => updateFormData('treatmentStage', value)}
                >
                  <SelectTrigger id="treatmentStage">
                    <SelectValue placeholder="Select your current phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inTreatment">In active care</SelectItem>
                    <SelectItem value="postTreatment">Recently finished treatment</SelectItem>
                    <SelectItem value="livingWith">Living with cancer long-term</SelectItem>
                    <SelectItem value="remission">In remission</SelectItem>
                    <SelectItem value="preferNot">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sideEffects">Side effects or limitations</Label>
                <Textarea 
                  id="sideEffects"
                  placeholder="e.g. fatigue, swelling, pain, etc."
                  value={formData.sideEffects}
                  onChange={(e) => updateFormData('sideEffects', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="energyLevel">Current Energy Level (1-10)</Label>
                <Input 
                  id="energyLevel"
                  placeholder="Enter a number from 1 to 10"
                  value={formData.energyLevel}
                  onChange={(e) => updateFormData('energyLevel', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence in Movement</Label>
                <Select
                  value={formData.confidence}
                  onValueChange={(value) => updateFormData('confidence', value)}
                >
                  <SelectTrigger id="confidence">
                    <SelectValue placeholder="Select your confidence level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notConfident">Not confident</SelectItem>
                    <SelectItem value="unsure">A little unsure</SelectItem>
                    <SelectItem value="prettyConfident">Pretty confident</SelectItem>
                    <SelectItem value="veryConfident">Very confident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="movementPreferences">Any movement types to avoid?</Label>
                <Textarea 
                  id="movementPreferences"
                  placeholder="Please describe any movements you'd like to avoid"
                  value={formData.movementPreferences}
                  onChange={(e) => updateFormData('movementPreferences', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => updateFormData('consent', !!checked)}
                    required
                  />
                  <Label htmlFor="consent">
                    I confirm the above is accurate and I may be asked to check with my healthcare provider before starting.
                  </Label>
                </div>
              </div>
            </div>
            
            {hasSafetyConcerns && (
              <Alert className="mt-4 bg-amber-50 border-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-600">Safety Concerns Noted</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Based on your responses, we may recommend checking with your healthcare provider before starting an exercise program.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !formData.consent}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Safety Check
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}