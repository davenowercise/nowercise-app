import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ArrowDown, ArrowUp, Clock, Dumbbell, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import ComorbidityWarnings from './comorbidity-warnings';

// Types for program building
interface Exercise {
  id: number;
  name: string;
  description: string;
  targetMuscleGroup: string;
  difficulty: number;
  energyLevel: number;
  equipment: string[];
  movementType: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgramWorkout {
  id?: number;
  exerciseId: number;
  programId?: number;
  sets: number;
  reps: number;
  duration?: number;
  restPeriod?: number;
  day: number;
  order: number;
  notes?: string;
  exercise?: Exercise;
}

interface Program {
  id?: number;
  name: string;
  description: string;
  difficulty: number;
  duration: number;
  frequency: number;
  targetEnergyLevel: number;
  createdById: string;
  isTemplate: boolean;
  cancerTypes?: string[];
  treatmentPhases?: string[];
  workouts?: ProgramWorkout[];
  createdAt?: string;
  updatedAt?: string;
}

interface PatientProfile {
  cancerType?: string;
  treatmentStage?: string;
  energyLevel?: number;
  comorbidities?: string[];
}

interface ProgramBuilderProps {
  programId?: number;
  patientId?: string;
  onSave?: (program: Program) => void;
}

const ProgramBuilder: React.FC<ProgramBuilderProps> = ({ programId, patientId, onSave }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [programData, setProgramData] = useState<Program>({
    name: '',
    description: '',
    difficulty: 3,
    duration: 4,
    frequency: 3,
    targetEnergyLevel: 5,
    createdById: '',
    isTemplate: true,
    cancerTypes: [],
    treatmentPhases: [],
    workouts: []
  });
  
  const [currentTab, setCurrentTab] = useState('details');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newWorkout, setNewWorkout] = useState<Partial<ProgramWorkout>>({
    sets: 3,
    reps: 10,
    day: 1,
    order: 1,
    restPeriod: 60
  });

  // Get existing program if editing
  const { data: existingProgram, isLoading: programLoading } = useQuery({
    queryKey: ['/api/programs', programId],
    enabled: !!programId,
  });

  // Get patient profile if building for a specific patient
  const { data: patientProfile } = useQuery<PatientProfile>({
    queryKey: ['/api/patient/profile', patientId],
    enabled: !!patientId,
  });

  // Get all exercises
  const { data: exercises, isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
  });

  // Create program mutation
  const createProgramMutation = useMutation({
    mutationFn: (newProgram: Program) => {
      return apiRequest('/api/programs', {
        method: 'POST',
        data: newProgram
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      toast({
        title: 'Program Created',
        description: 'Your program has been successfully created.',
      });
      
      if (onSave) onSave(data);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create program. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Update program mutation
  const updateProgramMutation = useMutation({
    mutationFn: (updatedProgram: Program) => {
      return apiRequest(`/api/programs/${programId}`, {
        method: 'PATCH',
        data: updatedProgram
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs', programId] });
      toast({
        title: 'Program Updated',
        description: 'Your program has been successfully updated.',
      });
      
      if (onSave) onSave(data);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update program. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Initialize form with existing program data
  React.useEffect(() => {
    if (existingProgram) {
      setProgramData({
        ...existingProgram,
        workouts: existingProgram.workouts || []
      });
    }
  }, [existingProgram]);

  // Handle program details change
  const handleProgramChange = (field: keyof Program, value: any) => {
    setProgramData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle new workout change
  const handleWorkoutChange = (field: keyof ProgramWorkout, value: any) => {
    setNewWorkout(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add exercise to program
  const addExerciseToProgram = () => {
    if (!selectedExercise) return;
    
    const maxOrder = programData.workouts?.filter(w => w.day === selectedDay)
      .reduce((max, w) => Math.max(max, w.order), 0) || 0;
    
    const workout: ProgramWorkout = {
      exerciseId: selectedExercise.id,
      sets: newWorkout.sets || 3,
      reps: newWorkout.reps || 10,
      day: selectedDay,
      order: maxOrder + 1,
      restPeriod: newWorkout.restPeriod || 60,
      duration: newWorkout.duration,
      notes: newWorkout.notes,
      exercise: selectedExercise
    };
    
    setProgramData(prev => ({
      ...prev,
      workouts: [...(prev.workouts || []), workout]
    }));
    
    setShowExerciseDialog(false);
    setSelectedExercise(null);
    setNewWorkout({
      sets: 3,
      reps: 10,
      day: selectedDay,
      order: 1,
      restPeriod: 60
    });
  };

  // Remove workout from program
  const removeWorkout = (exerciseId: number, day: number, order: number) => {
    setProgramData(prev => ({
      ...prev,
      workouts: prev.workouts?.filter(w => 
        !(w.exerciseId === exerciseId && w.day === day && w.order === order)
      ) || []
    }));
  };

  // Reorder workout
  const moveWorkout = (exerciseId: number, day: number, order: number, direction: 'up' | 'down') => {
    const workouts = [...(programData.workouts || [])];
    const index = workouts.findIndex(w => 
      w.exerciseId === exerciseId && w.day === day && w.order === order
    );
    
    if (index === -1) return;
    
    const newOrder = direction === 'up' ? order - 1 : order + 1;
    const swapIndex = workouts.findIndex(w => w.day === day && w.order === newOrder);
    
    if (swapIndex === -1) return;
    
    // Swap orders
    workouts[index].order = newOrder;
    workouts[swapIndex].order = order;
    
    setProgramData(prev => ({
      ...prev,
      workouts
    }));
  };

  // Save program
  const saveProgram = () => {
    if (!programData.name) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name for your program.',
        variant: 'destructive',
      });
      return;
    }
    
    if (programId) {
      updateProgramMutation.mutate(programData);
    } else {
      createProgramMutation.mutate(programData);
    }
  };

  // Filter exercises based on search
  const filteredExercises = exercises?.filter(ex => 
    ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    ex.targetMuscleGroup.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
    ex.movementType.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
  ) || [];

  // Get workouts for the selected day
  const getDayWorkouts = (day: number) => {
    return programData.workouts?.filter(w => w.day === day)
      .sort((a, b) => a.order - b.order) || [];
  };

  // Generate day tabs
  const dayTabs = Array.from({ length: programData.duration || 1 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {programId ? 'Edit Program' : 'Create New Program'}
          </CardTitle>
          <CardDescription>
            {programId 
              ? 'Make changes to your existing program' 
              : 'Design a new exercise program from scratch'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details">Program Details</TabsTrigger>
              <TabsTrigger value="workouts">Exercises & Workouts</TabsTrigger>
            </TabsList>
            
            {/* Program Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Beginner Strength Training"
                    value={programData.name}
                    onChange={(e) => handleProgramChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this program is about and who it's for..."
                    value={programData.description}
                    onChange={(e) => handleProgramChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (Weeks)</Label>
                    <Select 
                      value={programData.duration?.toString()} 
                      onValueChange={(value) => handleProgramChange('duration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Program duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 6, 8, 12].map((weeks) => (
                          <SelectItem key={weeks} value={weeks.toString()}>
                            {weeks} {weeks === 1 ? 'week' : 'weeks'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frequency (Days per Week)</Label>
                    <Select 
                      value={programData.frequency?.toString()} 
                      onValueChange={(value) => handleProgramChange('frequency', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Days per week" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                          <SelectItem key={days} value={days.toString()}>
                            {days} {days === 1 ? 'day' : 'days'} per week
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Target Energy Level</Label>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[programData.targetEnergyLevel || 5]}
                        onValueChange={(values) => handleProgramChange('targetEnergyLevel', values[0])}
                      />
                      <div className="flex justify-between text-xs">
                        <span>Very Low</span>
                        <span>Moderate</span>
                        <span>Very High</span>
                      </div>
                      <div className="text-center font-medium">
                        {programData.targetEnergyLevel}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Difficulty Level</Label>
                    <div className="space-y-2">
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[programData.difficulty || 3]}
                        onValueChange={(values) => handleProgramChange('difficulty', values[0])}
                      />
                      <div className="flex justify-between text-xs">
                        <span>Easy</span>
                        <span>Medium</span>
                        <span>Hard</span>
                      </div>
                      <div className="text-center font-medium">
                        {programData.difficulty}/5
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Cancer Types</Label>
                  <Select 
                    value={programData.cancerTypes?.[0] || ''} 
                    onValueChange={(value) => handleProgramChange('cancerTypes', [value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breast">Breast Cancer</SelectItem>
                      <SelectItem value="prostate">Prostate Cancer</SelectItem>
                      <SelectItem value="colorectal">Colorectal Cancer</SelectItem>
                      <SelectItem value="lung">Lung Cancer</SelectItem>
                      <SelectItem value="lymphoma">Lymphoma</SelectItem>
                      <SelectItem value="leukemia">Leukemia</SelectItem>
                      <SelectItem value="melanoma">Melanoma</SelectItem>
                      <SelectItem value="multiple">Multiple Cancer Types</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Treatment Phases</Label>
                  <Select 
                    value={programData.treatmentPhases?.[0] || ''} 
                    onValueChange={(value) => handleProgramChange('treatmentPhases', [value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pretreatment">Pre-Treatment</SelectItem>
                      <SelectItem value="inTreatment">During Active Treatment</SelectItem>
                      <SelectItem value="postTreatment">Post-Treatment</SelectItem>
                      <SelectItem value="remission">Remission/Survivorship</SelectItem>
                      <SelectItem value="palliative">Palliative Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={programData.isTemplate}
                      onChange={(e) => handleProgramChange('isTemplate', e.target.checked)}
                    />
                    Save as template for future use
                  </Label>
                </div>
                
                {patientProfile && (
                  <Card className="bg-muted/50 border-dashed">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Patient Compatibility</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-4 pb-3">
                      <div className="space-y-2 text-sm">
                        {patientProfile.cancerType && programData.cancerTypes && programData.cancerTypes.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-32 text-muted-foreground">Cancer Type:</div>
                            <Badge variant={programData.cancerTypes.includes(patientProfile.cancerType) ? "default" : "outline"}>
                              {programData.cancerTypes.includes(patientProfile.cancerType) ? "Match" : "Different"}
                            </Badge>
                          </div>
                        )}
                        
                        {patientProfile.treatmentStage && programData.treatmentPhases && programData.treatmentPhases.length > 0 && (
                          <div className="flex items-center">
                            <div className="w-32 text-muted-foreground">Treatment Phase:</div>
                            <Badge variant={programData.treatmentPhases.includes(patientProfile.treatmentStage) ? "default" : "outline"}>
                              {programData.treatmentPhases.includes(patientProfile.treatmentStage) ? "Match" : "Different"}
                            </Badge>
                          </div>
                        )}
                        
                        {patientProfile.energyLevel && programData.targetEnergyLevel && (
                          <div className="flex items-center">
                            <div className="w-32 text-muted-foreground">Energy Level:</div>
                            <Badge variant={Math.abs(patientProfile.energyLevel - programData.targetEnergyLevel) <= 2 ? "default" : "outline"}>
                              {Math.abs(patientProfile.energyLevel - programData.targetEnergyLevel) <= 2 ? "Appropriate" : "Mismatch"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-4">
              {/* Day selector */}
              <div className="flex space-x-1 overflow-x-auto pb-2">
                {dayTabs.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "default" : "outline"}
                    className="rounded-full px-3 py-1 h-auto text-sm"
                    onClick={() => setSelectedDay(day)}
                  >
                    Day {day}
                  </Button>
                ))}
              </div>
              
              {/* Workouts for selected day */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Day {selectedDay} Workout</h3>
                  
                  <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Exercise
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Exercise to Day {selectedDay}</DialogTitle>
                        <DialogDescription>
                          Search and select an exercise to add to this workout.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 my-2">
                        <Input
                          placeholder="Search exercises by name, muscle group, or type..."
                          value={exerciseSearchQuery}
                          onChange={(e) => setExerciseSearchQuery(e.target.value)}
                        />
                        
                        <div className="h-60 overflow-y-auto space-y-2">
                          {filteredExercises.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                              No exercises found. Try a different search.
                            </p>
                          ) : (
                            filteredExercises.map(exercise => (
                              <div 
                                key={exercise.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedExercise?.id === exercise.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => setSelectedExercise(exercise)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{exercise.name}</h4>
                                    <div className="text-sm text-muted-foreground">
                                      {exercise.targetMuscleGroup} • {exercise.movementType}
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    Energy: {exercise.energyLevel}/10
                                  </Badge>
                                </div>
                                
                                {selectedExercise?.id === exercise.id && patientProfile?.comorbidities && (
                                  <ComorbidityWarnings 
                                    exercise={exercise}
                                    comorbidities={patientProfile.comorbidities}
                                  />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        
                        {selectedExercise && (
                          <div className="space-y-4 border-t pt-4 mt-4">
                            <h4 className="font-medium">Configure Exercise</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label htmlFor="sets">Sets</Label>
                                <Input
                                  id="sets"
                                  type="number"
                                  min={1}
                                  value={newWorkout.sets || 3}
                                  onChange={(e) => handleWorkoutChange('sets', parseInt(e.target.value))}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="reps">Reps</Label>
                                <Input
                                  id="reps"
                                  type="number"
                                  min={1}
                                  value={newWorkout.reps || 10}
                                  onChange={(e) => handleWorkoutChange('reps', parseInt(e.target.value))}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="rest">Rest (seconds)</Label>
                                <Input
                                  id="rest"
                                  type="number"
                                  min={0}
                                  value={newWorkout.restPeriod || 60}
                                  onChange={(e) => handleWorkoutChange('restPeriod', parseInt(e.target.value))}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor="duration">Duration (optional, minutes)</Label>
                                <Input
                                  id="duration"
                                  type="number"
                                  min={0}
                                  value={newWorkout.duration || ''}
                                  onChange={(e) => handleWorkoutChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <Label htmlFor="notes">Notes (optional)</Label>
                              <Textarea
                                id="notes"
                                placeholder="E.g., Focus on form, modify as needed..."
                                value={newWorkout.notes || ''}
                                onChange={(e) => handleWorkoutChange('notes', e.target.value)}
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExerciseDialog(false)}>Cancel</Button>
                        <Button 
                          onClick={addExerciseToProgram}
                          disabled={!selectedExercise}
                        >
                          Add to Program
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {getDayWorkouts(selectedDay).length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <Dumbbell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                      <p className="text-muted-foreground">No exercises added yet.</p>
                      <p className="text-sm text-muted-foreground">Click "Add Exercise" to build your workout.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {getDayWorkouts(selectedDay).map((workout, index) => (
                      <Card key={`${workout.exerciseId}-${workout.day}-${workout.order}`} className="overflow-hidden">
                        <div className="bg-primary h-1" />
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center mb-1">
                                <span className="text-muted-foreground text-sm font-medium mr-2">
                                  {index + 1}.
                                </span>
                                <h4 className="font-medium">
                                  {workout.exercise?.name}
                                </h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/10">
                                  {workout.sets} sets × {workout.reps} reps
                                </Badge>
                                
                                {workout.restPeriod && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {workout.restPeriod}s rest
                                  </Badge>
                                )}
                                
                                {workout.duration && (
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {workout.duration} min
                                  </Badge>
                                )}
                              </div>
                              
                              {workout.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {workout.notes}
                                </p>
                              )}

                              {patientProfile?.comorbidities && workout.exercise && (
                                <ComorbidityWarnings 
                                  exercise={workout.exercise}
                                  comorbidities={patientProfile.comorbidities}
                                />
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === 0}
                                onClick={() => moveWorkout(workout.exerciseId, workout.day, workout.order, 'up')}
                              >
                                <ArrowUp className="h-4 w-4" />
                                <span className="sr-only">Move up</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === getDayWorkouts(selectedDay).length - 1}
                                onClick={() => moveWorkout(workout.exerciseId, workout.day, workout.order, 'down')}
                              >
                                <ArrowDown className="h-4 w-4" />
                                <span className="sr-only">Move down</span>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeWorkout(workout.exerciseId, workout.day, workout.order)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {programData.workouts && programData.workouts.length > 0 && (
                  <div className="flex justify-end pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>
                        Remember to add exercises for all {programData.duration} days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={saveProgram}
            disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
          >
            {createProgramMutation.isPending || updateProgramMutation.isPending ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Program
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProgramBuilder;