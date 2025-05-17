import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Send, Plus, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DayOne() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise 1 - Dumbbell Squats
  const [squatSets, setSquatSets] = useState([{ reps: '' }]);
  const [squatRpe, setSquatRpe] = useState('5');
  const [squatPain, setSquatPain] = useState('0');
  
  // Exercise 2 - Chest Press
  const [chestSets, setChestSets] = useState([{ reps: '' }]);
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  
  // Exercise 3 - Glute Bridge
  const [gluteSets, setGluteSets] = useState([{ reps: '' }]);
  const [gluteRpe, setGluteRpe] = useState('5');
  const [glutePain, setGlutePain] = useState('0');
  
  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  
  // Add a new set for an exercise
  const addSet = (exercise: string) => {
    if (exercise === 'squat') {
      setSquatSets([...squatSets, { reps: '' }]);
    } else if (exercise === 'chest') {
      setChestSets([...chestSets, { reps: '' }]);
    } else if (exercise === 'glute') {
      setGluteSets([...gluteSets, { reps: '' }]);
    }
  };
  
  // Remove a set from an exercise
  const removeSet = (exercise: string, index: number) => {
    if (exercise === 'squat' && squatSets.length > 1) {
      const newSets = [...squatSets];
      newSets.splice(index, 1);
      setSquatSets(newSets);
    } else if (exercise === 'chest' && chestSets.length > 1) {
      const newSets = [...chestSets];
      newSets.splice(index, 1);
      setChestSets(newSets);
    } else if (exercise === 'glute' && gluteSets.length > 1) {
      const newSets = [...gluteSets];
      newSets.splice(index, 1);
      setGluteSets(newSets);
    }
  };
  
  // Update reps for a specific set
  const updateReps = (exercise: string, index: number, reps: string) => {
    if (exercise === 'squat') {
      const newSets = [...squatSets];
      newSets[index].reps = reps;
      setSquatSets(newSets);
    } else if (exercise === 'chest') {
      const newSets = [...chestSets];
      newSets[index].reps = reps;
      setChestSets(newSets);
    } else if (exercise === 'glute') {
      const newSets = [...gluteSets];
      newSets[index].reps = reps;
      setGluteSets(newSets);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Please enter your name",
        description: "Your name is required for tracking",
        variant: "destructive"
      });
      return;
    }
    
    setIsComplete(true);
    toast({
      title: "Workout logged successfully!",
      description: "Great job completing your exercise!",
    });
  };
  
  const downloadLog = () => {
    const logText = `
Nowercise Workout Log - Day 1
Date: ${new Date().toLocaleDateString()}
Name: ${name}

Exercise Summary:
----------------
1. Dumbbell Squats:
${squatSets.map((set, i) => `   Set ${i+1}: ${set.reps || '-'} reps`).join('\n')}
   RPE: ${squatRpe}/10
   Pain: ${squatPain}/10

2. Seated Chest Press:
${chestSets.map((set, i) => `   Set ${i+1}: ${set.reps || '-'} reps`).join('\n')}
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   
3. Single Leg Glute Bridge:
${gluteSets.map((set, i) => `   Set ${i+1}: ${set.reps || '-'} reps`).join('\n')}
   RPE: ${gluteRpe}/10
   Pain: ${glutePain}/10

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
  
  // Show completion screen
  if (isComplete) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Workout Complete!</h1>
        <p className="mb-4">Great job, {name}!</p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-bold mb-2">Workout Summary</h2>
          <div className="space-y-3">
            <div>
              <p><strong>Dumbbell Squats:</strong></p>
              {squatSets.map((set, i) => (
                <p key={i} className="text-sm">Set {i+1}: {set.reps || '-'} reps</p>
              ))}
              <p className="text-sm">RPE: {squatRpe}/10 | Pain: {squatPain}/10</p>
            </div>
            
            <div>
              <p><strong>Seated Chest Press:</strong></p>
              {chestSets.map((set, i) => (
                <p key={i} className="text-sm">Set {i+1}: {set.reps || '-'} reps</p>
              ))}
              <p className="text-sm">RPE: {chestRpe}/10 | Pain: {chestPain}/10</p>
            </div>
            
            <div>
              <p><strong>Single Leg Glute Bridge:</strong></p>
              {gluteSets.map((set, i) => (
                <p key={i} className="text-sm">Set {i+1}: {set.reps || '-'} reps</p>
              ))}
              <p className="text-sm">RPE: {gluteRpe}/10 | Pain: {glutePain}/10</p>
            </div>
          </div>
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
  
  // Multi-set workout form
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Day 1 Workout</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="name">Name:</Label>
          <Input 
            id="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
          />
        </div>
        
        {/* Exercise 1 - Squats */}
        <div className="bg-white p-3 rounded mb-3">
          <h2 className="font-medium">Dumbbell Squats</h2>
          
          {squatSets.map((set, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Label htmlFor={`squat-set${index}`} className="w-14 text-xs">Set {index+1}:</Label>
              <Input 
                id={`squat-set${index}`} 
                type="number"
                value={set.reps}
                onChange={(e) => updateReps('squat', index, e.target.value)}
                placeholder="Reps"
                className="h-8"
              />
              {index > 0 && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => removeSet('squat', index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="mb-3 text-xs py-1 h-7"
            onClick={() => addSet('squat')}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Set
          </Button>
          
          <div className="mb-2">
            <div className="flex items-center">
              <Label htmlFor="squat-rpe" className="w-10 text-sm">RPE:</Label>
              <input 
                id="squat-rpe" 
                type="range" 
                min="1" 
                max="10" 
                value={squatRpe}
                onChange={(e) => setSquatRpe(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{squatRpe}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <Label htmlFor="squat-pain" className="w-10 text-sm">Pain:</Label>
              <input 
                id="squat-pain" 
                type="range" 
                min="0" 
                max="10" 
                value={squatPain}
                onChange={(e) => setSquatPain(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{squatPain}</span>
            </div>
          </div>
        </div>
        
        {/* Exercise 2 - Chest Press */}
        <div className="bg-white p-3 rounded mb-3">
          <h2 className="font-medium">Seated Chest Press</h2>
          
          {chestSets.map((set, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Label htmlFor={`chest-set${index}`} className="w-14 text-xs">Set {index+1}:</Label>
              <Input 
                id={`chest-set${index}`} 
                type="number"
                value={set.reps}
                onChange={(e) => updateReps('chest', index, e.target.value)}
                placeholder="Reps"
                className="h-8"
              />
              {index > 0 && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => removeSet('chest', index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="mb-3 text-xs py-1 h-7"
            onClick={() => addSet('chest')}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Set
          </Button>
          
          <div className="mb-2">
            <div className="flex items-center">
              <Label htmlFor="chest-rpe" className="w-10 text-sm">RPE:</Label>
              <input 
                id="chest-rpe" 
                type="range" 
                min="1" 
                max="10" 
                value={chestRpe}
                onChange={(e) => setChestRpe(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{chestRpe}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <Label htmlFor="chest-pain" className="w-10 text-sm">Pain:</Label>
              <input 
                id="chest-pain" 
                type="range" 
                min="0" 
                max="10" 
                value={chestPain}
                onChange={(e) => setChestPain(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{chestPain}</span>
            </div>
          </div>
        </div>
        
        {/* Exercise 3 - Glute Bridge */}
        <div className="bg-white p-3 rounded mb-4">
          <h2 className="font-medium">Single Leg Glute Bridge</h2>
          
          {gluteSets.map((set, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Label htmlFor={`glute-set${index}`} className="w-14 text-xs">Set {index+1}:</Label>
              <Input 
                id={`glute-set${index}`} 
                type="number"
                value={set.reps}
                onChange={(e) => updateReps('glute', index, e.target.value)}
                placeholder="Reps"
                className="h-8"
              />
              {index > 0 && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => removeSet('glute', index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="mb-3 text-xs py-1 h-7"
            onClick={() => addSet('glute')}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Set
          </Button>
          
          <div className="mb-2">
            <div className="flex items-center">
              <Label htmlFor="glute-rpe" className="w-10 text-sm">RPE:</Label>
              <input 
                id="glute-rpe" 
                type="range" 
                min="1" 
                max="10" 
                value={gluteRpe}
                onChange={(e) => setGluteRpe(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{gluteRpe}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <Label htmlFor="glute-pain" className="w-10 text-sm">Pain:</Label>
              <input 
                id="glute-pain" 
                type="range" 
                min="0" 
                max="10" 
                value={glutePain}
                onChange={(e) => setGlutePain(e.target.value)}
                className="flex-1"
              />
              <span className="ml-2 w-6 text-sm">{glutePain}</span>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-3 font-medium"
          style={{backgroundColor: "#4ade80", color: "black"}}
        >
          <Send className="mr-2 h-4 w-4" />
          SEND WORKOUT LOG
        </Button>
      </form>
    </div>
  );
}