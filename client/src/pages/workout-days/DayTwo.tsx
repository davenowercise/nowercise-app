import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Send, Play, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import RestTimer from '@/components/workout/RestTimer';

export default function DayTwo() {
  // User info
  const [name, setName] = useState('');
  
  // Exercise 1 - Lat Pulldown
  const [latSet1, setLatSet1] = useState('');
  const [latSet2, setLatSet2] = useState('');
  const [latSet3, setLatSet3] = useState('');
  const [latRpe, setLatRpe] = useState('5');
  const [latPain, setLatPain] = useState('0');
  const [latNotes, setLatNotes] = useState('');
  
  // Exercise 2 - Bicep Curl
  const [bicepSet1, setBicepSet1] = useState('');
  const [bicepSet2, setBicepSet2] = useState('');
  const [bicepSet3, setBicepSet3] = useState('');
  const [bicepRpe, setBicepRpe] = useState('5');
  const [bicepPain, setBicepPain] = useState('0');
  const [bicepNotes, setBicepNotes] = useState('');
  
  // Exercise 3 - Seated Row
  const [rowSet1, setRowSet1] = useState('');
  const [rowSet2, setRowSet2] = useState('');
  const [rowSet3, setRowSet3] = useState('');
  const [rowRpe, setRowRpe] = useState('5');
  const [rowPain, setRowPain] = useState('0');
  const [rowNotes, setRowNotes] = useState('');
  
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
Nowercise Workout Log - Day 2
Date: ${new Date().toLocaleDateString()}
Name: ${name}

Exercise Summary:
----------------
1. Lat Pulldown:
   Set 1: ${latSet1 || '-'} reps
   Set 2: ${latSet2 || '-'} reps
   Set 3: ${latSet3 || '-'} reps
   RPE: ${latRpe}/10
   Pain: ${latPain}/10
   Notes: ${latNotes || 'No notes'}

2. Standing Bicep Curl:
   Set 1: ${bicepSet1 || '-'} reps
   Set 2: ${bicepSet2 || '-'} reps
   Set 3: ${bicepSet3 || '-'} reps
   RPE: ${bicepRpe}/10
   Pain: ${bicepPain}/10
   Notes: ${bicepNotes || 'No notes'}
   
3. Seated Row:
   Set 1: ${rowSet1 || '-'} reps
   Set 2: ${rowSet2 || '-'} reps
   Set 3: ${rowSet3 || '-'} reps
   RPE: ${rowRpe}/10
   Pain: ${rowPain}/10
   Notes: ${rowNotes || 'No notes'}

Small Wins Matter!
    `;
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nowercise_log_day2_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Show completion celebration screen
  if (isComplete) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-info-panel rounded-full mb-3">
            <div className="w-16 h-16 bg-action-blue rounded-full flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Workout Complete!</h1>
          <p className="text-gray-600 mb-4">Great job, {name}! Small wins matter.</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#EAF2FF] p-3 rounded-lg">
              <p className="text-xs text-gray-600">Exercises</p>
              <p className="text-xl font-bold">3</p>
            </div>
            <div className="bg-[#EAF2FF] p-3 rounded-lg">
              <p className="text-xs text-gray-600">Sets</p>
              <p className="text-xl font-bold">9</p>
            </div>
            <div className="bg-[#EAF2FF] p-3 rounded-lg">
              <p className="text-xs text-gray-600">Avg RPE</p>
              <p className="text-xl font-bold">
                {Math.round((parseInt(latRpe) + parseInt(bicepRpe) + parseInt(rowRpe)) / 3 * 10) / 10}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="font-bold mb-3">Workout Summary</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Lat Pulldown</p>
              <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                <div>
                  <p className="font-medium">Set 1</p>
                  <p>{latSet1 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 2</p>
                  <p>{latSet2 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 3</p>
                  <p>{latSet3 || '-'} reps</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <p>RPE: <span className="font-medium">{latRpe}/10</span></p>
                <p>Pain: <span className="font-medium">{latPain}/10</span></p>
              </div>
              {latNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{latNotes}</p>}
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Standing Bicep Curl</p>
              <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                <div>
                  <p className="font-medium">Set 1</p>
                  <p>{bicepSet1 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 2</p>
                  <p>{bicepSet2 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 3</p>
                  <p>{bicepSet3 || '-'} reps</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <p>RPE: <span className="font-medium">{bicepRpe}/10</span></p>
                <p>Pain: <span className="font-medium">{bicepPain}/10</span></p>
              </div>
              {bicepNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{bicepNotes}</p>}
            </div>
            
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Seated Row</p>
              <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                <div>
                  <p className="font-medium">Set 1</p>
                  <p>{rowSet1 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 2</p>
                  <p>{rowSet2 || '-'} reps</p>
                </div>
                <div>
                  <p className="font-medium">Set 3</p>
                  <p>{rowSet3 || '-'} reps</p>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-2">
                <p>RPE: <span className="font-medium">{rowRpe}/10</span></p>
                <p>Pain: <span className="font-medium">{rowPain}/10</span></p>
              </div>
              {rowNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{rowNotes}</p>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={downloadLog} variant="outline" className="w-full flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Download Log
          </Button>
          
          <Link href="/workout-calendar">
            <Button className="w-full bg-[#2F6FCA] hover:bg-[#2660B5]">
              View Calendar
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            onClick={() => setIsComplete(false)} 
            className="w-full"
          >
            Back to Workout
          </Button>
        </div>
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
      case 'lat':
        return "#4ade80"; // Green background for lat pulldown
      case 'bicep':
        return "#60a5fa"; // Blue background for bicep curl
      case 'row':
        return "#f472b6"; // Pink background for row
      default:
        return "#d1d5db"; // Gray background default
    }
  };
  
  // Fixed 3-set workout form
  return (
    <div className="p-4 pb-16">
      <h1 className="text-xl font-bold mb-4">Day 2 Workout</h1>
      
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
                {activeVideo === 'lat' && "Lat Pulldown Demonstration"}
                {activeVideo === 'bicep' && "Bicep Curl Demonstration"}
                {activeVideo === 'row' && "Seated Row Demonstration"}
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
                {activeInfo === 'lat' && "Lat Pulldown Instructions"}
                {activeInfo === 'bicep' && "Bicep Curl Instructions"}
                {activeInfo === 'row' && "Seated Row Instructions"}
              </h3>
              
              {activeInfo === 'lat' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Sit with back supported, grasp the bar with a wide grip.</p>
                  <p className="mb-2"><strong>Movement:</strong> Pull the bar down to chest level by engaging your lat muscles. Keep elbows pointing down, not out. Slowly return to starting position.</p>
                  <p className="mb-2"><strong>Modification:</strong> Use a resistance band anchored above if lat pulldown machine not available. Can be performed with lighter weight.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For those with upper body limitations, reduce range of motion as needed. After breast cancer surgery, consult with healthcare provider about appropriate weight.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Exhale as you pull down, inhale as you return.</p>
                </div>
              )}
              
              {activeInfo === 'bicep' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Stand with feet shoulder-width apart, holding dumbbells with arms extended by your sides.</p>
                  <p className="mb-2"><strong>Movement:</strong> Bend at the elbows to curl the weights toward your shoulders. Keep upper arms stationary. Lower back to starting position.</p>
                  <p className="mb-2"><strong>Modification:</strong> Can be performed seated for stability or with resistance bands instead of weights.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For lymphedema risk, start with very light weights and increase gradually. Avoid if you have active lymphedema without medical clearance.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Exhale during the curl up, inhale during the lowering phase.</p>
                </div>
              )}
              
              {activeInfo === 'row' && (
                <div className="text-sm">
                  <p className="mb-2"><strong>Starting Position:</strong> Sit with back supported, feet firmly on floor, holding the handles with arms extended.</p>
                  <p className="mb-2"><strong>Movement:</strong> Pull the handles toward your torso, squeezing your shoulder blades together. Keep elbows close to body. Return to starting position slowly.</p>
                  <p className="mb-2"><strong>Modification:</strong> Can be performed with resistance bands anchored in front of you, or bent over with support if seated row unavailable.</p>
                  <p className="mb-2"><strong>Cancer Considerations:</strong> For those with core weakness, ensure proper back support. After abdominal surgery, consult with healthcare provider before performing.</p>
                  <p className="mb-4"><strong>Breathing:</strong> Exhale as you pull, inhale as you return.</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveInfo(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Exercise 1 - Lat Pulldown */}
        <div className="bg-white p-3 rounded mb-3">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Lat Pulldown</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('lat')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('lat')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('lat')}
            style={{ backgroundColor: getVideoThumbnail('lat') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Lat Pulldown Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>Keep elbows pointing down. Focus on engaging lat muscles.</em>
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="lat-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="lat-set1" 
                type="number"
                value={latSet1}
                onChange={(e) => setLatSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lat-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="lat-set2" 
                type="number"
                value={latSet2}
                onChange={(e) => setLatSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="lat-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="lat-set3" 
                type="number"
                value={latSet3}
                onChange={(e) => setLatSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="mb-2">
              <Label htmlFor="lat-rpe" className="text-xs mb-1">RPE (1-10):</Label>
              <div className="flex items-center">
                <input 
                  id="lat-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={latRpe}
                  onChange={(e) => setLatRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{latRpe}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="lat-pain" className="text-xs mb-1">Pain (0-10):</Label>
              <div className="flex items-center">
                <input 
                  id="lat-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={latPain}
                  onChange={(e) => setLatPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{latPain}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="lat-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="lat-notes"
              value={latNotes}
              onChange={(e) => setLatNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Exercise 2 - Bicep Curl */}
        <div className="bg-white p-3 rounded mb-3">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Standing Bicep Curl</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('bicep')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('bicep')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('bicep')}
            style={{ backgroundColor: getVideoThumbnail('bicep') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Bicep Curl Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>Keep upper arms stationary. Use controlled movements.</em>
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="bicep-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="bicep-set1" 
                type="number"
                value={bicepSet1}
                onChange={(e) => setBicepSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bicep-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="bicep-set2" 
                type="number"
                value={bicepSet2}
                onChange={(e) => setBicepSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bicep-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="bicep-set3" 
                type="number"
                value={bicepSet3}
                onChange={(e) => setBicepSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="mb-2">
              <Label htmlFor="bicep-rpe" className="text-xs mb-1">RPE (1-10):</Label>
              <div className="flex items-center">
                <input 
                  id="bicep-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={bicepRpe}
                  onChange={(e) => setBicepRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{bicepRpe}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="bicep-pain" className="text-xs mb-1">Pain (0-10):</Label>
              <div className="flex items-center">
                <input 
                  id="bicep-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={bicepPain}
                  onChange={(e) => setBicepPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{bicepPain}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="bicep-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="bicep-notes"
              value={bicepNotes}
              onChange={(e) => setBicepNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Exercise 3 - Seated Row */}
        <div className="bg-white p-3 rounded mb-4">
          <div className="flex items-center mb-2">
            <h2 className="font-medium text-lg flex-1">Seated Row</h2>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleVideo('row')}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => toggleInfo('row')}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Video thumbnail */}
          <div 
            className="relative rounded overflow-hidden cursor-pointer mb-3"
            onClick={() => toggleVideo('row')}
            style={{ backgroundColor: getVideoThumbnail('row') }}
          >
            <div 
              className="aspect-video flex flex-col items-center justify-center p-4"
            >
              <p className="font-medium text-white text-center mb-2">Seated Row Demo</p>
              <p className="text-white text-xs text-center">Watch proper form demonstration</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all">
              <div className="bg-white bg-opacity-80 rounded-full p-2">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-3">
            <em>Maintain good posture. Squeeze shoulder blades together.</em>
          </p>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <Label htmlFor="row-set1" className="text-xs">Set 1:</Label>
              <Input 
                id="row-set1" 
                type="number"
                value={rowSet1}
                onChange={(e) => setRowSet1(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="row-set2" className="text-xs">Set 2:</Label>
              <Input 
                id="row-set2" 
                type="number"
                value={rowSet2}
                onChange={(e) => setRowSet2(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="row-set3" className="text-xs">Set 3:</Label>
              <Input 
                id="row-set3" 
                type="number"
                value={rowSet3}
                onChange={(e) => setRowSet3(e.target.value)}
                placeholder="Reps"
                className="h-8 mt-1"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <div className="mb-2">
              <Label htmlFor="row-rpe" className="text-xs mb-1">RPE (1-10):</Label>
              <div className="flex items-center">
                <input 
                  id="row-rpe" 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={rowRpe}
                  onChange={(e) => setRowRpe(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{rowRpe}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="row-pain" className="text-xs mb-1">Pain (0-10):</Label>
              <div className="flex items-center">
                <input 
                  id="row-pain" 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={rowPain}
                  onChange={(e) => setRowPain(e.target.value)}
                  className="flex-1"
                />
                <span className="ml-2 w-6 text-sm">{rowPain}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="row-notes" className="text-xs">Notes:</Label>
            <Textarea
              id="row-notes"
              value={rowNotes}
              onChange={(e) => setRowNotes(e.target.value)}
              placeholder="How did this exercise feel? Any modifications?"
              className="mt-1 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Rest Timer */}
        <RestTimer defaultDuration={60} />
        
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