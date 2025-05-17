import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DayOne() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise 1 - Dumbbell Squats
  const [squatSet1, setSquatSet1] = useState('');
  const [squatSet2, setSquatSet2] = useState('');
  const [squatSet3, setSquatSet3] = useState('');
  const [squatRpe, setSquatRpe] = useState('5');
  const [squatPain, setSquatPain] = useState('0');
  
  // Exercise 2 - Chest Press
  const [chestSet1, setChestSet1] = useState('');
  const [chestSet2, setChestSet2] = useState('');
  const [chestSet3, setChestSet3] = useState('');
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  
  // Exercise 3 - Glute Bridge
  const [gluteSet1, setGluteSet1] = useState('');
  const [gluteSet2, setGluteSet2] = useState('');
  const [gluteSet3, setGluteSet3] = useState('');
  const [gluteRpe, setGluteRpe] = useState('5');
  const [glutePain, setGlutePain] = useState('0');
  
  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  
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
   Set 1: ${squatSet1 || '-'} reps
   Set 2: ${squatSet2 || '-'} reps
   Set 3: ${squatSet3 || '-'} reps
   RPE: ${squatRpe}/10
   Pain: ${squatPain}/10

2. Seated Chest Press:
   Set 1: ${chestSet1 || '-'} reps
   Set 2: ${chestSet2 || '-'} reps
   Set 3: ${chestSet3 || '-'} reps
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   
3. Single Leg Glute Bridge:
   Set 1: ${gluteSet1 || '-'} reps
   Set 2: ${gluteSet2 || '-'} reps
   Set 3: ${gluteSet3 || '-'} reps
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
              <p className="text-sm">Set 1: {squatSet1 || '-'} reps</p>
              <p className="text-sm">Set 2: {squatSet2 || '-'} reps</p>
              <p className="text-sm">Set 3: {squatSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {squatRpe}/10 | Pain: {squatPain}/10</p>
            </div>
            
            <div>
              <p><strong>Seated Chest Press:</strong></p>
              <p className="text-sm">Set 1: {chestSet1 || '-'} reps</p>
              <p className="text-sm">Set 2: {chestSet2 || '-'} reps</p>
              <p className="text-sm">Set 3: {chestSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {chestRpe}/10 | Pain: {chestPain}/10</p>
            </div>
            
            <div>
              <p><strong>Single Leg Glute Bridge:</strong></p>
              <p className="text-sm">Set 1: {gluteSet1 || '-'} reps</p>
              <p className="text-sm">Set 2: {gluteSet2 || '-'} reps</p>
              <p className="text-sm">Set 3: {gluteSet3 || '-'} reps</p>
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
  
  // Fixed 3-set workout form
  return (
    <div className="p-4 pb-16">
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
          <h2 className="font-medium mb-2">Dumbbell Squats</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="squat-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="squat-set1" 
                type="number"
                value={squatSet1}
                onChange={(e) => setSquatSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="squat-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="squat-set2" 
                type="number"
                value={squatSet2}
                onChange={(e) => setSquatSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="squat-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="squat-set3" 
                type="number"
                value={squatSet3}
                onChange={(e) => setSquatSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="squat-rpe" className="text-xs mb-1">RPE:</Label>
                <div className="flex items-center">
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
            </div>
            
            <div>
              <div className="flex flex-col">
                <Label htmlFor="squat-pain" className="text-xs mb-1">Pain:</Label>
                <div className="flex items-center">
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
          </div>
        </div>
        
        {/* Exercise 2 - Chest Press */}
        <div className="bg-white p-3 rounded mb-3">
          <h2 className="font-medium mb-2">Seated Chest Press</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="chest-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="chest-set1" 
                type="number"
                value={chestSet1}
                onChange={(e) => setChestSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="chest-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="chest-set2" 
                type="number"
                value={chestSet2}
                onChange={(e) => setChestSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="chest-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="chest-set3" 
                type="number"
                value={chestSet3}
                onChange={(e) => setChestSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="chest-rpe" className="text-xs mb-1">RPE:</Label>
                <div className="flex items-center">
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
            </div>
            
            <div>
              <div className="flex flex-col">
                <Label htmlFor="chest-pain" className="text-xs mb-1">Pain:</Label>
                <div className="flex items-center">
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
          </div>
        </div>
        
        {/* Exercise 3 - Glute Bridge */}
        <div className="bg-white p-3 rounded mb-4">
          <h2 className="font-medium mb-2">Single Leg Glute Bridge</h2>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="glute-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="glute-set1" 
                type="number"
                value={gluteSet1}
                onChange={(e) => setGluteSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="glute-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="glute-set2" 
                type="number"
                value={gluteSet2}
                onChange={(e) => setGluteSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="glute-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="glute-set3" 
                type="number"
                value={gluteSet3}
                onChange={(e) => setGluteSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="glute-rpe" className="text-xs mb-1">RPE:</Label>
                <div className="flex items-center">
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
            </div>
            
            <div>
              <div className="flex flex-col">
                <Label htmlFor="glute-pain" className="text-xs mb-1">Pain:</Label>
                <div className="flex items-center">
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
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-3 font-medium mt-4"
          style={{backgroundColor: "#4ade80", color: "black"}}
        >
          <Send className="mr-2 h-4 w-4" />
          SEND WORKOUT LOG
        </Button>
      </form>
    </div>
  );
}