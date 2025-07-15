import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Play, ExternalLink, Timer, Target, CheckCircle, RotateCcw, Users, Award, Clock, Zap, Plus, Minus, SkipForward, Star, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { useState, useEffect } from "react";

// Exercise data from your actual CSV library
const workoutExercises = [
  {
    id: 1,
    name: "Band-Resisted Goblet Squat",
    category: "Squat",
    videoUrl: "https://www.youtube.com/watch?v=biOKxrfbdlY",
    videoId: "biOKxrfbdlY",
    tags: ["band", "lower body"],
    instructions: "Stand with feet shoulder-width apart, hold weight at chest level, squat down keeping chest up, return to standing.",
    energyLevel: 3,
    equipment: "Resistance Band",
    duration: "3 sets × 8-12 reps",
    restTime: "60 seconds",
    muscleGroups: ["Quadriceps", "Glutes", "Core"],
    difficulty: "Beginner to Intermediate",
    modifications: [
      "Bodyweight only: Remove band resistance",
      "Increase difficulty: Add pause at bottom",
      "Knee issues: Limit range of motion"
    ]
  },
  {
    id: 2,
    name: "Band-Resisted Pushup",
    category: "Push",
    videoUrl: "https://www.youtube.com/watch?v=u7QnowXDjYE",
    videoId: "u7QnowXDjYE",
    tags: ["upper body", "band"],
    instructions: "Place resistance band across your back, perform standard pushup with added resistance from the band.",
    energyLevel: 3,
    equipment: "Resistance Band",
    duration: "3 sets × 6-10 reps",
    restTime: "60 seconds",
    muscleGroups: ["Chest", "Triceps", "Shoulders"],
    difficulty: "Intermediate",
    modifications: [
      "Easier: Do on knees or incline",
      "No band: Standard pushups",
      "Advanced: Add explosive push"
    ]
  },
  {
    id: 3,
    name: "Banded Pull-Down",
    category: "Pull", 
    videoUrl: "https://www.youtube.com/watch?v=FwkJXHGYk8o",
    videoId: "FwkJXHGYk8o",
    tags: ["upper body", "band"],
    instructions: "Secure band overhead, pull down with controlled motion engaging your lats and upper back muscles.",
    energyLevel: 3,
    equipment: "Resistance Band",
    duration: "3 sets × 10-15 reps",
    restTime: "45 seconds",
    muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    difficulty: "Beginner to Intermediate",
    modifications: [
      "Seated variation: Perform sitting down",
      "Increase resistance: Use thicker band",
      "Shoulder issues: Reduce range of motion"
    ]
  },
  {
    id: 4,
    name: "Dead Bug",
    category: "Core",
    videoUrl: "https://www.youtube.com/watch?v=xx6Atwy3DoY",
    videoId: "xx6Atwy3DoY",
    tags: ["core", "stability"],
    instructions: "Lie on back, arms up, knees bent at 90°. Slowly lower opposite arm and leg, maintain neutral spine.",
    energyLevel: 2,
    equipment: "Bodyweight",
    duration: "3 sets × 8-10 each side",
    restTime: "45 seconds",
    muscleGroups: ["Deep Core", "Abs", "Hip Flexors"],
    difficulty: "Beginner to Intermediate",
    modifications: [
      "Beginner: Keep feet on ground",
      "Advanced: Add light weights",
      "Back issues: Smaller range of motion"
    ]
  }
];

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to get energy level color
const getEnergyLevelColor = (level: number) => {
  switch(level) {
    case 1: return "bg-green-100 text-green-800";
    case 2: return "bg-blue-100 text-blue-800";
    case 3: return "bg-yellow-100 text-yellow-800";
    case 4: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get energy level text
const getEnergyLevelText = (level: number) => {
  switch(level) {
    case 1: return "Gentle";
    case 2: return "Low";
    case 3: return "Moderate";
    case 4: return "High";
    default: return "Unknown";
  }
};

interface ExerciseCardProps {
  exercise: typeof workoutExercises[0];
  isCompleted?: boolean;
  onComplete?: () => void;
}

function ExerciseCard({ exercise, isCompleted, onComplete }: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleVideoClick = () => {
    window.open(exercise.videoUrl, '_blank');
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all ${isCompleted ? 'ring-2 ring-green-500' : ''}`}>
      <div className="relative">
        {/* Video Thumbnail */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {!imageError ? (
            <img 
              src={getYouTubeThumbnail(exercise.videoId)}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              onClick={handleVideoClick}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              <Play className="h-6 w-6 mr-2" />
              Watch Video
            </Button>
          </div>

          {/* Completed Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          )}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {exercise.category}
          </Badge>
        </div>
        
        {/* Energy Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getEnergyLevelColor(exercise.energyLevel)}>
            {getEnergyLevelText(exercise.energyLevel)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{exercise.name}</CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{exercise.equipment}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{exercise.duration}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <span className="font-medium">Rest: </span>
            <span>{exercise.restTime}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="font-medium">Level: </span>
            <span>{exercise.difficulty}</span>
          </div>
        </div>
        
        {/* Instructions */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {exercise.instructions}
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleVideoClick}
            variant="outline" 
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Watch Video
          </Button>
          <Button 
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
          >
            {showDetails ? 'Less' : 'More'}
          </Button>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 space-y-3 border-t pt-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Target Muscles:</h4>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroups.map((muscle, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Modifications:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {exercise.modifications.map((mod, index) => (
                  <li key={index}>• {mod}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Complete Button */}
        {onComplete && (
          <Button
            onClick={onComplete}
            className={`w-full mt-3 ${isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
            variant={isCompleted ? 'default' : 'outline'}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed!
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Workout Summary Component
function WorkoutSummary({ 
  session, 
  completedSets, 
  workoutTime, 
  onRestart, 
  exercises
}: {
  session: WorkoutSession | null;
  completedSets: SetProgress[];
  workoutTime: number;
  onRestart: () => void;
  exercises: typeof workoutExercises;
}) {
  const [rpeRating, setRpeRating] = useState("5");
  const [fatigueLevel, setFatigueLevel] = useState("3");
  const [painLevel, setPainLevel] = useState("1");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const totalSets = completedSets.length;
  const completedSetsCount = completedSets.filter(s => s.completed).length;
  const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
  const exercisesCompleted = exercises.filter(ex => 
    completedSets.filter(s => s.exerciseId === ex.id && s.completed).length >= 3
  ).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const submitFeedback = () => {
    // Here you would typically send this data to your backend
    console.log('Workout feedback:', {
      rpeRating: parseInt(rpeRating),
      fatigueLevel: parseInt(fatigueLevel),
      painLevel: parseInt(painLevel),
      workoutTime,
      completedSets
    });
    setFeedbackSubmitted(true);
  };

  if (feedbackSubmitted) {
    return (
      <div className="text-center bg-green-50 p-8 rounded-lg">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Feedback Submitted!
        </h2>
        <p className="text-green-700 mb-6">
          Thank you for completing your workout and providing feedback. 
          Your data will help us improve your future exercise recommendations.
        </p>
        <Button onClick={onRestart} className="bg-green-600 hover:bg-green-700">
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Workout
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">💪</div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Workout Complete!
        </h2>
        <p className="text-gray-600">
          Well done! You completed your full body workout in {formatTime(workoutTime)}
        </p>
      </div>

      {/* Smart Progression System - New Records */}
      {newRecords && newRecords.length > 0 && (
        <div className="mb-6">
          <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">New Personal Records!</h3>
            </div>
            <div className="space-y-2">
              {newRecords.map((record, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-700">{record}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Workout Stats */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Workout Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{formatTime(workoutTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Exercises Completed:</span>
              <span className="font-medium">{exercisesCompleted}/{exercises.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Sets Completed:</span>
              <span className="font-medium">{completedSetsCount}/{totalSets}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Reps:</span>
              <span className="font-medium">{totalReps}</span>
            </div>

          </div>
        </Card>

        {/* Exercise Breakdown */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Exercise Breakdown</h3>
          <div className="space-y-2">
            {exercises.map(exercise => {
              const exerciseSets = completedSets.filter(s => s.exerciseId === exercise.id);
              const completed = exerciseSets.filter(s => s.completed).length;
              const totalReps = exerciseSets.reduce((sum, set) => sum + set.reps, 0);
              
              return (
                <div key={exercise.id} className="flex justify-between items-center">
                  <span className="text-sm">{exercise.name}</span>
                  <div className="text-sm text-gray-600">
                    {completed}/3 sets ({totalReps} reps)
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Feedback Form */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">How did that feel?</h3>
        <div className="space-y-6">
          {/* RPE Rating */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Rate of Perceived Exertion (RPE) - How hard was the workout?
            </Label>
            <RadioGroup value={rpeRating} onValueChange={setRpeRating}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={num.toString()} id={`rpe-${num}`} />
                    <Label htmlFor={`rpe-${num}`} className="text-sm">
                      {num} {num === 1 ? '(Very Easy)' : num === 5 ? '(Very Hard)' : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Fatigue Level */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Fatigue Level - How tired do you feel?
            </Label>
            <RadioGroup value={fatigueLevel} onValueChange={setFatigueLevel}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={num.toString()} id={`fatigue-${num}`} />
                    <Label htmlFor={`fatigue-${num}`} className="text-sm">
                      {num} {num === 1 ? '(Energized)' : num === 5 ? '(Exhausted)' : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Pain Level */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Pain Level - Any discomfort during the workout?
            </Label>
            <RadioGroup value={painLevel} onValueChange={setPainLevel}>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={num.toString()} id={`pain-${num}`} />
                    <Label htmlFor={`pain-${num}`} className="text-sm">
                      {num} {num === 1 ? '(No Pain)' : num === 5 ? '(Severe Pain)' : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button 
              onClick={submitFeedback}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Heart className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
            <Button 
              onClick={onRestart}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start New Workout
            </Button>
          </div>
        </div>
      </Card>


    </div>
  );
}

// Types for enhanced tracking
interface SetProgress {
  exerciseId: number;
  setNumber: number;
  reps: number;
  completed: boolean;
  skipped: boolean;
}

interface WorkoutSession {
  startTime: Date;
  endTime?: Date;
  completedSets: SetProgress[];
  skippedExercises: number[];
  rpeRating?: number;
  fatigueLevel?: number;
  painLevel?: number;
  notes?: string;
}

export function FullBodyWorkout() {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedSets, setCompletedSets] = useState<SetProgress[]>([]);
  const [repsCount, setRepsCount] = useState(8);



  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // Workout timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStarted && !showSummary) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, showSummary]);

  const toggleExerciseComplete = (exerciseId: number) => {
    setCompletedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setCurrentExercise(0);
    setCurrentSet(1);
    setCompletedExercises([]);
    setCompletedSets([]);
    setWorkoutSession({
      startTime: new Date(),
      completedSets: [],
      skippedExercises: []
    });
  };

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setCurrentExercise(0);
    setCurrentSet(1);
    setCompletedExercises([]);
    setCompletedSets([]);
    setWorkoutTime(0);
    setRestTimer(0);
    setIsResting(false);
    setShowSummary(false);
    setWorkoutSession(null);
  };

  const markSetComplete = () => {
    const exerciseId = workoutExercises[currentExercise].id;
    const newSet: SetProgress = {
      exerciseId,
      setNumber: currentSet,
      reps: repsCount,
      completed: true,
      skipped: false
    };

    setCompletedSets(prev => [...prev, newSet]);

    // Start rest timer
    const restTimeSeconds = parseInt(workoutExercises[currentExercise].restTime);
    setRestTimer(restTimeSeconds);
    setIsResting(true);

    // Check if all sets are complete for this exercise
    const exerciseSets = completedSets.filter(s => s.exerciseId === exerciseId);
    if (exerciseSets.length + 1 >= 3) { // Assuming 3 sets per exercise
      setCompletedExercises(prev => [...prev, exerciseId]);
      
      // Move to next exercise or show summary
      if (currentExercise < workoutExercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
      } else {
        setShowSummary(true);
        setWorkoutSession(prev => prev ? { ...prev, endTime: new Date() } : null);
      }
    } else {
      setCurrentSet(prev => prev + 1);
    }
  };

  const skipSet = () => {
    const exerciseId = workoutExercises[currentExercise].id;
    const newSet: SetProgress = {
      exerciseId,
      setNumber: currentSet,
      reps: 0,
      completed: false,
      skipped: true
    };

    setCompletedSets(prev => [...prev, newSet]);

    // Check if all sets are complete for this exercise
    const exerciseSets = completedSets.filter(s => s.exerciseId === exerciseId);
    if (exerciseSets.length + 1 >= 3) {
      if (currentExercise < workoutExercises.length - 1) {
        setCurrentExercise(currentExercise + 1);
        setCurrentSet(1);
      } else {
        setShowSummary(true);
        setWorkoutSession(prev => prev ? { ...prev, endTime: new Date() } : null);
      }
    } else {
      setCurrentSet(prev => prev + 1);
    }
  };

  const skipRest = () => {
    setRestTimer(0);
    setIsResting(false);
  };

  const nextExercise = () => {
    if (currentExercise < workoutExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    }
  };

  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      setCurrentSet(1);
    }
  };

  const progressPercentage = (completedExercises.length / workoutExercises.length) * 100;
  
  // Get current exercise sets progress
  const getCurrentExerciseSets = () => {
    const exerciseId = workoutExercises[currentExercise]?.id;
    return completedSets.filter(s => s.exerciseId === exerciseId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextExercise = () => {
    return currentExercise < workoutExercises.length - 1 
      ? workoutExercises[currentExercise + 1] 
      : null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Full Body Workout</h1>
        <p className="text-gray-600 mb-4">
          A complete workout targeting all major muscle groups with 4 essential movement patterns
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span>~20-30 minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Moderate Intensity</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Cancer-Friendly</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Workout Progress</span>
            <span className="text-sm text-gray-600">
              {completedExercises.length} / {workoutExercises.length} exercises
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Workout Controls */}
        <div className="flex justify-center gap-3 mb-6">
          {!workoutStarted ? (
            <Button onClick={startWorkout} size="lg" className="bg-green-600 hover:bg-green-700">
              <Play className="h-5 w-5 mr-2" />
              Start Workout
            </Button>
          ) : (
            <Button onClick={resetWorkout} variant="outline" size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset Workout
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guided">Guided Mode</TabsTrigger>
          <TabsTrigger value="details">Exercise Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Workout Structure */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold mb-2">Workout Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">1. Squat</div>
                <div className="text-gray-600">Lower Body Power</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">2. Push</div>
                <div className="text-gray-600">Upper Body Push</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">3. Pull</div>
                <div className="text-gray-600">Upper Body Pull</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">4. Core</div>
                <div className="text-gray-600">Core Stability</div>
              </div>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {workoutExercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id} 
                exercise={exercise}
                isCompleted={completedExercises.includes(exercise.id)}
                onComplete={() => toggleExerciseComplete(exercise.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Guided Mode Tab */}
        <TabsContent value="guided" className="space-y-6">
          {!showSummary ? (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              {/* Exercise Progress Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">
                    Exercise {currentExercise + 1} of {workoutExercises.length}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {formatTime(workoutTime)}
                  </div>
                </div>
                
                {/* Visual Progress Ticks */}
                <div className="flex space-x-2 mb-4">
                  {workoutExercises.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                        ${index < currentExercise ? 'bg-green-500 text-white' : 
                          index === currentExercise ? 'bg-blue-500 text-white' : 
                          'bg-gray-200 text-gray-500'}`}
                    >
                      {index < currentExercise ? '✓' : index + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rest Timer */}
              {isResting && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-center">
                    <h3 className="font-semibold text-yellow-800 mb-2">Rest Time</h3>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {formatTime(restTimer)}
                    </div>
                    <Button onClick={skipRest} variant="outline" size="sm">
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip Rest
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExerciseCard 
                  exercise={workoutExercises[currentExercise]}
                  isCompleted={completedExercises.includes(workoutExercises[currentExercise].id)}
                />
                
                <div className="space-y-4">
                  {/* Current Exercise Info */}
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Current Exercise</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {workoutExercises[currentExercise].name}
                    </p>
                    <p className="text-gray-600 mb-3">
                      {workoutExercises[currentExercise].instructions}
                    </p>
                    
                    {/* Sets Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Set Progress</span>
                        <span className="text-sm text-gray-600">
                          {getCurrentExerciseSets().length}/3 sets
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3].map((setNum) => {
                          const setCompleted = getCurrentExerciseSets().some(s => s.setNumber === setNum);
                          return (
                            <div
                              key={setNum}
                              className={`flex-1 h-2 rounded ${
                                setCompleted ? 'bg-green-500' : 
                                setNum === currentSet ? 'bg-blue-500' : 
                                'bg-gray-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Set Controls */}
                  <div className="bg-white p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Set {currentSet} of 3</h3>
                    
                    {/* Reps Counter */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Reps Completed</label>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => setRepsCount(Math.max(0, repsCount - 1))}
                          variant="outline"
                          size="sm"
                          disabled={isResting}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-16 text-center">{repsCount}</span>
                        <Button
                          onClick={() => setRepsCount(repsCount + 1)}
                          variant="outline"
                          size="sm"
                          disabled={isResting}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Set Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={markSetComplete}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isResting}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Set
                      </Button>
                      <Button
                        onClick={skipSet}
                        variant="outline"
                        disabled={isResting}
                      >
                        <SkipForward className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </div>

                  {/* Next Exercise Preview */}
                  {getNextExercise() && (
                    <div className="bg-white p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Next Up</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                          <img 
                            src={getYouTubeThumbnail(getNextExercise()!.videoId)}
                            alt={getNextExercise()!.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{getNextExercise()!.name}</p>
                          <p className="text-sm text-gray-600">{getNextExercise()!.category}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exercise Navigation */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={prevExercise} 
                      disabled={currentExercise === 0}
                      variant="outline"
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={nextExercise} 
                      disabled={currentExercise === workoutExercises.length - 1}
                      variant="outline"
                      className="flex-1"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WorkoutSummary 
              session={workoutSession}
              completedSets={completedSets}
              workoutTime={workoutTime}
              onRestart={resetWorkout}
              exercises={workoutExercises}
            />
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {workoutExercises.map((exercise) => (
                <Card key={exercise.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={getYouTubeThumbnail(exercise.videoId)}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{exercise.instructions}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Duration:</strong> {exercise.duration}</div>
                        <div><strong>Rest:</strong> {exercise.restTime}</div>
                        <div><strong>Equipment:</strong> {exercise.equipment}</div>
                        <div><strong>Difficulty:</strong> {exercise.difficulty}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sidebar with workout stats */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Workout Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Exercises:</span>
                    <span>{workoutExercises.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{completedExercises.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Equipment Needed</h3>
                <div className="space-y-1 text-sm">
                  <div>• Resistance Band</div>
                  <div>• Exercise Mat (optional)</div>
                  <div>• Water Bottle</div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Safety Tips</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Warm up before starting</li>
                  <li>• Listen to your body</li>
                  <li>• Stay hydrated</li>
                  <li>• Stop if you feel pain</li>
                  <li>• Modify as needed</li>
                </ul>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}