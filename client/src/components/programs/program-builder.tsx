import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { 
  Calendar,
  Clock,
  Plus,
  Video,
  GripVertical,
  Trash2,
  Edit,
  Play,
  Settings,
  Target,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Exercise } from "@/lib/types";

interface ProgramExercise {
  id: string;
  exerciseId: number;
  exercise: Exercise;
  day: number;
  order: number;
  sets?: number;
  reps?: number;
  duration?: number;
  notes?: string;
  isOptional?: boolean;
}

interface WeeklyProgram {
  id?: number;
  name: string;
  description: string;
  duration: number; // weeks
  targetTier: number;
  treatmentPhases: string[];
  exercises: ProgramExercise[];
}

interface ProgramBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (program: WeeklyProgram) => void;
  initialProgram?: WeeklyProgram;
}

export function ProgramBuilder({ isOpen, onClose, onSave, initialProgram }: ProgramBuilderProps) {
  console.log("ProgramBuilder rendered, isOpen:", isOpen);
  
  const [program, setProgram] = useState<WeeklyProgram>({
    name: "",
    description: "",
    duration: 4,
    targetTier: 1,
    treatmentPhases: [],
    exercises: []
  });
  
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Load exercises from the exercise library
  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter exercises by search term (make less restrictive for now)
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Less restrictive filter - show all exercises for now
    return matchesSearch;
  });

  console.log("Total exercises:", exercises.length);
  console.log("Filtered exercises:", filteredExercises.length);
  console.log("Search term:", searchTerm);
  if (exercises.length > 0) {
    console.log("Sample exercise:", exercises[0]);
  }

  // Initialize program if editing
  useEffect(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
  }, [initialProgram]);

  // Get exercises for the selected day
  const dayExercises = program.exercises
    .filter(ex => ex.day === selectedDay)
    .sort((a, b) => a.order - b.order);

  // Add exercise to the program
  const addExerciseToDay = (exercise: Exercise) => {
    console.log("Adding exercise to day:", exercise.name, "Day:", selectedDay);
    const newProgramExercise: ProgramExercise = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      day: selectedDay,
      order: dayExercises.length,
      sets: 3,
      reps: 10,
      duration: 30,
      notes: "",
      isOptional: false
    };

    setProgram(prev => {
      const updatedProgram = {
        ...prev,
        exercises: [...prev.exercises, newProgramExercise]
      };
      console.log("Updated program exercises:", updatedProgram.exercises.length);
      return updatedProgram;
    });
  };

  // Remove exercise from program
  const removeExercise = (exerciseId: string) => {
    setProgram(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  // Update exercise details
  const updateExercise = (exerciseId: string, updates: Partial<ProgramExercise>) => {
    setProgram(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      )
    }));
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedExercises = Array.from(dayExercises);
    const [movedExercise] = reorderedExercises.splice(result.source.index, 1);
    reorderedExercises.splice(result.destination.index, 0, movedExercise);

    // Update order for all exercises in this day
    const updatedExercises = reorderedExercises.map((ex, index) => ({
      ...ex,
      order: index
    }));

    setProgram(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        const updated = updatedExercises.find(upd => upd.id === ex.id);
        return updated || ex;
      })
    }));
  };

  // Save program
  const handleSave = () => {
    console.log("handleSave clicked");
    console.log("Program name:", program.name);
    console.log("Program name trimmed:", program.name.trim());
    console.log("Button disabled?", !program.name.trim());
    console.log("Full program object:", program);
    console.log("Saving program with exercises:", program.exercises.length, program.exercises);
    
    if (!program.name.trim()) {
      console.log("Program name is empty, cannot save");
      return;
    }
    
    try {
      onSave(program);
      onClose();
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  const treatmentPhaseOptions = [
    "Pre-treatment",
    "Active Treatment", 
    "Post-treatment",
    "Survivorship",
    "Palliative Care"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Exercise Program Builder
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Program Settings */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Program Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="programName" className="text-xs">Program Name</Label>
                  <Input
                    id="programName"
                    value={program.name}
                    onChange={(e) => setProgram(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Post-Surgery Recovery Week 1-4"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Textarea
                    id="description"
                    value={program.description}
                    onChange={(e) => setProgram(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the program goals..."
                    className="text-sm min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="duration" className="text-xs">Duration (weeks)</Label>
                    <Select
                      value={program.duration.toString()}
                      onValueChange={(value) => setProgram(prev => ({ ...prev, duration: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8, 12].map(weeks => (
                          <SelectItem key={weeks} value={weeks.toString()}>
                            {weeks} {weeks === 1 ? 'week' : 'weeks'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="targetTier" className="text-xs">Target Tier</Label>
                    <Select
                      value={program.targetTier.toString()}
                      onValueChange={(value) => setProgram(prev => ({ ...prev, targetTier: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(tier => (
                          <SelectItem key={tier} value={tier.toString()}>
                            Tier {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Treatment Phases</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {treatmentPhaseOptions.map(phase => (
                      <Badge
                        key={phase}
                        variant={program.treatmentPhases.includes(phase) ? "default" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          setProgram(prev => ({
                            ...prev,
                            treatmentPhases: prev.treatmentPhases.includes(phase)
                              ? prev.treatmentPhases.filter(p => p !== phase)
                              : [...prev.treatmentPhases, phase]
                          }));
                        }}
                      >
                        {phase}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Library */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Exercise Library
                </CardTitle>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="text-sm"
                />
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading exercises...
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          onClick={() => addExerciseToDay(exercise)}
                        >
                          <div className="flex items-center gap-2">
                            {exercise.videoUrl && (
                              <Video className="h-3 w-3 text-red-600" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {exercise.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {exercise.description}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Tier {exercise.energyLevel}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Selector and Exercise List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Day Tabs */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4" />
                  <span className="font-medium text-sm">Weekly Schedule</span>
                </div>
                <Tabs value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                  <TabsList className="grid w-full grid-cols-7">
                    {days.map(day => (
                      <TabsTrigger key={day} value={day.toString()} className="text-xs">
                        Day {day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Exercise List for Selected Day */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Day {selectedDay} Exercises ({dayExercises.length})</span>
                  <Badge variant="outline" className="text-xs">
                    {dayExercises.reduce((total, ex) => total + (ex.duration || 0), 0)} min total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayExercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No exercises scheduled for this day</p>
                    <p className="text-xs">Click exercises from the library to add them</p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="day-exercises">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {dayExercises.map((programExercise, index) => (
                            <Draggable
                              key={programExercise.id}
                              draggableId={programExercise.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="border rounded-lg p-3 bg-background"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm truncate">
                                          {programExercise.exercise.name}
                                        </h4>
                                        {programExercise.exercise.videoUrl && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => window.open(programExercise.exercise.videoUrl!, '_blank')}
                                          >
                                            <Play className="h-3 w-3 text-red-600" />
                                          </Button>
                                        )}
                                      </div>
                                      
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                          <Label className="text-xs">Sets</Label>
                                          <Input
                                            type="number"
                                            value={programExercise.sets || ''}
                                            onChange={(e) => updateExercise(programExercise.id, { 
                                              sets: e.target.value ? parseInt(e.target.value) : undefined 
                                            })}
                                            className="h-6 text-xs"
                                            min="1"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Reps</Label>
                                          <Input
                                            type="number"
                                            value={programExercise.reps || ''}
                                            onChange={(e) => updateExercise(programExercise.id, { 
                                              reps: e.target.value ? parseInt(e.target.value) : undefined 
                                            })}
                                            className="h-6 text-xs"
                                            min="1"
                                          />
                                        </div>
                                        <div>
                                          <Label className="text-xs">Duration (min)</Label>
                                          <Input
                                            type="number"
                                            value={programExercise.duration || ''}
                                            onChange={(e) => updateExercise(programExercise.id, { 
                                              duration: e.target.value ? parseInt(e.target.value) : undefined 
                                            })}
                                            className="h-6 text-xs"
                                            min="1"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeExercise(programExercise.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!program.name.trim()}
            className="min-w-[120px]"
          >
            Save Program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}