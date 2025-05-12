import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Exercise } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, FileSpreadsheet, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Import our new components
import { ExerciseFilters, type ExerciseFilters as FilterOptions } from "@/components/exercises/exercise-filters";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { ExerciseForm, type ExerciseFormValues } from "@/components/exercises/exercise-form";
import { ImportSheetDialog } from "@/components/exercises/import-sheet-dialog";

export default function Exercises() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isSpecialist = user?.role === "specialist";
  
  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    energyLevel: [],
    cancerTypes: [],
    treatmentPhases: [],
    movementTypes: [],
    bodyFocus: [],
    equipment: []
  });

  // Fetch exercises
  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter exercises based on all filters
  const filteredExercises = exercises?.filter(exercise => {
    // Search term filter
    const matchesSearch = !filters.searchTerm || 
      exercise.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Energy level filter
    const matchesEnergy = filters.energyLevel.length === 0 || 
      (exercise.energyLevel >= filters.energyLevel[0] && 
       exercise.energyLevel <= filters.energyLevel[1]);
    
    // Cancer types filter
    const matchesCancerTypes = filters.cancerTypes.length === 0 ||
      filters.cancerTypes.some(type => 
        exercise.cancerAppropriate.includes(type)
      );
    
    // Treatment phases filter
    const matchesTreatmentPhases = filters.treatmentPhases.length === 0 ||
      (exercise.treatmentPhases && 
       filters.treatmentPhases.some(phase => 
         exercise.treatmentPhases?.includes(phase)
       ));
    
    // Movement type filter
    const matchesMovementType = filters.movementTypes.length === 0 ||
      (exercise.movementType && 
       filters.movementTypes.includes(exercise.movementType));
    
    // Body focus filter
    const matchesBodyFocus = filters.bodyFocus.length === 0 ||
      (exercise.bodyFocus && 
       filters.bodyFocus.some(focus => 
         exercise.bodyFocus?.includes(focus)
       ));
    
    // Equipment filter
    const matchesEquipment = filters.equipment.length === 0 ||
      (exercise.equipment && 
       filters.equipment.some(item => 
         exercise.equipment?.includes(item)
       ));
    
    return matchesSearch && matchesEnergy && matchesCancerTypes && 
           matchesTreatmentPhases && matchesMovementType && 
           matchesBodyFocus && matchesEquipment;
  });

  // Handle exercise submission (create or update)
  const handleExerciseSubmit = async (data: ExerciseFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (editingExercise) {
        // Update existing exercise
        await apiRequest(
          "PUT",
          `/api/exercises/${editingExercise.id}`,
          data
        );
        
        toast({
          title: "Success",
          description: "Exercise updated successfully",
        });
      } else {
        // Create new exercise
        await apiRequest(
          "POST", 
          '/api/exercises',
          data
        );
        
        toast({
          title: "Success",
          description: "Exercise created successfully",
        });
      }
      
      // Refresh exercises and close dialog
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      closeExerciseForm();
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description: editingExercise 
          ? "Failed to update exercise" 
          : "Failed to create exercise",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close the exercise form and reset state
  const closeExerciseForm = () => {
    setIsAddDialogOpen(false);
    setEditingExercise(null);
  };
  
  // Open the edit form for an exercise
  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsAddDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage cancer-appropriate exercises
          </p>
        </div>
        
        {isSpecialist && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import from Sheet
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        )}
      </div>
      
      {/* Advanced filters */}
      <ExerciseFilters 
        filters={filters}
        onFilterChange={setFilters}
      />
      
      {/* Exercise grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="bg-gray-50 p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-4">
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredExercises && filteredExercises.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id}
              exercise={exercise}
              isSpecialist={isSpecialist}
              onEdit={() => handleEditExercise(exercise)}
            />
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
              {filters.searchTerm || 
               filters.energyLevel.length > 0 || 
               filters.cancerTypes.length > 0 ||
               filters.treatmentPhases.length > 0 ||
               filters.movementTypes.length > 0 ||
               filters.bodyFocus.length > 0 ||
               filters.equipment.length > 0
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
      
      {/* Exercise Form Dialog */}
      {isAddDialogOpen && (
        <ExerciseForm
          isOpen={isAddDialogOpen}
          onClose={closeExerciseForm}
          onSubmit={handleExerciseSubmit}
          initialData={editingExercise || undefined}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Google Sheet Import Dialog */}
      {isImportDialogOpen && (
        <ImportSheetDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
        />
      )}
    </div>
  );
}