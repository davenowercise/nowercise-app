import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ExternalLink, Timer, Target, CheckCircle, RotateCcw, Users, Award, Clock, Zap } from "lucide-react";
import { useState } from "react";

// Exercise data from the CSV
const workoutExercises = [
  {
    id: 1,
    name: "Goblet Squat",
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
    tags: ["band", "upper body"],
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
    tags: ["band", "upper body"],
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
    name: "7 MIN DAILY ABS WORKOUT",
    category: "Core",
    videoUrl: "https://www.youtube.com/watch?v=UhgEocboADQ",
    videoId: "UhgEocboADQ",
    tags: ["core", "bodyweight"],
    instructions: "Complete 7-minute core routine targeting all abdominal muscles with bodyweight exercises.",
    energyLevel: 3,
    equipment: "Bodyweight",
    duration: "7 minutes",
    restTime: "Follow video timing",
    muscleGroups: ["Abs", "Obliques", "Deep Core"],
    difficulty: "Beginner to Intermediate",
    modifications: [
      "Beginner: Take extra rest between exercises",
      "Advanced: Add ankle weights",
      "Back issues: Skip crunching movements"
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

export function FullBodyWorkout() {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutTime, setWorkoutTime] = useState(0);

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
    setCompletedExercises([]);
  };

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setCurrentExercise(0);
    setCompletedExercises([]);
    setWorkoutTime(0);
  };

  const nextExercise = () => {
    if (currentExercise < workoutExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
    }
  };

  const progressPercentage = (completedExercises.length / workoutExercises.length) * 100;

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
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Exercise {currentExercise + 1} of {workoutExercises.length}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExerciseCard 
                exercise={workoutExercises[currentExercise]}
                isCompleted={completedExercises.includes(workoutExercises[currentExercise].id)}
                onComplete={() => toggleExerciseComplete(workoutExercises[currentExercise].id)}
              />
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Current Exercise</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {workoutExercises[currentExercise].name}
                  </p>
                  <p className="text-gray-600 mt-2">
                    {workoutExercises[currentExercise].instructions}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Exercise Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Sets & Reps:</strong> {workoutExercises[currentExercise].duration}</div>
                    <div><strong>Rest Time:</strong> {workoutExercises[currentExercise].restTime}</div>
                    <div><strong>Equipment:</strong> {workoutExercises[currentExercise].equipment}</div>
                    <div><strong>Difficulty:</strong> {workoutExercises[currentExercise].difficulty}</div>
                  </div>
                </div>

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
                    className="flex-1"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
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