import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Exercise } from "@/lib/types";
import { EnergyLevel } from "@/components/ui/energy-level";
import { 
  AlertTriangle, 
  BookMinus, 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  FileText, 
  Heart, 
  Link2, 
  List, 
  Stethoscope, 
  User, 
  Video 
} from "lucide-react";

interface ExerciseDetailProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseDetail({ exercise, isOpen, onClose }: ExerciseDetailProps) {
  // Function to render the embedded video
  const renderVideo = () => {
    if (!exercise.videoUrl) return null;

    // Check if it's a YouTube video
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = exercise.videoUrl.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      return (
        <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
    
    // If not a YouTube video, just show a link
    return (
      <div className="flex items-center gap-2 py-2">
        <Video className="h-5 w-5 text-primary" />
        <a 
          href={exercise.videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Watch exercise video
        </a>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
          <div className="flex items-center space-x-2 mt-2">
            <EnergyLevel level={exercise.energyLevel} showLabel={true} />
            
            {exercise.movementType && (
              <Badge variant="outline" className="ml-2">
                {exercise.movementType}
              </Badge>
            )}
            
            {exercise.duration && (
              <div className="flex items-center text-sm text-muted-foreground ml-2">
                <Clock className="h-4 w-4 mr-1" />{exercise.duration} min
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Video */}
          {exercise.videoUrl && renderVideo()}
          
          {/* Main description */}
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700">{exercise.description}</p>
          </div>
          
          {/* Equipment needed */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-gray-500" />
                Equipment
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.equipment.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          {exercise.instructionSteps && exercise.instructionSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <List className="h-5 w-5 mr-2 text-gray-500" />
                Instructions
              </h3>
              <ol className="space-y-2 mt-2 list-decimal pl-5">
                {exercise.instructionSteps.map((step, index) => (
                  <li key={index} className="text-gray-700">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          
          <Separator />
          
          {/* Cancer types & treatment phases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-gray-500" />
                Appropriate For
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.cancerAppropriate && exercise.cancerAppropriate.map((type) => (
                  <Badge key={type} variant="default" className="bg-primary/10 text-primary border-primary/30">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            {exercise.treatmentPhases && exercise.treatmentPhases.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-500" />
                  Treatment Phases
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.treatmentPhases.map((phase) => (
                    <Badge key={phase} variant="outline">
                      {phase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Body focus areas */}
          {exercise.bodyFocus && exercise.bodyFocus.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Body Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.bodyFocus.map((area) => (
                  <Badge key={area} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Benefits */}
          {exercise.benefits && exercise.benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-gray-500" />
                Benefits
              </h3>
              <ul className="space-y-1 mt-2">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Precautions */}
          {exercise.precautions && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Precautions
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
                {exercise.precautions}
              </div>
            </div>
          )}
          
          {/* Modifications */}
          {exercise.modifications && Object.keys(exercise.modifications).length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BookMinus className="h-5 w-5 mr-2 text-gray-500" />
                Modifications
              </h3>
              <div className="space-y-2">
                {Object.entries(exercise.modifications).map(([situation, modification], index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-3">
                    <h4 className="font-medium text-gray-700">{situation}</h4>
                    <p className="text-gray-600 mt-1">{modification}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Research Citations */}
          {exercise.citations && exercise.citations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                Research Citations
              </h3>
              <div className="space-y-2 text-sm">
                {exercise.citations.map((citation, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-3 py-1">
                    <p>
                      {citation.author} ({citation.year || "n.d."}). {citation.title}
                      {citation.journal ? `. ${citation.journal}` : ""}
                    </p>
                    {citation.url && (
                      <a 
                        href={citation.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center mt-1 text-primary hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5 mr-1" />
                        View Source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}