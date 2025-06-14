import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Program, Exercise } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Calendar,
  ChevronRight,
  Dumbbell,
  PlayCircle,
  Clock,
  Edit
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ProgramBuilder } from "@/components/programs/program-builder";

const programFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 week").max(24, "Duration cannot exceed 24 weeks")
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

export default function Programs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProgramBuilderOpen, setIsProgramBuilderOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  
  const isSpecialist = user?.role === "specialist";
  
  // Debug state changes
  console.log("Programs page render - isProgramBuilderOpen:", isProgramBuilderOpen);
  console.log("User role:", user?.role, "isSpecialist:", isSpecialist);
  console.log("Full user object:", user);

  // Form handling
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 6
    }
  });

  const { formState, handleSubmit, register, reset } = form;
  const { errors, isSubmitting } = formState;

  // Fetch programs
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  // Fetch exercises for adding to programs
  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Workout tracking state
  const [workoutInputs, setWorkoutInputs] = useState<Record<number, any>>({});

  // Workout saving mutation
  const saveWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      return await apiRequest("/api/workout-logs", {
        method: "POST",
        data: workoutData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Workout Saved",
        description: "Your workout has been successfully logged!",
      });
      // Reset inputs after saving
      setWorkoutInputs({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle workout save function
  const handleSaveWorkout = (workout: any) => {
    const workoutData = workoutInputs[workout.id];
    if (!workoutData) {
      toast({
        title: "No data to save",
        description: "Please enter workout data before saving.",
        variant: "destructive",
      });
      return;
    }

    // Prepare workout data for API
    const sets = [];
    for (let i = 1; i <= 3; i++) {
      const setData = workoutData.sets?.[i];
      if (setData && (setData.reps || setData.weight)) {
        sets.push({
          setNumber: i,
          actualReps: setData.reps ? parseInt(setData.reps) : null,
          weight: setData.weight ? parseFloat(setData.weight) : null,
          notes: setData.notes || null,
        });
      }
    }

    if (sets.length === 0) {
      toast({
        title: "No sets to save",
        description: "Please complete at least one set before saving.",
        variant: "destructive",
      });
      return;
    }

    const workoutLogData = {
      exerciseId: workout.id,
      sets: sets,
      notes: workoutData.generalNotes || null,
    };

    saveWorkoutMutation.mutate(workoutLogData);
  };

  // Helper function to update workout inputs
  const updateWorkoutInput = (workoutId: number, field: string, value: any) => {
    setWorkoutInputs(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        [field]: value
      }
    }));
  };

  const updateSetInput = (workoutId: number, setNumber: number, field: string, value: any) => {
    setWorkoutInputs(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        sets: {
          ...prev[workoutId]?.sets,
          [setNumber]: {
            ...prev[workoutId]?.sets?.[setNumber],
            [field]: value
          }
        }
      }
    }));
  };

  // Filter programs based on search term
  const filteredPrograms = programs?.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: ProgramFormValues) => {
    try {
      await apiRequest("POST", "/api/programs", data);
      
      toast({
        title: "Program created",
        description: "The program has been created successfully",
        variant: "default",
      });
      
      reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
    } catch (error) {
      toast({
        title: "Failed to create program",
        description: "There was an error creating the program. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle saving program from the advanced builder
  const handleSaveProgram = async (program: any) => {
    try {
      // Create the program first
      const programResponse = await apiRequest("POST", "/api/programs", {
        name: program.name,
        description: program.description,
        duration: program.duration,
        treatmentPhases: program.treatmentPhases,
        programType: `Tier ${program.targetTier}`,
        difficultyLevel: program.targetTier,
      });

      // Add exercises to the program
      if (program.exercises && program.exercises.length > 0) {
        for (const exercise of program.exercises) {
          await apiRequest("POST", "/api/program-exercises", {
            programId: programResponse.id,
            exerciseId: exercise.exerciseId,
            day: exercise.day,
            order: exercise.order,
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            duration: exercise.duration || null,
            notes: exercise.notes || null,
            isOptional: exercise.isOptional || false,
          });
        }
      }

      toast({
        title: "Program created successfully",
        description: `${program.name} has been created with ${program.exercises.length} exercises`,
        variant: "default",
      });

      setIsProgramBuilderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
    } catch (error) {
      toast({
        title: "Failed to create program",
        description: "There was an error creating the program. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProgram = (program: Program) => {
    setSelectedProgram(program);
    setIsViewDialogOpen(true);
  };

  // Fetch program exercises when viewing a program
  const { data: programExercises = [] } = useQuery({
    queryKey: ["/api/programs", selectedProgram?.id, "exercises"],
    queryFn: async () => {
      if (!selectedProgram?.id) return [];
      const response = await fetch(`/api/programs/${selectedProgram.id}/exercises?demo=true`);
      return response.json();
    },
    enabled: !!selectedProgram?.id && isViewDialogOpen,
  });

  // Mock function for program workouts (would be replaced with actual API call)
  const getProgramWorkouts = async (programId: number) => {
    try {
      const response = await fetch(`/api/programs/${programId}/workouts`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching program workouts:", error);
      return [];
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">
            {isSpecialist ? "Program Builder" : "My Programs"}
          </h1>
          <p className="text-gray-500">
            {isSpecialist 
              ? "Create and manage exercise programs for your patients" 
              : "View and follow your prescribed exercise programs"
            }
          </p>
        </div>

        <div className="flex mt-4 md:mt-0 w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:flex-grow-0">
            <Input
              type="text"
              placeholder="Search programs..."
              className="pl-8 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {isSpecialist && (
            <Button 
              className="bg-primary whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("New Program button clicked, current state:", isProgramBuilderOpen);
                setIsProgramBuilderOpen(true);
                console.log("State should now be true");
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> New Program
            </Button>
          )}
          
          {isSpecialist && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" /> Quick Program
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Program</DialogTitle>
                  <DialogDescription>
                    Create a new exercise program for your patients.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Program Name</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" {...register("description")} />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (in weeks)</Label>
                      <Input 
                        id="duration" 
                        type="number" 
                        min="1"
                        max="24"
                        {...register("duration")} 
                      />
                      {errors.duration && (
                        <p className="text-sm text-red-500">{errors.duration.message}</p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      After creating the program, you'll be able to add exercises to it.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Program"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-4">
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPrograms && filteredPrograms.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{program.duration} weeks</span>
                    </div>
                  </div>
                  {isSpecialist && (
                    <Badge className="bg-primary-light/20 text-primary">
                      Created by you
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {program.description || "No description provided."}
                </p>
                
                {!isSpecialist && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Week 2 of {program.duration}</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewProgram(program)}
                >
                  {isSpecialist ? "Edit Exercises" : "View Details"}
                </Button>
                {isSpecialist ? (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <Button variant="default" size="sm" className="bg-primary">
                    Start Workout
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No programs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `No programs matching "${searchTerm}"`
                : isSpecialist
                  ? "You haven't created any programs yet."
                  : "You don't have any assigned programs yet."
              }
            </p>
            {isSpecialist && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Your First Program
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* View/Edit Program Dialog */}
      {selectedProgram && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProgram.name}</DialogTitle>
              <DialogDescription>
                {selectedProgram.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium">{selectedProgram.duration} week program</span>
                </div>
                
                {isSpecialist && (
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Exercise
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {programExercises.length > 0 ? (
                  // Group exercises by day
                  Object.entries(
                    programExercises.reduce((acc: any, workout: any) => {
                      if (!acc[workout.day]) acc[workout.day] = [];
                      acc[workout.day].push(workout);
                      return acc;
                    }, {})
                  ).map(([day, dayExercises]: [string, any]) => (
                    <div key={day} className="bg-gray-50 rounded-md p-4">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Dumbbell className="h-5 w-5 text-primary mr-2" />
                        Day {day} Exercises
                      </h3>
                      
                      <div className="space-y-2">
                        {(dayExercises as any[]).map((workout: any, index: number) => (
                          <div key={index} className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Exercise Info & Video */}
                              <div>
                                <h4 className="font-medium text-lg mb-1">{workout.exercise.name}</h4>
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                  <Badge variant="outline" className="mr-2 text-xs">
                                    Energy Level {workout.exercise.energyLevel}
                                  </Badge>
                                  <span className="flex items-center mr-3">
                                    <Dumbbell className="h-3 w-3 mr-1" /> {workout.sets || 0} sets
                                  </span>
                                  <span className="flex items-center mr-3">
                                    <PlayCircle className="h-3 w-3 mr-1" /> {workout.reps || 0} reps
                                  </span>
                                </div>
                                {workout.notes && (
                                  <p className="text-sm text-gray-600 mb-3">{workout.notes}</p>
                                )}
                                
                                {/* Progress Indicator */}
                                <div className="mb-3 p-2 bg-green-50 rounded text-xs">
                                  <div className="flex items-center text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span>Last completed: Never | Best: --</span>
                                  </div>
                                </div>
                                
                                {workout.exercise.videoUrl && (
                                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${workout.exercise.videoUrl.split('v=')[1]?.split('&')[0] || workout.exercise.videoUrl.split('/').pop()}`}
                                      className="w-full h-32 md:h-40"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title={workout.exercise.name}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Workout Tracking */}
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-3 text-gray-700">Track Your Workout</h5>
                                <div className="space-y-3">
                                  {Array.from({ length: workout.sets || 3 }, (_, setIndex) => (
                                    <div key={setIndex} className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600 w-12">
                                        Set {setIndex + 1}:
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          placeholder={workout.reps?.toString() || "0"}
                                          className="w-16 h-8 text-center text-sm"
                                          min="0"
                                          value={workoutInputs[workout.id]?.sets?.[setIndex + 1]?.reps || ""}
                                          onChange={(e) => updateSetInput(workout.id, setIndex + 1, 'reps', e.target.value)}
                                        />
                                        <span className="text-xs text-gray-500">reps</span>
                                      </div>
                                      {workout.exercise.movementType === 'Strength' && (
                                        <div className="flex items-center gap-1">
                                          <Input
                                            type="number"
                                            placeholder="0"
                                            className="w-16 h-8 text-center text-sm"
                                            min="0"
                                            value={workoutInputs[workout.id]?.sets?.[setIndex + 1]?.weight || ""}
                                            onChange={(e) => updateSetInput(workout.id, setIndex + 1, 'weight', e.target.value)}
                                            step="0.5"
                                          />
                                          <span className="text-xs text-gray-500">kg</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {/* Notes section */}
                                  <div className="mt-3">
                                    <label className="text-xs text-gray-600 block mb-1">Notes:</label>
                                    <textarea
                                      placeholder="How did this feel? Any modifications?"
                                      className="w-full h-16 text-xs p-2 border border-gray-200 rounded resize-none"
                                      value={workoutInputs[workout.id]?.notes || ""}
                                      onChange={(e) => setWorkoutInputs(prev => ({
                                        ...prev,
                                        [workout.id]: {
                                          ...prev[workout.id],
                                          notes: e.target.value
                                        }
                                      }))}
                                    />
                                  </div>
                                  
                                  {/* Save button */}
                                  <Button 
                                    size="sm" 
                                    className="w-full mt-2"
                                    onClick={() => handleSaveWorkout(workout)}
                                    disabled={saveWorkoutMutation.isPending}
                                  >
                                    {saveWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="h-12 w-12 mx-auto opacity-50 mb-2" />
                    <p>No exercises added to this program yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              {isSpecialist ? (
                <Button>
                  Assign to Patient
                </Button>
              ) : (
                <Button>
                  Start Today's Workout
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Advanced Program Builder */}
      {isProgramBuilderOpen && (
        <Dialog open={isProgramBuilderOpen} onOpenChange={setIsProgramBuilderOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Exercise Program</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <p>Program Builder functionality is being fixed. Please use the Quick Program option for now.</p>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsProgramBuilderOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
