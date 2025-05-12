import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Exercise } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Play, Edit, Trash, Check, Filter } from "lucide-react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { EnergyLevel } from "@/components/ui/energy-level";

const exerciseFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  energyLevel: z.coerce.number().min(1).max(5),
  cancerAppropriate: z.array(z.string()).min(1, "Select at least one cancer type"),
  treatmentPhases: z.array(z.string()).optional(),
  bodyFocus: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  movementType: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional(),
  instructionSteps: z.array(z.string()).min(1, "Add at least one instruction step"),
  modifications: z.record(z.string()).optional(),
  precautions: z.string().optional(),
  citations: z.array(
    z.object({
      author: z.string(),
      title: z.string(),
      journal: z.string().optional(),
      year: z.number().optional(),
      url: z.string().url("Please enter a valid citation URL").optional()
    })
  ).optional()
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

export default function Exercises() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [energyFilter, setEnergyFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [instructionStep, setInstructionStep] = useState("");
  const isSpecialist = user?.role === "specialist";

  // Form handling
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      energyLevel: 2,
      videoUrl: "",
      cancerAppropriate: [],
      instructionSteps: []
    }
  });

  const { formState, handleSubmit, register, setValue, watch, reset } = form;
  const { errors, isSubmitting } = formState;
  
  const watchInstructionSteps = watch("instructionSteps");
  const watchCancerTypes = watch("cancerAppropriate");

  // Fetch exercises
  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter exercises based on search term and energy level
  const filteredExercises = exercises?.filter(exercise => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEnergy = 
      energyFilter === "all" || 
      exercise.energyLevel.toString() === energyFilter;
    
    return matchesSearch && matchesEnergy;
  });

  const addInstructionStep = () => {
    if (!instructionStep) return;
    
    const currentSteps = watch("instructionSteps") || [];
    setValue("instructionSteps", [...currentSteps, instructionStep]);
    setInstructionStep("");
  };

  const removeInstructionStep = (index: number) => {
    const currentSteps = watch("instructionSteps") || [];
    setValue(
      "instructionSteps",
      currentSteps.filter((_, i) => i !== index)
    );
  };

  const addCancerType = (type: string) => {
    const currentTypes = watch("cancerAppropriate") || [];
    if (!currentTypes.includes(type)) {
      setValue("cancerAppropriate", [...currentTypes, type]);
    }
  };

  const removeCancerType = (type: string) => {
    const currentTypes = watch("cancerAppropriate") || [];
    setValue(
      "cancerAppropriate",
      currentTypes.filter(t => t !== type)
    );
  };

  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      await apiRequest("POST", "/api/exercises", data);
      
      toast({
        title: "Exercise created",
        description: "The exercise has been added to the library",
        variant: "default",
      });
      
      reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
    } catch (error) {
      toast({
        title: "Failed to create exercise",
        description: "There was an error creating the exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Available cancer types
  const cancerTypes = [
    "Breast Cancer",
    "Lung Cancer",
    "Prostate Cancer",
    "Colorectal Cancer",
    "Melanoma",
    "Lymphoma",
    "Leukemia",
    "Ovarian Cancer",
    "Bladder Cancer",
    "Kidney Cancer",
    "Pancreatic Cancer",
    "Thyroid Cancer"
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">Exercise Library</h1>
          <p className="text-gray-500">Browse and manage cancer-appropriate exercises</p>
        </div>

        <div className="flex mt-4 md:mt-0 w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:flex-grow-0">
            <Input
              type="text"
              placeholder="Search exercises..."
              className="pl-8 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <Select value={energyFilter} onValueChange={setEnergyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by energy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Energy Levels</SelectItem>
              <SelectItem value="1">Energy Level 1</SelectItem>
              <SelectItem value="2">Energy Level 2</SelectItem>
              <SelectItem value="3">Energy Level 3</SelectItem>
              <SelectItem value="4">Energy Level 4</SelectItem>
              <SelectItem value="5">Energy Level 5</SelectItem>
            </SelectContent>
          </Select>

          {isSpecialist && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" /> Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Exercise</DialogTitle>
                  <DialogDescription>
                    Create a new exercise for cancer patients.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Exercise Name</Label>
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
                      <Label htmlFor="energyLevel">Energy Level Required</Label>
                      <Select 
                        defaultValue="2" 
                        onValueChange={(value) => setValue("energyLevel", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select energy level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Very Low (Level 1)</SelectItem>
                          <SelectItem value="2">Low (Level 2)</SelectItem>
                          <SelectItem value="3">Moderate (Level 3)</SelectItem>
                          <SelectItem value="4">Moderate-High (Level 4)</SelectItem>
                          <SelectItem value="5">High (Level 5)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.energyLevel && (
                        <p className="text-sm text-red-500">{errors.energyLevel.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL (YouTube or other)</Label>
                      <Input id="videoUrl" {...register("videoUrl")} />
                      {errors.videoUrl && (
                        <p className="text-sm text-red-500">{errors.videoUrl.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cancer Types This Exercise Is Appropriate For</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {watchCancerTypes.map((type) => (
                          <Badge key={type} className="bg-primary-light/20 text-primary">
                            {type}
                            <button 
                              type="button"
                              onClick={() => removeCancerType(type)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addCancerType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Add cancer type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cancerTypes
                            .filter(type => !watchCancerTypes.includes(type))
                            .map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {errors.cancerAppropriate && (
                        <p className="text-sm text-red-500">{errors.cancerAppropriate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Instruction Steps</Label>
                      <div className="flex">
                        <Input 
                          value={instructionStep}
                          onChange={(e) => setInstructionStep(e.target.value)}
                          placeholder="Add a step" 
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={addInstructionStep}
                          variant="secondary"
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {watchInstructionSteps.map((step, index) => (
                          <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                            <span className="mr-2 text-gray-500">{index + 1}.</span>
                            <span className="flex-1">{step}</span>
                            <button 
                              type="button"
                              onClick={() => removeInstructionStep(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.instructionSteps && (
                        <p className="text-sm text-red-500">{errors.instructionSteps.message}</p>
                      )}
                    </div>
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
                      {isSubmitting ? "Creating..." : "Create Exercise"}
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
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-9 w-20 rounded-md" />
                <Skeleton className="h-9 w-20 rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredExercises && filteredExercises.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{exercise.name}</CardTitle>
                    <div className="mt-1">
                      <EnergyLevel level={exercise.energyLevel} />
                    </div>
                  </div>
                  {exercise.videoUrl && (
                    <Button variant="ghost" size="icon" className="text-primary" asChild>
                      <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Play className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 line-clamp-3">{exercise.description}</p>
                
                {exercise.cancerAppropriate && Array.isArray(exercise.cancerAppropriate) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {exercise.cancerAppropriate.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {isSpecialist && (
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Edit className="h-4 w-4" />
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
              <Filter className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No exercises found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || energyFilter !== "all"
                ? "No exercises match your current filters. Try adjusting your search criteria."
                : "There are no exercises in the library yet."}
            </p>
            {isSpecialist && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Exercise
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
