import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Download, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DayOne() {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Exercise 1 - Chest Press
  const [chestReps, setChestReps] = useState('');
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  const [chestNotes, setChestNotes] = useState('');
  
  // Exercise 2 - Bicep Curls
  const [bicepReps, setBicepReps] = useState('');
  const [bicepRpe, setBicepRpe] = useState('5');
  const [bicepPain, setBicepPain] = useState('0');
  const [bicepNotes, setBicepNotes] = useState('');
  
  // Exercise 3 - Squats
  const [squatReps, setSquatReps] = useState('');
  const [squatRpe, setSquatRpe] = useState('5');
  const [squatPain, setSquatPain] = useState('0');
  const [squatNotes, setSquatNotes] = useState('');
  
  const exerciseData = [
    {
      name: "Seated Chest Press",
      instruction: "Seated chest press with resistance bands",
      reps: chestReps,
      setReps: setChestReps,
      rpe: chestRpe,
      setRpe: setChestRpe,
      pain: chestPain,
      setPain: setChestPain,
      notes: chestNotes,
      setNotes: setChestNotes
    },
    {
      name: "Bicep Curls",
      instruction: "Standing bicep curls with resistance bands",
      reps: bicepReps,
      setReps: setBicepReps,
      rpe: bicepRpe,
      setRpe: setBicepRpe,
      pain: bicepPain,
      setPain: setBicepPain,
      notes: bicepNotes,
      setNotes: setBicepNotes
    },
    {
      name: "Dumbbell Squats",
      instruction: "Dumbbell squats with chair support if needed",
      reps: squatReps,
      setReps: setSquatReps,
      rpe: squatRpe,
      setRpe: setSquatRpe,
      pain: squatPain,
      setPain: setSquatPain,
      notes: squatNotes,
      setNotes: setSquatNotes
    }
  ];
  
  const nextStep = () => {
    if (step === 0 && !name) {
      toast({
        title: "Please enter your name",
        variant: "destructive"
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 3) {
      // Complete the workout
      setIsComplete(true);
      toast({
        title: "Workout logged successfully!",
        description: "Your progress has been saved"
      });
    } else {
      // Go to next step
      nextStep();
    }
  };
  
  const downloadLog = () => {
    const logText = `
Nowercise Workout Log - Day 1
Date: ${new Date().toLocaleDateString()}
Name: ${name}

Exercise Summary:
----------------
1. Seated Chest Press:
   Reps: ${chestReps || '-'}
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   Notes: ${chestNotes || 'None'}

2. Bicep Curls:
   Reps: ${bicepReps || '-'}
   RPE: ${bicepRpe}/10
   Pain: ${bicepPain}/10
   Notes: ${bicepNotes || 'None'}
   
3. Dumbbell Squats:
   Reps: ${squatReps || '-'}
   RPE: ${squatRpe}/10
   Pain: ${squatPain}/10
   Notes: ${squatNotes || 'None'}

Small Wins Matter!
    `;
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nowercise_log_day1_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Render summary view
  if (isComplete) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Workout Complete!</h1>
        <p className="mb-6">Great job, {name}! You've completed your Day 1 workout.</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-bold mb-2">Workout Summary</h2>
          <p><strong>Exercise 1:</strong> Chest Press ({chestReps || '-'} reps)</p>
          <p><strong>Exercise 2:</strong> Bicep Curls ({bicepReps || '-'} reps)</p>
          <p><strong>Exercise 3:</strong> Dumbbell Squats ({squatReps || '-'} reps)</p>
        </div>
        
        <Button onClick={downloadLog} className="w-full mb-2">
          <Download className="mr-2 h-4 w-4" />
          Download Log
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setIsComplete(false)} 
          className="w-full"
        >
          Back to Workout
        </Button>
      </div>
    );
  }
  
  // Name entry view
  if (step === 0) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Day 1 – Full Body Start</h1>
        <p className="text-gray-600 mb-6">Today's focus: Seated Chest Press, Bicep Curls, Dumbbell Squats</p>
        
        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <Label htmlFor="name" className="text-lg font-medium">Enter Your Name:</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-2"
            />
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
            <Button 
              type="submit" 
              className="w-full py-6 shadow-lg font-bold"
              style={{backgroundColor: "#4ade80", color: "black"}}
              disabled={!name}
            >
              <ChevronRight className="mr-2 h-5 w-5" />
              START WORKOUT
            </Button>
          </div>
          <div className="h-24"></div>
        </form>
      </div>
    );
  }
  
  // Exercise views (steps 1-3)
  if (step >= 1 && step <= 3) {
    const exercise = exerciseData[step - 1];
    
    return (
      <div className="container mx-auto py-6 px-4 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Exercise {step}/3</h1>
            <div className="text-sm text-gray-500">Step {step+1} of 4</div>
          </div>
          
          <h2 className="text-2xl font-medium">{exercise.name}</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-center text-gray-600 p-4">
              Exercise demonstration would appear here.<br/>
              <span className="text-sm">{exercise.instruction}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="reps">Reps Completed:</Label>
              <Input 
                id="reps" 
                value={exercise.reps}
                onChange={(e) => exercise.setReps(e.target.value)}
                placeholder="e.g. 10"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="rpe">
                RPE (1-10):
                <span className="ml-1 text-xs text-gray-500">(Rate of Perceived Exertion)</span>
              </Label>
              <div className="flex items-center mt-1">
                <input 
                  id="rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={exercise.rpe}
                  onChange={(e) => exercise.setRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{exercise.rpe}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Hard</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="pain">
                Pain Level (0-10):
                <span className="ml-1 text-xs text-gray-500">(0 = no pain, 10 = severe)</span>
              </Label>
              <div className="flex items-center mt-1">
                <input 
                  id="pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={exercise.pain}
                  onChange={(e) => exercise.setPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 font-medium w-6">{exercise.pain}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None</span>
                <span>Severe</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes:</Label>
              <Textarea 
                id="notes" 
                value={exercise.notes}
                onChange={(e) => exercise.setNotes(e.target.value)}
                placeholder="Any comments about this exercise..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50 flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              className="py-6 shadow-lg font-bold flex-1"
              onClick={prevStep}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              BACK
            </Button>
            <Button 
              type="submit" 
              className="py-6 shadow-lg font-bold flex-1"
              style={{backgroundColor: "#4ade80", color: "black"}}
            >
              {step === 3 ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  COMPLETE
                </>
              ) : (
                <>
                  <ChevronRight className="mr-2 h-5 w-5" />
                  NEXT
                </>
              )}
            </Button>
          </div>
          <div className="h-24"></div>
        </form>
      </div>
    );
  }
  
  // Fallback (should not reach here)
  return null;
}