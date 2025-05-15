import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { createWorkoutFromTier } from '@/utils/createWorkoutFromTier';

interface OnboardingWorkoutDisplayProps {
  onboardingResult: {
    recommendedTier: number;
    treatmentPhase?: string;
    cancerType?: string;
    medicalClearanceRequired?: boolean;
    safetyFlag?: boolean;
  };
}

export default function OnboardingWorkoutDisplay({ onboardingResult }: OnboardingWorkoutDisplayProps) {
  const { 
    recommendedTier, 
    treatmentPhase = 'Post-Treatment', 
    cancerType, 
    medicalClearanceRequired = false,
    safetyFlag = false
  } = onboardingResult;
  
  // Create a workout plan based on the onboarding result
  const workoutResult = createWorkoutFromTier({
    tier: recommendedTier,
    treatmentPhase,
    cancerType,
    flagged: safetyFlag,
    medicalClearanceRequired
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold">{workoutResult.sessionTitle}</h3>
          <p className="text-sm text-muted-foreground">
            Generated on {workoutResult.date}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            Tier {workoutResult.tier}
          </Badge>
          
          {workoutResult.cancerType && (
            <Badge variant="outline" className="bg-blue-50">
              {workoutResult.cancerType} cancer
            </Badge>
          )}
          
          <Badge variant="outline" className="bg-yellow-50">
            {workoutResult.treatmentPhase}
          </Badge>
        </div>
      </div>
      
      {workoutResult.warning ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {workoutResult.warning}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Personalized Workout</CardTitle>
            <CardDescription>
              Tailored to your current health status and treatment phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workoutResult.exercises?.map((step, index) => (
                <div key={index} className={`${index > 0 ? 'pt-3' : ''}`}>
                  {index > 0 && <Separator className="mb-3" />}
                  <div className="font-medium">{step.step}</div>
                  <div className="text-sm text-muted-foreground">{step.detail}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700">
        <p className="font-medium mb-1">About Your Plan</p>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>
            This workout is adapted to Tier {workoutResult.tier} based on your onboarding assessment
          </li>
          <li>
            {workoutResult.treatmentPhase} phase considerations have been applied
          </li>
          {workoutResult.cancerType && (
            <li>
              Includes {workoutResult.cancerType} cancer-specific exercise adaptations
            </li>
          )}
          <li>
            Always respect your body and stop if you experience pain or discomfort
          </li>
        </ul>
      </div>
    </div>
  );
}