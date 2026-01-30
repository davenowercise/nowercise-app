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

  const workout = workoutData.length > 0 ? workoutData : createFullBodyWorkout(Array.isArray(allExercises) ? allExercises : []);
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
    const initialWorkout = createFullBodyWorkout(Array.isArray(allExercises) ? allExercises : []);
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
          setCompletedExercises(prev => new Set([...Array.from(prev), currentExercise]));
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

  const getCurrentExercise = () => {
    // Always use workoutData if workout has started, otherwise use original workout
    if (workoutStarted && workoutData.length > 0) {
      return workoutData[currentExercise];
    }
    return workout[currentExercise];
  };

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
        {/* Encouraging Header */}
        <div className="mb-6">
          <div className="card-comfort p-6 text-center">
            <h1 className="text-4xl font-bold mb-3 text-gray-800">🌟 Your Strength Journey Starts Here!</h1>
            <p className="text-xl text-gray-600 mb-4">
              Every movement is a victory - let's celebrate your progress together
            </p>
            
            {/* Progress with Hope */}
            <div className="mt-6 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="progress-hope h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-lg font-medium text-gray-700 mt-3">
              <span>🎯 {completedCount} victories achieved!</span>
              <span>✨ {Math.round(progressPercentage)}% amazing!</span>
            </div>
            
            {progressPercentage > 0 && (
              <div className="mt-3 px-4 py-2 bg-info-panel rounded-xl inline-block">
                <p className="text-accent-blue font-medium">💪 You're doing incredible - keep going!</p>
              </div>
            )}
          </div>
        </div>

        {!workoutStarted ? (
          /* Workout Overview */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-action-blue" />
                  </div>
                  Ready for Your Amazing Session? 🎯
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="encouragement-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{totalExercises}</div>
                    <div className="text-blue-800 font-medium">Amazing Exercises</div>
                    <div className="text-sm text-blue-600 mt-1">🎯 Each one a victory!</div>
                  </div>
                  <div className="encouragement-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-action-blue mb-1">25-35</div>
                    <div className="text-action-blue font-medium">Gentle Minutes</div>
                    <div className="text-sm text-action-blue mt-1">⏰ At your own pace</div>
                  </div>
                  <div className="encouragement-card p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-1">Perfect</div>
                    <div className="text-purple-800 font-medium">Just For You</div>
                    <div className="text-sm text-purple-600 mt-1">✨ Adapted with care</div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-gray-600 mb-4">Ready to take this step in your recovery journey? You've got this! 💪</p>
                  <Button onClick={startWorkout} className="btn-gentle bg-action-blue hover:bg-action-blue-hover text-white px-8 py-4 text-lg" size="lg">
                    <Play className="h-6 w-6 mr-3" />
                    🚀 Let's Begin Together!
                  </Button>
                </div>
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
                      <CheckCircle className="h-4 w-4 text-action-blue" />
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
                        src={getCurrentExercise()?.videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    
                    {/* Exercise Description */}
                    {getCurrentExercise()?.description && (
                      <Card className="bg-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Exercise Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-gray-800 leading-relaxed space-y-3">
                            {getCurrentExercise()?.description?.includes('.') ? (
                              getCurrentExercise()?.description?.split(/(?=\d+\.)/g).filter(step => step.trim()).map((step, index) => (
                                <div key={index} className="mb-3">
                                  <p className="text-base text-gray-900 leading-relaxed">
                                    {step.trim()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-base text-gray-800 leading-relaxed">{getCurrentExercise()?.description}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Exercise Details */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-bold text-blue-600">{getCurrentExercise()?.sets}</div>
                        <div className="text-sm text-blue-800">Target Sets</div>
                      </div>
                      <div className="p-3 bg-info-panel rounded-lg">
                        <div className="font-bold text-action-blue">{getCurrentExercise()?.reps}</div>
                        <div className="text-sm text-action-blue">Target Reps</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-bold text-purple-600">{getCurrentExercise()?.restTime}</div>
                        <div className="text-sm text-purple-800">Rest</div>
                      </div>
                    </div>

                    {/* Rep Tracking */}
                    <Card className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Track Your Reps</CardTitle>
                        {getCurrentExercise()?.actualReps && getCurrentExercise()?.actualReps.length < getCurrentExercise()?.sets ? (
                          <p className="text-sm text-gray-600">
                            Ready to start Set {getCurrentExercise().actualReps.length + 1} of {getCurrentExercise().sets}
                          </p>
                        ) : (
                          <p className="text-sm text-action-blue">
                            All {getCurrentExercise().sets} sets completed!
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Sets Progress Grid */}
                        <div className="grid grid-cols-1 gap-3">
                          {Array.from({ length: getCurrentExercise().sets }).map((_, setIndex) => {
                            const isCompleted = setIndex < getCurrentExercise().actualReps.length;
                            const isCurrent = setIndex === getCurrentExercise().actualReps.length;
                            const repsCompleted = isCompleted ? getCurrentExercise().actualReps[setIndex] : null;
                            
                            return (
                              <div
                                key={setIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCompleted
                                    ? 'bg-info-panel border-info-border'
                                    : isCurrent
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">
                                      Set {setIndex + 1}
                                    </span>
                                    {isCompleted && repsCompleted !== null && (
                                      <span className="font-bold text-lg text-accent-blue">
                                        {repsCompleted} reps
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Inline Rep Counter for Current Set */}
                                    {isCurrent && !isCompleted && (
                                      <div className="flex items-center gap-1 bg-white rounded-lg border p-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const currentReps = parseInt(tempRepInput) || 0;
                                            if (currentReps > 0) {
                                              setTempRepInput((currentReps - 1).toString());
                                            }
                                          }}
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm font-medium w-8 text-center">
                                          {tempRepInput || '0'}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const currentReps = parseInt(tempRepInput) || 0;
                                            setTempRepInput((currentReps + 1).toString());
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                    {isCompleted && (
                                      <CheckCircle className="h-5 w-5 text-action-blue" />
                                    )}
                                    {isCurrent && !isCompleted && (
                                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                                        Current
                                      </Badge>
                                    )}
                                    {!isCompleted && !isCurrent && (
                                      <Badge variant="outline" className="text-gray-500">
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs text-gray-500">
                                    Target: {getCurrentExercise().reps} reps
                                  </div>
                                  {isCurrent && !isCompleted && tempRepInput && (
                                    <Button
                                      size="sm"
                                      onClick={addRepSet}
                                      className="h-6 text-xs px-2"
                                    >
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Rep Input */}
                        {getCurrentExercise().actualReps.length < getCurrentExercise().sets && (
                          <div className="space-y-3">
                            <Label htmlFor="repInput" className="text-sm font-medium">
                              Set {getCurrentExercise().actualReps.length + 1}: How many reps did you complete?
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="repInput"
                                type="number"
                                value={tempRepInput}
                                onChange={(e) => setTempRepInput(e.target.value)}
                                placeholder={`Reps for set ${getCurrentExercise().actualReps.length + 1}`}
                                min="0"
                                max="100"
                                className="flex-1"
                              />
                              <Button onClick={addRepSet} disabled={!tempRepInput}>
                                <Plus className="h-4 w-4 mr-1" />
                                Complete Set {getCurrentExercise().actualReps.length + 1}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Target: {getCurrentExercise().reps} reps per set
                            </p>
                          </div>
                        )}

                        {/* Remove Last Set Button */}
                        {getCurrentExercise().actualReps && getCurrentExercise().actualReps.length > 0 && getCurrentExercise().actualReps.length < getCurrentExercise().sets && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeLastSet}
                            className="w-full"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove Set {getCurrentExercise().actualReps.length} ({getCurrentExercise().actualReps[getCurrentExercise().actualReps.length - 1]} reps)
                          </Button>
                        )}

                        {/* Exercise Completion Status */}
                        {getCurrentExercise().actualReps.length >= getCurrentExercise().sets && (
                          <div className="p-3 bg-info-panel rounded-lg border border-info-border">
                            <div className="flex items-center gap-2 text-accent-blue">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">Exercise Complete!</span>
                            </div>
                            <p className="text-sm text-action-blue mt-1">
                              Great job! You completed all {getCurrentExercise().sets} sets.
                            </p>
                            <p className="text-xs text-action-blue mt-1">
                              Total reps: {getCurrentExercise().actualReps.reduce((sum, reps) => sum + reps, 0)}
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
                            ? 'bg-action-blue text-white'
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
                          <div className="text-action-blue">
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