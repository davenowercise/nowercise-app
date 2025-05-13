import React from "react";
import { PatientAssessmentForm } from "@/components/assessment/assessment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssessmentPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
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
      
      <PatientAssessmentForm />
      
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