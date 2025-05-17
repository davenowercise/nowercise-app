import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download, Send, Play, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import RestTimer from '@/components/workout/RestTimer';
import QuickMoodCheck from '@/components/symptom/QuickMoodCheck';
import SymptomCalendar from '@/components/symptom/SymptomCalendar';

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
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [moodLogged, setMoodLogged] = useState(false);
  const [showSymptomCalendar, setShowSymptomCalendar] = useState(false);
  const [workoutMood, setWorkoutMood] = useState('');
  
  // Mock symptom logs for demonstration
  const [mockSymptomLogs] = useState([
    {
      date: new Date(new Date().setDate(new Date().getDate())),
      mood: 'good',
      symptoms: ['fatigue'],
      notes: 'Felt good after today\'s workout. A bit tired but in a good way.'
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 2)),
      mood: 'okay',
      symptoms: ['fatigue', 'pain'],
      notes: 'Some muscle soreness from previous workout.'
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 4)),
      mood: 'low',
      symptoms: ['fatigue', 'nausea'],
      notes: 'Treatment day. Feeling low energy.'
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 7)),
      mood: 'good',
      symptoms: [],
      notes: 'Good day, completed full workout!'
    }
  ]);
  
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
    
    // Set completion states
    setIsComplete(true);
    
    // If mood was logged in the form, use it
    if (workoutMood) {
      setMoodLogged(true);
      
      // Update today's mood in our mock data
      const updatedLogs = [...mockSymptomLogs];
      const todayLog = updatedLogs.find(log => 
        new Date(log.date).toDateString() === new Date().toDateString()
      );
      
      if (todayLog) {
        todayLog.mood = workoutMood;
      }
      
      toast({
        title: "Workout and mood logged successfully!",
        description: "Great job tracking your exercise and wellbeing!",
      });
    } else {
      // If no mood was selected, show the mood check after submission
      setShowMoodCheck(true);
      toast({
        title: "Workout logged successfully!",
        description: "Great job completing your exercise!",
      });
    }
  };
  
  const handleMoodComplete = (data: { mood: string, skipped: boolean }) => {
    setMoodLogged(true);
    setShowMoodCheck(false);
    
    if (!data.skipped && data.mood) {
      // In a real app, this would save the mood data to the user's profile
      toast({
        title: "Mood tracked",
        description: "Your mood has been saved with your workout",
      });
      
      // Update today's mood in our local demo data
      const updatedLogs = [...mockSymptomLogs];
      const todayLog = updatedLogs.find(log => 
        new Date(log.date).toDateString() === new Date().toDateString()
      );
      
      if (todayLog) {
        todayLog.mood = data.mood;
      }
      
      // Show symptom calendar after mood is logged
      setShowSymptomCalendar(true);
    } else {
      // If skipped, still show workout summary
      setShowSymptomCalendar(false);
    }
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
  
  // Show completion celebration screen
  if (isComplete) {
    return (
      <div className="p-4 max-w-md mx-auto">
        {/* Show mood check if needed */}
        {showMoodCheck && (
          <div className="mb-6">
            <QuickMoodCheck onComplete={handleMoodComplete} />
          </div>
        )}
        
        {(!showMoodCheck || moodLogged) && (
          <>
            {showSymptomCalendar ? (
              <>
                <div className="text-center mb-4">
                  <h1 className="text-xl font-bold mb-1">Your Symptoms Over Time</h1>
                  <p className="text-gray-600 text-sm">See how your workouts affect your symptoms</p>
                </div>
                
                <div className="mb-6">
                  <SymptomCalendar logs={mockSymptomLogs} />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                  <h3 className="font-medium text-blue-700 mb-1">Did You Notice?</h3>
                  <p className="text-blue-600">
                    Your mood tends to be better on workout days! Regular exercise 
                    can help manage cancer-related fatigue and improve overall wellbeing.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link href="/symptom-calendar">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      Full Symptom History
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSymptomCalendar(false)} 
                    className="w-full"
                  >
                    View Workout Summary
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-3">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-1">Workout Complete!</h1>
                  <p className="text-gray-600 mb-4">Great job, {name}! Small wins matter.</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Exercises</p>
                      <p className="text-xl font-bold">3</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Sets</p>
                      <p className="text-xl font-bold">9</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Avg RPE</p>
                      <p className="text-xl font-bold">
                        {Math.round((parseInt(squatRpe) + parseInt(chestRpe) + parseInt(gluteRpe)) / 3 * 10) / 10}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h2 className="font-bold mb-3">Workout Summary</h2>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">Dumbbell Squats</p>
                      <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                        <div>
                          <p className="font-medium">Set 1</p>
                          <p>{squatSet1 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 2</p>
                          <p>{squatSet2 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 3</p>
                          <p>{squatSet3 || '-'} reps</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <p>RPE: <span className="font-medium">{squatRpe}/10</span></p>
                        <p>Pain: <span className="font-medium">{squatPain}/10</span></p>
                      </div>
                      {squatNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{squatNotes}</p>}
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">Seated Chest Press</p>
                      <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                        <div>
                          <p className="font-medium">Set 1</p>
                          <p>{chestSet1 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 2</p>
                          <p>{chestSet2 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 3</p>
                          <p>{chestSet3 || '-'} reps</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <p>RPE: <span className="font-medium">{chestRpe}/10</span></p>
                        <p>Pain: <span className="font-medium">{chestPain}/10</span></p>
                      </div>
                      {chestNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{chestNotes}</p>}
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="font-medium">Single Leg Glute Bridge</p>
                      <div className="grid grid-cols-3 gap-2 my-2 text-xs text-center">
                        <div>
                          <p className="font-medium">Set 1</p>
                          <p>{gluteSet1 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 2</p>
                          <p>{gluteSet2 || '-'} reps</p>
                        </div>
                        <div>
                          <p className="font-medium">Set 3</p>
                          <p>{gluteSet3 || '-'} reps</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <p>RPE: <span className="font-medium">{gluteRpe}/10</span></p>
                        <p>Pain: <span className="font-medium">{glutePain}/10</span></p>
                      </div>
                      {gluteNotes && <p className="text-xs italic mt-2 bg-gray-100 p-2 rounded">{gluteNotes}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button onClick={downloadLog} variant="outline" className="w-full flex items-center justify-center">
                    <Download className="mr-2 h-4 w-4" />
                    Download Log
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/workout-calendar">
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        Workout Calendar
                      </Button>
                    </Link>
                    
                    {moodLogged && (
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => setShowSymptomCalendar(true)}
                      >
                        Symptom Calendar
                      </Button>
                    )}
                    
                    {!moodLogged && (
                      <Link href="/symptom-tracker">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Symptom Tracker
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsComplete(false)} 
                    className="w-full"
                  >
                    Back to Workout
                  </Button>
                </div>
              </>
            )}
          </>
        )}
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
  
  // Get video details for exercise
  const getVideoDetails = (exerciseId: string) => {
    // YouTube video IDs for each exercise
    const details = {
      squat: {
        youtubeId: "aclHkVaku9U", // Replace with your actual YouTube video ID
        backgroundColor: "#4ade80", // Green background for squat
        title: "Dumbbell Squat Demo"
      },
      chest: {
        youtubeId: "VmB1G1K7v94", // Replace with your actual YouTube video ID
        backgroundColor: "#60a5fa", // Blue background for chest
        title: "Seated Chest Press Demo"
      },
      glute: {
        youtubeId: "3NXv0Nany-Q", // Replace with your actual YouTube video ID
        backgroundColor: "#f472b6", // Pink background for glute
        title: "Single Leg Glute Bridge Demo"
      }
    };
    
    return details[exerciseId as keyof typeof details] || {
      youtubeId: "",
      backgroundColor: "#d1d5db",
      title: "Exercise Demo"
    };
  };
  
  // Get video thumbnail color for an exercise
  const getVideoThumbnail = (exerciseId: string) => {
    return getVideoDetails(exerciseId).backgroundColor;
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
            <div className="bg-white rounded-lg max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-2">
                {activeVideo === 'squat' && "Dumbbell Squat Demonstration"}
                {activeVideo === 'chest' && "Seated Chest Press Demonstration"}
                {activeVideo === 'glute' && "Single Leg Glute Bridge Demonstration"}
              </h3>
              <div className="aspect-video bg-gray-100 rounded overflow-hidden mb-4">
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getVideoDetails(activeVideo).youtubeId}`}
                  title={`${getVideoDetails(activeVideo).title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
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
            <div className="bg-white rounded-lg max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-3">
                {activeInfo === 'squat' && "Dumbbell Squat Guidelines"}
                {activeInfo === 'chest' && "Seated Chest Press Guidelines"}
                {activeInfo === 'glute' && "Single Leg Glute Bridge Guidelines"}
              </h3>
              
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <h4 className="font-medium text-blue-800 mb-1">Cancer Exercise Considerations</h4>
                <p className="text-xs text-blue-700">These guidelines are tailored for cancer patients and survivors. Always consult with your healthcare provider before starting a new exercise.</p>
              </div>
              
              <div className="overflow-y-auto max-h-[50vh] pr-1">
                {activeInfo === 'squat' && (
                  <div className="text-sm space-y-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Starting Position:</p>
                      <p>Stand with feet shoulder-width apart, holding dumbbells at your sides.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Movement:</p>
                      <p>Keep chest up and back straight. Lower by bending knees until thighs are parallel to floor (or as low as comfortable). Push through heels to return to standing.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Modification:</p>
                      <p>Can be performed with a chair behind you for support, or without weights if needed.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Cancer Considerations:</p>
                      <p>For those recovering from surgery, modify depth to avoid strain. For fatigue, use lighter weights or bodyweight only.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Breathing:</p>
                      <p>Inhale as you lower, exhale as you push up.</p>
                    </div>
                  </div>
                )}
                
                {activeInfo === 'chest' && (
                  <div className="text-sm space-y-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Starting Position:</p>
                      <p>Sit with back supported on chair or bench, holding dumbbells or resistance bands at chest level.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Movement:</p>
                      <p>Extend arms forward, pushing weights away from your chest. Slowly return to starting position with control.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Modification:</p>
                      <p>Can be performed with resistance bands secured behind you, or with lighter weights.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Cancer Considerations:</p>
                      <p>For breast cancer patients, consult with your healthcare provider about appropriate weight and range of motion. Avoid if you've had recent chest/port surgery.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Breathing:</p>
                      <p>Exhale as you push, inhale as you return.</p>
                    </div>
                  </div>
                )}
                
                {activeInfo === 'glute' && (
                  <div className="text-sm space-y-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Starting Position:</p>
                      <p>Lie on your back with knees bent and feet flat. Extend one leg straight.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Movement:</p>
                      <p>Push through the heel of your planted foot to lift hips toward ceiling. Hold briefly at the top, then lower with control. Complete all reps, then switch legs.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Modification:</p>
                      <p>Can be performed with both feet on the ground as a regular glute bridge if needed.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Cancer Considerations:</p>
                      <p>For those with lower back issues, don't arch too high. If you have bone metastases, consult your provider before performing.</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Breathing:</p>
                      <p>Exhale as you lift, inhale as you lower.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
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
          
          <div className="mb-3">
            <Label htmlFor="squat-rpe" className="text-xs mb-1">RPE (Rate of Perceived Exertion):</Label>
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
              <span className="ml-2 w-6 text-sm font-medium">{squatRpe}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
            </div>
          </div>
          
          {/* Rest timer directly after pain slider */}
          <div className="my-3">
            <RestTimer compact={true} defaultDuration={45} />
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
          
          <div className="mb-3">
            <Label htmlFor="chest-rpe" className="text-xs mb-1">RPE (Rate of Perceived Exertion):</Label>
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
              <span className="ml-2 w-6 text-sm font-medium">{chestRpe}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
            </div>
          </div>
          
          {/* Rest timer directly after pain slider */}
          <div className="my-3">
            <RestTimer compact={true} defaultDuration={45} />
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
          
          <div className="mb-3">
            <Label htmlFor="glute-rpe" className="text-xs mb-1">RPE (Rate of Perceived Exertion):</Label>
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
              <span className="ml-2 w-6 text-sm font-medium">{gluteRpe}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Hard</span>
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
        
        {/* Rest Timer */}
        {/* No global rest timer - individual timers after each exercise */}
        
        {/* Quick mood check */}
        <div className="mt-6 mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-base font-medium mb-3">How are you feeling after this workout?</h3>
          <div className="grid grid-cols-5 gap-2">
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                ${workoutMood === 'great' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
              onClick={() => setWorkoutMood('great')}
            >
              <span className="text-2xl">😊</span>
              <span className="text-xs mt-1">Great</span>
            </div>
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                ${workoutMood === 'good' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
              onClick={() => setWorkoutMood('good')}
            >
              <span className="text-2xl">🙂</span>
              <span className="text-xs mt-1">Good</span>
            </div>
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                ${workoutMood === 'okay' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
              onClick={() => setWorkoutMood('okay')}
            >
              <span className="text-2xl">😐</span>
              <span className="text-xs mt-1">Okay</span>
            </div>
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                ${workoutMood === 'low' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
              onClick={() => setWorkoutMood('low')}
            >
              <span className="text-2xl">😕</span>
              <span className="text-xs mt-1">Low</span>
            </div>
            <div 
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                ${workoutMood === 'poor' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-100'}`}
              onClick={() => setWorkoutMood('poor')}
            >
              <span className="text-2xl">😞</span>
              <span className="text-xs mt-1">Poor</span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            Tracking your mood helps connect how exercise affects your wellbeing
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