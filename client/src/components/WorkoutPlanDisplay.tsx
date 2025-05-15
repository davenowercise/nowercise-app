import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { generateWorkoutPlan, generateWeeklyPlan, type WorkoutStep, type WorkoutPlanOptions } from '@/utils/generateWorkoutPlan';

interface WorkoutPlanDisplayProps {
  tier?: number;
  preferences?: WorkoutPlanOptions;
  cancerType?: string;
  showWeeklySchedule?: boolean;
}

export default function WorkoutPlanDisplay({ 
  tier = 2, 
  preferences = {}, 
  cancerType,
  showWeeklySchedule = false
}: WorkoutPlanDisplayProps) {
  // If cancer type is provided, include it in preferences
  const workoutPreferences = cancerType 
    ? { ...preferences, cancerType } 
    : preferences;
  
  // Generate workout plan
  const workoutSteps = generateWorkoutPlan(tier, workoutPreferences);
  
  // Generate weekly schedule if requested
  const weeklyPlan = showWeeklySchedule ? generateWeeklyPlan(tier) : null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Tier {tier} Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workoutSteps.map((step, index) => (
              <div key={index} className={`${index > 0 ? 'pt-3' : ''}`}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="font-medium">{step.step}</div>
                <div className="text-sm text-muted-foreground">{step.detail}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showWeeklySchedule && weeklyPlan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              Weekly Exercise Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <span className="text-muted-foreground">Recommended frequency: </span>
              <span className="font-medium">{weeklyPlan.daysPerWeek} days per week</span>
            </div>
            
            <div className="space-y-3">
              {weeklyPlan.workouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 font-medium">{workout.day}</div>
                  <div className="flex-1">{workout.focus}</div>
                  <div className="flex-1 text-right text-muted-foreground">{workout.duration} min</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}