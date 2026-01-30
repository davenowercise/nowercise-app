import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight, Heart, Shield, Leaf } from "lucide-react";

type OnboardingStep = "welcome" | "surgery" | "treatment" | "movement" | "red-flags" | "complete";

interface OnboardingData {
  surgeryType?: string;
  axillarySurgery?: string;
  surgeryDate?: string;
  currentTreatments: string[];
  movementReadiness?: string;
  shoulderRestriction: boolean;
  neuropathy: boolean;
  fatigueBaseline?: number;
  redFlagsChecked: boolean;
  hasActiveRedFlags: boolean;
}

const RED_FLAGS = [
  { id: "fever", label: "Fever or signs of infection at the surgery site" },
  { id: "chest_pain", label: "Chest pain or difficulty breathing" },
  { id: "severe_swelling", label: "Sudden severe swelling in arm or hand" },
  { id: "bleeding", label: "Unexpected bleeding from the surgery site" },
  { id: "severe_pain", label: "Severe pain that is not controlled by medication" }
];

export default function PathwayOnboarding() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    currentTreatments: [],
    shoulderRestriction: false,
    neuropathy: false,
    redFlagsChecked: false,
    hasActiveRedFlags: false
  });
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>({});

  const createAssignment = useMutation({
    mutationFn: async (assignmentData: OnboardingData) => {
      return apiRequest("/api/pathway/assignment", {
        method: "POST",
        data: {
          pathwayId: "breast_cancer",
          cancerType: "breast",
          ...assignmentData
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pathway/assignment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pathway/today"] });
      setStep("complete");
    }
  });

  const steps: OnboardingStep[] = ["welcome", "surgery", "treatment", "movement", "red-flags", "complete"];
  const currentStepIndex = steps.indexOf(step);
  const progressPercent = ((currentStepIndex) / (steps.length - 1)) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      if (step === "red-flags") {
        const hasRedFlags = Object.values(redFlagAnswers).some(v => v);
        setData(prev => ({
          ...prev,
          redFlagsChecked: true,
          hasActiveRedFlags: hasRedFlags
        }));
        createAssignment.mutate({
          ...data,
          redFlagsChecked: true,
          hasActiveRedFlags: hasRedFlags
        });
      } else {
        setStep(steps[nextIndex]);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "welcome":
        return true;
      case "surgery":
        return data.surgeryType && data.surgeryDate;
      case "treatment":
        return true;
      case "movement":
        return data.movementReadiness;
      case "red-flags":
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-info-panel to-white dark:from-gray-900 dark:to-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {step !== "welcome" && step !== "complete" && (
          <div className="mb-8">
            <Progress value={progressPercent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Step {currentStepIndex} of {steps.length - 2}
            </p>
          </div>
        )}

        {step === "welcome" && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-info-panel dark:bg-action-blue/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-action-blue dark:text-accent-blue" />
              </div>
              <CardTitle className="text-2xl">Welcome to Your Recovery Journey</CardTitle>
              <CardDescription className="text-base mt-2">
                You've taken a big step toward healing. Let's set up a gentle movement plan 
                that works for you, at your pace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-info-panel dark:bg-action-blue/10 rounded-lg p-4">
                <h3 className="font-medium text-action-blue dark:text-accent-blue mb-2">
                  What to expect:
                </h3>
                <ul className="space-y-2 text-sm text-accent-blue dark:text-accent-blue">
                  <li className="flex items-start gap-2">
                    <Leaf className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Gentle sessions adapted to how you're feeling each day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Rest is celebrated as part of recovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>No pressure, no guilt - just kind guidance</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleNext} 
                className="w-full bg-action-blue hover:bg-action-blue-hover"
                size="lg"
                data-testid="button-start-onboarding"
              >
                Let's Begin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "surgery" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>About Your Surgery</CardTitle>
              <CardDescription>
                This helps us create a safe plan that respects your body's healing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">What type of surgery did you have?</Label>
                <RadioGroup
                  value={data.surgeryType}
                  onValueChange={(value) => setData(prev => ({ ...prev, surgeryType: value }))}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="lumpectomy" id="lumpectomy" />
                    <Label htmlFor="lumpectomy" className="cursor-pointer flex-1">
                      Lumpectomy (breast-conserving surgery)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="mastectomy" id="mastectomy" />
                    <Label htmlFor="mastectomy" className="cursor-pointer flex-1">
                      Mastectomy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="mastectomy_reconstruction" id="mastectomy_reconstruction" />
                    <Label htmlFor="mastectomy_reconstruction" className="cursor-pointer flex-1">
                      Mastectomy with reconstruction
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">When was your surgery?</Label>
                <Input
                  type="date"
                  value={data.surgeryDate || ""}
                  onChange={(e) => setData(prev => ({ ...prev, surgeryDate: e.target.value }))}
                  className="w-full"
                  data-testid="input-surgery-date"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base">Did you have lymph node surgery?</Label>
                <RadioGroup
                  value={data.axillarySurgery}
                  onValueChange={(value) => setData(prev => ({ ...prev, axillarySurgery: value }))}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="cursor-pointer flex-1">
                      No lymph node surgery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="sentinel_node_biopsy" id="sentinel" />
                    <Label htmlFor="sentinel" className="cursor-pointer flex-1">
                      Sentinel lymph node biopsy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="axillary_node_clearance" id="axillary" />
                    <Label htmlFor="axillary" className="cursor-pointer flex-1">
                      Axillary lymph node clearance (ALND)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                  className="flex-1 bg-action-blue hover:bg-action-blue-hover"
                  data-testid="button-next-surgery"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "treatment" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Current Treatment</CardTitle>
              <CardDescription>
                Are you currently receiving any of these treatments? (Select all that apply)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { id: "chemo", label: "Chemotherapy" },
                  { id: "radiotherapy", label: "Radiotherapy" },
                  { id: "hormone_therapy", label: "Hormone therapy" },
                  { id: "none", label: "None currently" }
                ].map((treatment) => (
                  <div 
                    key={treatment.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={treatment.id}
                      checked={data.currentTreatments.includes(treatment.id)}
                      onCheckedChange={(checked) => {
                        setData(prev => ({
                          ...prev,
                          currentTreatments: checked
                            ? [...prev.currentTreatments.filter(t => t !== "none"), treatment.id]
                            : prev.currentTreatments.filter(t => t !== treatment.id)
                        }));
                        if (treatment.id === "none" && checked) {
                          setData(prev => ({ ...prev, currentTreatments: ["none"] }));
                        }
                      }}
                    />
                    <Label htmlFor={treatment.id} className="cursor-pointer flex-1">
                      {treatment.label}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label className="text-base">Do you have any of these?</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <Checkbox
                      id="shoulder"
                      checked={data.shoulderRestriction}
                      onCheckedChange={(checked) => 
                        setData(prev => ({ ...prev, shoulderRestriction: checked === true }))
                      }
                    />
                    <Label htmlFor="shoulder" className="cursor-pointer flex-1">
                      Limited shoulder movement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
                    <Checkbox
                      id="neuropathy"
                      checked={data.neuropathy}
                      onCheckedChange={(checked) => 
                        setData(prev => ({ ...prev, neuropathy: checked === true }))
                      }
                    />
                    <Label htmlFor="neuropathy" className="cursor-pointer flex-1">
                      Numbness or tingling in hands/feet (neuropathy)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className="flex-1 bg-action-blue hover:bg-action-blue-hover"
                  data-testid="button-next-treatment"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "movement" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>How are you feeling about movement?</CardTitle>
              <CardDescription>
                There's no right or wrong answer. We'll meet you where you are.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={data.movementReadiness}
                onValueChange={(value) => setData(prev => ({ ...prev, movementReadiness: value }))}
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="very_cautious" id="very_cautious" className="mt-1" />
                  <Label htmlFor="very_cautious" className="cursor-pointer flex-1">
                    <span className="font-medium block">Very cautious</span>
                    <span className="text-sm text-muted-foreground">
                      I'm nervous about moving and want to take things very slowly
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="some_confidence" id="some_confidence" className="mt-1" />
                  <Label htmlFor="some_confidence" className="cursor-pointer flex-1">
                    <span className="font-medium block">Some confidence</span>
                    <span className="text-sm text-muted-foreground">
                      I'm a bit nervous but willing to try gentle movements
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="confident" id="confident" className="mt-1" />
                  <Label htmlFor="confident" className="cursor-pointer flex-1">
                    <span className="font-medium block">Feeling ready</span>
                    <span className="text-sm text-muted-foreground">
                      I'm ready to start moving and feeling stronger
                    </span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-action-blue hover:bg-action-blue-hover"
                  data-testid="button-next-movement"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "red-flags" && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-center">Safety Check</CardTitle>
              <CardDescription className="text-center">
                Before we begin, let's make sure it's safe to start gentle movement. 
                Please let us know if you're experiencing any of these.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {RED_FLAGS.map((flag) => (
                  <div 
                    key={flag.id}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50"
                  >
                    <Checkbox
                      id={flag.id}
                      checked={redFlagAnswers[flag.id] || false}
                      onCheckedChange={(checked) => 
                        setRedFlagAnswers(prev => ({ ...prev, [flag.id]: checked === true }))
                      }
                    />
                    <Label htmlFor={flag.id} className="cursor-pointer flex-1 text-sm">
                      {flag.label}
                    </Label>
                  </div>
                ))}
              </div>

              {Object.values(redFlagAnswers).some(v => v) && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Thank you for letting us know. We'll flag this for your care team to review, 
                    and we'll suggest very gentle options until you get the all-clear.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  className="flex-1 bg-action-blue hover:bg-action-blue-hover"
                  disabled={createAssignment.isPending}
                  data-testid="button-complete-onboarding"
                >
                  {createAssignment.isPending ? "Setting up..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "complete" && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-info-panel dark:bg-action-blue/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-action-blue dark:text-accent-blue" />
              </div>
              <CardTitle className="text-2xl">You're All Set</CardTitle>
              <CardDescription className="text-base mt-2">
                Your personalized recovery plan is ready. We'll guide you day by day, 
                at your pace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-info-panel dark:bg-action-blue/10 rounded-lg p-4">
                <h3 className="font-medium text-action-blue dark:text-accent-blue mb-2">
                  What happens next:
                </h3>
                <ul className="space-y-2 text-sm text-accent-blue dark:text-accent-blue">
                  <li>• Each day, we'll suggest a gentle activity based on how you're feeling</li>
                  <li>• You can always choose to rest - that's recovery too</li>
                  <li>• Your progress will be gentle and at your own pace</li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate("/patient-dashboard")} 
                className="w-full bg-action-blue hover:bg-action-blue-hover"
                size="lg"
                data-testid="button-go-to-dashboard"
              >
                Go to My Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
