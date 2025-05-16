import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ParqData } from '@shared/types';

// PAR-Q+ questions based on the official PAR-Q+ form
const PARQ_QUESTIONS = [
  "Has your doctor ever said that you have a heart condition OR high blood pressure?",
  "Do you feel pain in your chest at rest, during your daily activities of living, OR when you do physical activity?",
  "Do you lose balance because of dizziness OR have you lost consciousness in the last 12 months?",
  "Have you ever been diagnosed with cancer (including leukemia or lymphoma) or are you currently receiving treatment for cancer?",
  "Do you have any other medical condition not listed above or do you have two or more medical conditions?",
  "Are you currently taking prescribed medications for a medical condition?",
  "Do you have bone or joint problems that could be made worse by physical activity?"
];

interface ParqFormProps {
  onComplete: (data: ParqData) => void;
  initialData?: ParqData;
}

export function ParqForm({ onComplete, initialData }: ParqFormProps) {
  const [answers, setAnswers] = useState<("Yes" | "No" | null)[]>(
    initialData?.parqAnswers || Array(PARQ_QUESTIONS.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (index: number, value: "Yes" | "No") => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const isFormComplete = answers.every(answer => answer !== null);
  const hasYesAnswers = answers.some(answer => answer === "Yes");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    setSubmitted(true);
    
    // Create PAR-Q+ data
    const parqData: ParqData = {
      parqAnswers: answers as ("Yes" | "No")[],
      parqRequired: hasYesAnswers
    };
    
    onComplete(parqData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Physical Activity Readiness Questionnaire (PAR-Q+)</CardTitle>
        <CardDescription>
          A screening tool to determine if you should consult with a healthcare provider before 
          increasing your physical activity.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {PARQ_QUESTIONS.map((question, index) => (
            <div key={index} className="border rounded-md p-4 bg-gray-50">
              <div className="font-medium mb-3">{index + 1}. {question}</div>
              <RadioGroup 
                className="flex flex-wrap gap-4 mt-2"
                value={answers[index] || ''}
                onValueChange={(value) => handleAnswerChange(index, value as "Yes" | "No")}
              >
                <div className="flex items-center space-x-2 min-w-[80px]">
                  <RadioGroupItem value="Yes" id={`yes-${index}`} />
                  <Label htmlFor={`yes-${index}`} className="text-base font-medium">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 min-w-[80px]">
                  <RadioGroupItem value="No" id={`no-${index}`} />
                  <Label htmlFor={`no-${index}`} className="text-base font-medium">No</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
          
          {submitted && hasYesAnswers && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Medical clearance may be required</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Based on your responses, we recommend consulting with your healthcare provider 
                  before starting this exercise program.
                </p>
                <p>
                  <a 
                    href="/medical-clearance" 
                    className="text-red-700 underline font-medium hover:text-red-800"
                  >
                    Get help with medical clearance →
                  </a>
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          {submitted && !hasYesAnswers && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Ready for exercise</AlertTitle>
              <AlertDescription className="text-green-700">
                Based on your responses, you can proceed with the exercise program.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={!isFormComplete}
          className="w-full"
        >
          {submitted ? "Update Answers" : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}