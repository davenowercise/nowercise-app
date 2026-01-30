import React, { useState } from "react";
import { PatientAssessmentForm } from "@/components/assessment/assessment-form";
import { SafetyCheck } from "@/components/assessment/safety-check";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AssessmentPage() {
  const [safetyCheckComplete, setSafetyCheckComplete] = useState(false);
  const [safeToExercise, setSafeToExercise] = useState(true);
  
  const handleSafetyCheckComplete = (isSafe: boolean) => {
    setSafetyCheckComplete(true);
    setSafeToExercise(isSafe);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 bg-gradient-to-r from-info-panel to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Personalized Health Assessment</CardTitle>
          <CardDescription className="text-center max-w-3xl mx-auto">
            This assessment helps us understand your unique needs as a cancer patient.
            With this information, we can provide personalized exercise recommendations 
            that are safe and effective for your specific situation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-center mb-6 text-muted-foreground">
            <p>All information is kept confidential and will only be shared with your healthcare providers.</p>
          </div>
        </CardContent>
      </Card>
      
      {!safetyCheckComplete ? (
        // Step 1: Safety Check (PAR-Q style form)
        <SafetyCheck onComplete={handleSafetyCheckComplete} />
      ) : !safeToExercise ? (
        // Show warning for users who need medical clearance
        <div className="my-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Medical Consultation Recommended</AlertTitle>
            <AlertDescription>
              Based on your responses, we recommend checking with your healthcare provider before starting
              an exercise program. Your safety is our top priority.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
              <p className="mb-4">
                Please consult with your healthcare provider about your interest in starting an exercise program.
                Ask them about any specific precautions or modifications you should follow.
              </p>
              <p className="mb-6">
                Once you have medical clearance, you can return to complete the detailed assessment.
              </p>
              
              <Button 
                onClick={() => setSafetyCheckComplete(false)}
                variant="outline"
                className="mr-4"
              >
                Go Back to Safety Check
              </Button>
              
              <Button 
                onClick={() => {
                  setSafeToExercise(true);
                }}
              >
                I Have Medical Clearance
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Step 2: Detailed Assessment Form
        <PatientAssessmentForm />
      )}
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          <strong>Nowercise</strong> - Small Wins Matter
          <br />
          Creating personalized exercise programs for cancer patients.
        </p>
      </div>
    </div>
  );
}