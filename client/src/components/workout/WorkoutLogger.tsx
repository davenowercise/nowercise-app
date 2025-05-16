import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TierSelector } from './TierSelector';
import { ExerciseLogger, type ExerciseLog } from './ExerciseLogger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WorkoutResult } from '@/utils/exerciseTypes';
import { format } from 'date-fns';
import { Download, Clock, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';

interface WorkoutLoggerProps {
  workout: WorkoutResult;
  onTierChange?: (tier: number) => void;
}

export function WorkoutLogger({ workout, onTierChange }: WorkoutLoggerProps) {
  const [tier, setTier] = useState<number>(workout.tier);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});
  const [userName, setUserName] = useState<string>('');
  
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
  
  // Initialize EmailJS (you would typically do this in a more global location)
  useEffect(() => {
    // This is just a placeholder - user would need to provide their actual EmailJS public key
    // emailjs.init("YOUR_PUBLIC_KEY"); 
  }, []);

  const generateLogContent = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    return [
      `Nowercise Workout Log - ${today}`,
      `Client Name: ${userName || 'Not provided'}`,
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
  };
  
  const downloadLog = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logContent = generateLogContent();
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-log-${today}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const sendEmailLog = () => {
    if (!userName) {
      toast({
        title: "Name Required",
        description: "Please enter your name before sending the log",
        variant: "destructive"
      });
      return;
    }
    
    // To use EmailJS, you would need to set up an account and create a template
    // This is a mock implementation that would need to be replaced with actual EmailJS configuration
    toast({
      title: "Email Feature",
      description: "To enable email functionality, please provide your EmailJS credentials in the settings.",
      variant: "default"
    });
    
    // The actual implementation would look something like this:
    /*
    const templateParams = {
      user_name: userName,
      message: generateLogContent(),
      to_email: "coach@example.com"  // Could be dynamic
    };
    
    emailjs.send(
      'YOUR_SERVICE_ID',  // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
      templateParams,
      'YOUR_PUBLIC_KEY'   // Replace with your EmailJS public key
    )
    .then(() => {
      toast({
        title: "Success!",
        description: "Your workout log has been sent to your coach.",
        variant: "default"
      });
    })
    .catch((error) => {
      toast({
        title: "Email Failed",
        description: "There was a problem sending your log. Please try again later.",
        variant: "destructive"
      });
      console.error("Email error:", error);
    });
    */
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
          <CardTitle className="text-2xl">{workout.sessionTitle}</CardTitle>
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
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Complete these exercises at your own pace, focusing on proper form. Log your progress when done.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Try for an extra rep or two if you're feeling strong on any given exercise</li>
                  <li>Take longer rest periods if needed for your energy level today</li>
                  <li>Focus on quality of movement over quantity of reps</li>
                  <li>Log your progress after each exercise to track improvements</li>
                  <li>Stay hydrated throughout your workout session</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm"><strong>Equipment needed:</strong> Resistance bands, chair, light dumbbells (if available)</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Name input for workout log */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name:</Label>
            <Input 
              id="userName" 
              placeholder="Enter your name" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="max-w-md"
            />
          </div>
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
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button 
            size="lg" 
            className="px-6 py-6 text-lg" 
            onClick={downloadLog}
          >
            <Download className="mr-2 h-5 w-5" />
            Save My Workout Log
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary"
            className="px-6 py-6 text-lg" 
            onClick={sendEmailLog}
          >
            <Send className="mr-2 h-5 w-5" />
            Send My Log via Email
          </Button>
        </div>
      )}
    </div>
  );
}