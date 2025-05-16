import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TierSelector } from './TierSelector';
import { ExerciseLogger, type ExerciseLog } from './ExerciseLogger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WorkoutResult } from '@/utils/exerciseTypes';
import { format } from 'date-fns';
import { Download, Clock } from 'lucide-react';

interface WorkoutLoggerProps {
  workout: WorkoutResult;
  onTierChange?: (tier: number) => void;
}

export function WorkoutLogger({ workout, onTierChange }: WorkoutLoggerProps) {
  const [tier, setTier] = useState<number>(workout.tier);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});
  
  // Calculate estimated workout time
  const getEstimatedTime = () => {
    if (!workout.exercises) return '0 minutes';
    const baseTime = tier * 10 + workout.exercises.length * 3;
    return `${baseTime} minutes`;
  };
  
  const handleTierChange = (newTier: number) => {
    setTier(newTier);
    onTierChange?.(newTier);
  };
  
  const handleExerciseLogChange = (exerciseName: string, log: ExerciseLog) => {
    setExerciseLogs(prev => ({
      ...prev,
      [exerciseName]: log
    }));
  };
  
  const downloadLog = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const logContent = [
      `Nowercise Workout Log - ${today}`,
      `Client Name: Demo User`,
      `Workout: ${workout.sessionTitle}`,
      `Tier: ${tier} - ${workout.treatmentPhase} Phase`,
      `Date: ${today}`,
      `\n--- Exercise Logs ---\n`,
      ...Object.values(exerciseLogs).map(log => 
        [
          `Exercise: ${log.exerciseName}`,
          `Reps Completed: ${log.repsCompleted || 'Not recorded'}`,
          `RPE (1-10): ${log.rpe || 'Not recorded'}`,
          `Pain Level (0-10): ${log.painLevel || 'Not recorded'}`,
          `Notes: ${log.notes || 'None'}`,
          `\n`
        ].join('\n')
      )
    ].join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-log-${today}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Convert exercise steps to more structured objects for the logger
  const formatExercises = () => {
    if (!workout.exercises) return [];
    
    return workout.exercises.filter(step => 
      // Skip rest steps
      !step.step.toLowerCase().includes('rest')
    ).map(step => {
      // Extract exercise name (removing the emoji and any dash)
      const name = step.step.replace(/🔸|🔹|\s–\s/g, '').trim();
      
      // Parse instructions from detail
      const instructions = step.detail.split('•')[0].trim().split(/\.|\\n/).filter(Boolean).map(s => s.trim());
      
      // Parse sets and reps from detail if available
      let sets = 2;
      let reps = "8-12";
      
      const repsMatch = step.detail.match(/(\d+)\s*sets\s*x\s*([^•]+)/i);
      if (repsMatch) {
        sets = parseInt(repsMatch[1]);
        reps = repsMatch[2].trim();
      }
      
      return {
        name,
        instructions,
        sets,
        reps,
        // Video would come from the exercise data
        videoUrl: null
      };
    });
  };
  
  const exercises = formatExercises();
  
  return (
    <div className="space-y-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{workout.sessionTitle}</CardTitle>
          <CardDescription>
            {workout.cancerType && `${workout.cancerType.charAt(0).toUpperCase() + workout.cancerType.slice(1)} cancer`} - {workout.treatmentPhase} phase
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="h-4 w-4" />
            <span>Estimated time: {getEstimatedTime()}</span>
          </div>
          
          {workout.warning ? (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-200">
              {workout.warning}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete these exercises at your own pace, focusing on proper form. Log your progress when done.
            </p>
          )}
        </CardContent>
      </Card>
      
      <TierSelector selectedTier={tier} onChange={handleTierChange} />
      
      {!workout.warning && exercises.map((exercise, index) => (
        <ExerciseLogger
          key={`${exercise.name}-${index}`}
          name={exercise.name}
          instructions={exercise.instructions}
          sets={exercise.sets}
          reps={exercise.reps}
          videoUrl={exercise.videoUrl}
          onChange={(log) => handleExerciseLogChange(exercise.name, log)}
        />
      ))}
      
      {!workout.warning && exercises.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="px-6 py-6 text-lg" 
            onClick={downloadLog}
          >
            <Download className="mr-2 h-5 w-5" />
            Save My Workout Log
          </Button>
        </div>
      )}
    </div>
  );
}