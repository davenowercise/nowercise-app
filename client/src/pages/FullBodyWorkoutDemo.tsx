import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Clock, Target, CheckCircle, RotateCcw, Plus, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Exercise {
  id: number;
  name: string;
  videoUrl: string;
  movementType: string;
  energyLevel: number;
  description?: string;
}

interface WorkoutExercise extends Exercise {
  sets: number;
  reps: string;
  restTime: string;
  completed: boolean;
  actualReps: number[];
  currentSet: number;
}

function FullBodyWorkoutDemo() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [workoutData, setWorkoutData] = useState<WorkoutExercise[]>([]);
  const [tempRepInput, setTempRepInput] = useState("");

  // Get exercises from the API
  const { data: allExercises, isLoading } = useQuery({
    queryKey: ['/api/exercises'],
  });

  // Create a full body workout with 10 diverse exercises
  const createFullBodyWorkout = (exercises: Exercise[]): WorkoutExercise[] => {
    if (!exercises || exercises.length === 0) return [];

    // Filter exercises with videos and select a diverse mix
    const videoExercises = exercises.filter(ex => ex.videoUrl);
    
    // Try to get a good mix of exercise types
    const selectedExercises = [
      // Upper body strength
      videoExercises.find(ex => ex.name.toLowerCase().includes('chest press') || ex.name.toLowerCase().includes('push')) || videoExercises[0],
      videoExercises.find(ex => ex.name.toLowerCase().includes('row') || ex.name.toLowerCase().includes('pull')) || videoExercises[1],
      videoExercises.find(ex => ex.name.toLowerCase().includes('curl') || ex.name.toLowerCase().includes('bicep')) || videoExercises[2],
      
      // Lower body strength  
      videoExercises.find(ex => ex.name.toLowerCase().includes('squat')) || videoExercises[3],
      videoExercises.find(ex => ex.name.toLowerCase().includes('lunge')) || videoExercises[4],
      videoExercises.find(ex => ex.name.toLowerCase().includes('step')) || videoExercises[5],
      
      // Core and functional
      videoExercises.find(ex => ex.name.toLowerCase().includes('core') || ex.name.toLowerCase().includes('ab')) || videoExercises[6],
      
      // Movement and cardio
      videoExercises.find(ex => ex.name.toLowerCase().includes('jump') || ex.name.toLowerCase().includes('cardio')) || videoExercises[7],
      
      // Flexibility/mobility
      videoExercises.find(ex => ex.name.toLowerCase().includes('stretch') || ex.name.toLowerCase().includes('mobility')) || videoExercises[8],
      
      // Balance/stability
      videoExercises.find(ex => ex.name.toLowerCase().includes('balance') || ex.name.toLowerCase().includes('gentle')) || videoExercises[9],
    ].filter(Boolean).slice(0, 10);

    // Add workout specifications to each exercise
    return selectedExercises.map((exercise, index) => ({
      ...exercise,
      sets: exercise.energyLevel <= 2 ? 2 : 3,
      reps: exercise.movementType === 'Strength' ? '8-12' : 
            exercise.name.toLowerCase().includes('gentle') ? '5-10' : '10-15',
      restTime: exercise.energyLevel <= 2 ? '60s' : '45s',
      completed: false,
      actualReps: [],
      currentSet: 0
    }));
  };

  const workout = workoutData.length > 0 ? workoutData : createFullBodyWorkout(allExercises || []);
  const totalExercises = workout.length;
  const completedCount = completedExercises.size;
  const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  const toggleExerciseComplete = (index: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedExercises(newCompleted);
  };

  const startWorkout = () => {
    const initialWorkout = createFullBodyWorkout(allExercises || []);
    setWorkoutData(initialWorkout);
    setWorkoutStarted(true);
    setCurrentExercise(0);
  };

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setCurrentExercise(0);
    setCompletedExercises(new Set());
    setWorkoutData([]);
    setTempRepInput("");
  };

  const nextExercise = () => {
    if (currentExercise < workout.length - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  const previousExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
    }
  };

  const addRepSet = () => {
    if (tempRepInput && !isNaN(Number(tempRepInput))) {
      const updatedWorkout = [...workoutData];
      const exercise = updatedWorkout[currentExercise];
      
      if (exercise) {
        exercise.actualReps.push(Number(tempRepInput));
        exercise.currentSet = exercise.actualReps.length;
        
        // Mark as completed if all sets are done
        if (exercise.actualReps.length >= exercise.sets) {
          setCompletedExercises(prev => new Set([...prev, currentExercise]));
        }
        
        setWorkoutData(updatedWorkout);
        setTempRepInput("");
      }
    }
  };

  const removeLastSet = () => {
    const updatedWorkout = [...workoutData];
    const exercise = updatedWorkout[currentExercise];
    
    if (exercise && exercise.actualReps.length > 0) {
      exercise.actualReps.pop();
      exercise.currentSet = exercise.actualReps.length;
      
      // Remove from completed if no longer all sets done
      if (exercise.actualReps.length < exercise.sets) {
        setCompletedExercises(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentExercise);
          return newSet;
        });
      }
      
      setWorkoutData(updatedWorkout);
    }
  };

  const getCurrentExercise = () => workoutData[currentExercise] || workout[currentExercise];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading workout...</div>
      </div>
    );
  }

  if (workout.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No video exercises available</h1>
          <p>Please sync your YouTube videos first to create workouts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Full Body Video Workout</h1>
          <p className="text-gray-600">
            A complete 10-exercise routine using your YouTube video library
          </p>
          
          {/* Progress */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{completedCount} of {totalExercises} completed</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
        </div>

        {!workoutStarted ? (
          /* Workout Overview */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Workout Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalExercises}</div>
                    <div className="text-sm text-blue-800">Exercises</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">25-35</div>
                    <div className="text-sm text-green-800">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">Full Body</div>
                    <div className="text-sm text-purple-800">Target</div>
                  </div>
                </div>
                
                <Button onClick={startWorkout} className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Workout
                </Button>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workout.map((exercise, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{exercise.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {exercise.sets} sets
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{exercise.reps} reps</span>
                      <span>Rest: {exercise.restTime}</span>
                    </div>
                    
                    {exercise.movementType && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {exercise.movementType}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Active Workout */
          <div className="space-y-6">
            {/* Current Exercise */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                      {currentExercise + 1}
                    </span>
                    {workout[currentExercise]?.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExerciseComplete(currentExercise)}
                  >
                    {completedExercises.has(currentExercise) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded-full" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getCurrentExercise() && (
                  <div className="space-y-4">
                    {/* Video */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getCurrentExercise().videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    
                    {/* Exercise Details */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-bold text-blue-600">{getCurrentExercise().sets}</div>
                        <div className="text-sm text-blue-800">Target Sets</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-bold text-green-600">{getCurrentExercise().reps}</div>
                        <div className="text-sm text-green-800">Target Reps</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-bold text-purple-600">{getCurrentExercise().restTime}</div>
                        <div className="text-sm text-purple-800">Rest</div>
                      </div>
                    </div>

                    {/* Rep Tracking */}
                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Track Your Reps</CardTitle>
                        <p className="text-sm text-gray-600">
                          Set {(getCurrentExercise().currentSet || 0) + 1} of {getCurrentExercise().sets}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Completed Sets Display */}
                        {getCurrentExercise().actualReps && getCurrentExercise().actualReps.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Completed Sets:</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getCurrentExercise().actualReps.map((reps, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1">
                                  Set {index + 1}: {reps} reps
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rep Input */}
                        {getCurrentExercise().actualReps.length < getCurrentExercise().sets && (
                          <div className="space-y-3">
                            <Label htmlFor="repInput" className="text-sm font-medium">
                              How many reps did you complete?
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="repInput"
                                type="number"
                                value={tempRepInput}
                                onChange={(e) => setTempRepInput(e.target.value)}
                                placeholder="Enter reps"
                                min="0"
                                max="100"
                                className="flex-1"
                              />
                              <Button onClick={addRepSet} disabled={!tempRepInput}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add Set
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Remove Last Set Button */}
                        {getCurrentExercise().actualReps && getCurrentExercise().actualReps.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeLastSet}
                            className="w-full"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove Last Set
                          </Button>
                        )}

                        {/* Exercise Completion Status */}
                        {getCurrentExercise().actualReps.length >= getCurrentExercise().sets && (
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Exercise Complete!</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                              Great job! You completed all {getCurrentExercise().sets} sets.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={previousExercise}
                disabled={currentExercise === 0}
                className="flex-1"
              >
                Previous
              </Button>
              
              {currentExercise === workout.length - 1 ? (
                <Button onClick={resetWorkout} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Complete Workout
                </Button>
              ) : (
                <Button onClick={nextExercise} className="flex-1">
                  Next Exercise
                </Button>
              )}
            </div>

            {/* Quick Exercise List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exercise List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workout.map((exercise, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        index === currentExercise
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentExercise(index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          completedExercises.has(index)
                            ? 'bg-green-500 text-white'
                            : index === currentExercise
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                        }`}>
                          {completedExercises.has(index) ? '✓' : index + 1}
                        </span>
                        <span className="text-sm">{exercise.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>{exercise.sets} × {exercise.reps}</div>
                        {exercise.actualReps && exercise.actualReps.length > 0 && (
                          <div className="text-green-600">
                            {exercise.actualReps.length}/{exercise.sets} completed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default FullBodyWorkoutDemo;