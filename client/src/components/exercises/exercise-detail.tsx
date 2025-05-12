import { useState } from "react";
import { Exercise } from "@/lib/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnergyLevel } from "@/components/ui/energy-level";
import { 
  PlusCircle, 
  Video, 
  BookOpen, 
  Info, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  FileText, 
  AlertTriangle 
} from "lucide-react";

interface ExerciseDetailProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseDetail({ exercise, isOpen, onClose }: ExerciseDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{exercise.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <EnergyLevel level={exercise.energyLevel} showLabel />
            {exercise.movementType && (
              <Badge variant="outline" className="ml-2">
                {exercise.movementType}
              </Badge>
            )}
            {exercise.duration && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {exercise.duration} min
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="medical">Medical Info</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column with image/video */}
              <div>
                {exercise.imageUrl ? (
                  <div className="rounded-lg overflow-hidden aspect-video bg-muted">
                    <img 
                      src={exercise.imageUrl} 
                      alt={exercise.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden aspect-video bg-muted flex items-center justify-center">
                    <Dumbbell className="h-16 w-16 text-muted-foreground opacity-20" />
                  </div>
                )}
                
                {exercise.videoUrl && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 gap-2"
                    onClick={() => window.open(exercise.videoUrl, '_blank')}
                  >
                    <Video className="h-4 w-4" />
                    Watch Demonstration Video
                  </Button>
                )}
              </div>
              
              {/* Right column with description and details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{exercise.description}</p>
                </div>
                
                {exercise.bodyFocus && exercise.bodyFocus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Body Focus</h3>
                    <div className="flex flex-wrap gap-1">
                      {exercise.bodyFocus.map((area, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {exercise.benefits && exercise.benefits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Benefits</h3>
                    <ul className="text-sm space-y-1">
                      {exercise.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Equipment Needed</h3>
                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Step by Step Instructions</h3>
              <ol className="space-y-4">
                {exercise.instructionSteps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm mr-3">
                      {index + 1}
                    </span>
                    <div className="text-sm">{step}</div>
                  </li>
                ))}
              </ol>
            </div>
            
            {exercise.modifications && Object.keys(exercise.modifications).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Modifications</h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(exercise.modifications).map(([key, value], i) => (
                    <div key={i} className="bg-muted p-3 rounded-md">
                      <h4 className="font-medium mb-1">{key}</h4>
                      <p>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Medical Info Tab */}
          <TabsContent value="medical" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Cancer Compatibility</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recommended for:</h4>
                  <div className="flex flex-wrap gap-1">
                    {exercise.cancerAppropriate.map((type, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {exercise.treatmentPhases && exercise.treatmentPhases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Treatment Phases:</h4>
                    <div className="flex flex-wrap gap-1">
                      {exercise.treatmentPhases.map((phase, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {phase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {exercise.precautions && (
              <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Precautions</h4>
                    <p className="text-sm text-yellow-700">{exercise.precautions}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Research Tab */}
          <TabsContent value="research" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Research & Evidence</h3>
              
              {exercise.citations && exercise.citations.length > 0 ? (
                <div className="space-y-4">
                  {exercise.citations.map((citation, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium">{citation.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {citation.author} {citation.journal ? `• ${citation.journal}` : ''} {citation.year ? `• ${citation.year}` : ''}
                          </p>
                          {citation.url && (
                            <a 
                              href={citation.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-1 inline-block"
                            >
                              View Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No research citations available for this exercise.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}