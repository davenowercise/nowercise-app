import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Send, Play, Info } from 'lucide-react';
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
  const [squatNotes, setSquatNotes] = useState('');
  
  // Exercise 2 - Chest Press
  const [chestSet1, setChestSet1] = useState('');
  const [chestSet2, setChestSet2] = useState('');
  const [chestSet3, setChestSet3] = useState('');
  const [chestRpe, setChestRpe] = useState('5');
  const [chestPain, setChestPain] = useState('0');
  const [chestNotes, setChestNotes] = useState('');
  
  // Exercise 3 - Glute Bridge
  const [gluteSet1, setGluteSet1] = useState('');
  const [gluteSet2, setGluteSet2] = useState('');
  const [gluteSet3, setGluteSet3] = useState('');
  const [gluteRpe, setGluteRpe] = useState('5');
  const [glutePain, setGlutePain] = useState('0');
  const [gluteNotes, setGluteNotes] = useState('');
  
  // UI states
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  
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
   Notes: ${squatNotes || 'No notes'}

2. Seated Chest Press:
   Set 1: ${chestSet1 || '-'} reps
   Set 2: ${chestSet2 || '-'} reps
   Set 3: ${chestSet3 || '-'} reps
   RPE: ${chestRpe}/10
   Pain: ${chestPain}/10
   Notes: ${chestNotes || 'No notes'}
   
3. Single Leg Glute Bridge:
   Set 1: ${gluteSet1 || '-'} reps
   Set 2: ${gluteSet2 || '-'} reps
   Set 3: ${gluteSet3 || '-'} reps
   RPE: ${gluteRpe}/10
   Pain: ${glutePain}/10
   Notes: ${gluteNotes || 'No notes'}

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
              {squatNotes && <p className="text-sm italic mt-1">Notes: {squatNotes}</p>}
            </div>
            
            <div>
              <p><strong>Seated Chest Press:</strong></p>
              <p className="text-sm">Set 1: {chestSet1 || '-'} reps</p>
              <p className="text-sm">Set 2: {chestSet2 || '-'} reps</p>
              <p className="text-sm">Set 3: {chestSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {chestRpe}/10 | Pain: {chestPain}/10</p>
              {chestNotes && <p className="text-sm italic mt-1">Notes: {chestNotes}</p>}
            </div>
            
            <div>
              <p><strong>Single Leg Glute Bridge:</strong></p>
              <p className="text-sm">Set 1: {gluteSet1 || '-'} reps</p>
              <p className="text-sm">Set 2: {gluteSet2 || '-'} reps</p>
              <p className="text-sm">Set 3: {gluteSet3 || '-'} reps</p>
              <p className="text-sm">RPE: {gluteRpe}/10 | Pain: {glutePain}/10</p>
              {gluteNotes && <p className="text-sm italic mt-1">Notes: {gluteNotes}</p>}
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
  
  // Toggle video overlay
  const toggleVideo = (exerciseId: string) => {
    if (activeVideo === exerciseId) {
      setActiveVideo(null);
    } else {
      setActiveVideo(exerciseId);
      setActiveInfo(null);
    }
  };
  
  // Toggle info overlay
  const toggleInfo = (exerciseId: string) => {
    if (activeInfo === exerciseId) {
      setActiveInfo(null);
    } else {
      setActiveInfo(exerciseId);
      setActiveVideo(null);
    }
  };
  
  // Get video thumbnail for an exercise
  const getVideoThumbnail = (exerciseId: string) => {
    // Using colored background divs instead of external placeholder images
    switch(exerciseId) {
      case 'squat':
        return "#4ade80"; // Green background for squat
      case 'chest':
        return "#60a5fa"; // Blue background for chest
      case 'glute':
        return "#f472b6"; // Pink background for glute
      default:
        return "#d1d5db"; // Gray background default
    }
  };
  
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
        
        {/* Video Overlay Modal */}
        {activeVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-2">
                {activeVideo === 'squat' && "Dumbbell Squat Demonstration"}
                {activeVideo === 'chest' && "Seated Chest Press Demonstration"}
                {activeVideo === 'glute' && "Single Leg Glute Bridge Demonstration"}
              </h3>
              <div className="aspect-video bg-gray-100 flex items-center justify-center mb-4 relative">
                <div className="text-center">
                  <p className="text-gray-500">Video would play here</p>
                  <p className="text-xs text-gray-400 mt-2">Exercise demonstration video content</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveVideo(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Info Overlay Modal */}
        {activeInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setActiveInfo(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-2">
                {activeInfo === 'squat' && "Dumbbell Squat Instructions"}
                {activeInfo === 'chest' && "Seated Chest Press Instructions"}
                {activeInfo === 'glute' && "Single Leg Glute Bridge Instructions"}
              </h3>
              
              {activeInfo === 'squat' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Stand with feet shoulder-width apart, holding dumbbells at your sides.</p>
                  <p className="mb-2"><strong>Movement:</strong> Keep chest up and back straight. Lower by bending knees until thighs are parallel to floor (or as low as comfortable). Push through heels to return to standing.</p>
                  <p className="mb-2"><strong>Modification:</strong> Can be performed with a chair behind you for support, or without weights if needed.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For those recovering from surgery, modify depth to avoid strain. For fatigue, use lighter weights or bodyweight only.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Inhale as you lower, exhale as you push up.</p>
                </div>
              )}
              
              {activeInfo === 'chest' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Sit with back supported on chair or bench, holding dumbbells or resistance bands at chest level.</p>
                  <p className="mb-2"><strong>Movement:</strong> Extend arms forward, pushing weights away from your chest. Slowly return to starting position with control.</p>
                  <p className="mb-2"><strong>Modification:</strong> Can be performed with resistance bands secured behind you, or with lighter weights.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For breast cancer patients, consult with your healthcare provider about appropriate weight and range of motion. Avoid if you've had recent chest/port surgery.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Exhale as you push, inhale as you return.</p>
                </div>
              )}
              
              {activeInfo === 'glute' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Lie on your back with knees bent and feet flat. Extend one leg straight.</p>
                  <p className="mb-2"><strong>Movement:</strong> Push through the heel of your planted foot to lift hips toward ceiling. Hold briefly at the top, then lower with control. Complete all reps, then switch legs.</p>
                  <p className="mb-2"><strong>Modification:</strong> Can be performed with both feet on the ground as a regular glute bridge if needed.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For those with lower back issues, don't arch too high. If you have bone metastases, consult your provider before performing.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Exhale as you lift, inhale as you lower.</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveInfo(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Exercise 1 - Squats */}
        <div className="bg-white p-3 rounded mb-3">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Dumbbell Squats</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('squat')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('squat')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('squat')}
            style={{ backgroundColor: getVideoThumbnail('squat') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Dumbbell Squat Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>With chair support if needed. Keep chest up, focus on form.</em>
          </p>
          
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
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="squat-rpe" className="text-xs mb-1">RPE (1-10):</Label>
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
                <Label htmlFor="squat-pain" className="text-xs mb-1">Pain (0-10):</Label>
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
          
          <div>
            <Label htmlFor="squat-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="squat-notes"
              value={squatNotes}
              onChange={(e) => setSquatNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Exercise 2 - Chest Press */}
        <div className="bg-white p-3 rounded mb-3">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Seated Chest Press</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('chest')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('chest')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('chest')}
            style={{ backgroundColor: getVideoThumbnail('chest') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Chest Press Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>Sit with back supported. Use resistance bands or light dumbbells.</em>
          </p>
          
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
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="chest-rpe" className="text-xs mb-1">RPE (1-10):</Label>
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
                <Label htmlFor="chest-pain" className="text-xs mb-1">Pain (0-10):</Label>
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
          
          <div>
            <Label htmlFor="chest-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="chest-notes"
              value={chestNotes}
              onChange={(e) => setChestNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Exercise 3 - Glute Bridge */}
        <div className="bg-white p-3 rounded mb-4">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Single Leg Glute Bridge</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('glute')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('glute')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('glute')}
            style={{ backgroundColor: getVideoThumbnail('glute') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Glute Bridge Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>Keep back flat, use mat if needed. Focus on controlled movement.</em>
          </p>
          
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
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="flex flex-col">
                <Label htmlFor="glute-rpe" className="text-xs mb-1">RPE (1-10):</Label>
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
                <Label htmlFor="glute-pain" className="text-xs mb-1">Pain (0-10):</Label>
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
          
          <div>
            <Label htmlFor="glute-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="glute-notes"
              value={gluteNotes}
              onChange={(e) => setGluteNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
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