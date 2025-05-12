import { useState } from "react";
import { Exercise } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Play, 
  Edit, 
  BookOpen,
  Clock
} from "lucide-react";
import { ExerciseDetail } from "./exercise-detail";
import { EnergyLevel } from "@/components/ui/energy-level";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: () => void;
  isSpecialist?: boolean;
}

export function ExerciseCard({ exercise, onEdit, isSpecialist = false }: ExerciseCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
        <CardHeader className="bg-gray-50 p-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{exercise.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <EnergyLevel level={exercise.energyLevel} />
                
                {exercise.movementType && (
                  <Badge variant="outline" className="text-xs">
                    {exercise.movementType}
                  </Badge>
                )}
                
                {exercise.duration && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />{exercise.duration} min
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              {exercise.videoUrl && (
                <Button variant="ghost" size="icon" className="text-primary" onClick={() => setIsDetailOpen(true)}>
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 line-clamp-3">{exercise.description}</p>
            
            {/* Display cancer types */}
            {exercise.cancerAppropriate && Array.isArray(exercise.cancerAppropriate) && (
              <div className="flex flex-wrap gap-1 mt-3">
                {exercise.cancerAppropriate.slice(0, 3).map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {exercise.cancerAppropriate.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{exercise.cancerAppropriate.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            {/* Display treatment phases */}
            {exercise.treatmentPhases && Array.isArray(exercise.treatmentPhases) && exercise.treatmentPhases.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {exercise.treatmentPhases.slice(0, 2).map((phase, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {phase}
                  </Badge>
                ))}
                {exercise.treatmentPhases.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{exercise.treatmentPhases.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-1"
            onClick={() => setIsDetailOpen(true)}
          >
            <BookOpen className="h-3.5 w-3.5" />
            View Details
          </Button>
          
          {isSpecialist && onEdit && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {isDetailOpen && (
        <ExerciseDetail 
          exercise={exercise} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
}