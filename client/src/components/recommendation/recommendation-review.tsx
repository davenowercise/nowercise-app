import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle,
  AlertCircle, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type RecommendationReviewProps = {
  assessmentId: string;
  onBack: () => void;
};

type Exercise = {
  id: number;
  name: string;
  description: string;
  energyLevel: number;
  movementType: string;
  bodyFocus: string[];
  benefits: string[];
  score: number;
  reasonCodes: string[];
  precautions?: string;
};

type Program = {
  id: number;
  name: string;
  description: string;
  duration: number;
  energyLevel: number;
  treatmentPhases: string[];
  score: number;
  reasonCodes: string[];
  matchingExercises?: Exercise[];
};

type RiskFlag = {
  type: string;
  description: string;
  severity: 'low' | 'moderate' | 'high';
  source: string;
};

type Assessment = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: string;
  notes: string;
  tier: string;
  hasRiskFlags: boolean;
  riskFlags: RiskFlag[];
  energy: number;
  mobility: number;
  balance: number;
  strength: number;
  painLevel: number;
  comorbidities: string[];
  cancerType: string;
  treatmentStage: string;
  exerciseHistory: string;
};

export function RecommendationReview({ assessmentId, onBack }: RecommendationReviewProps) {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState('');
  const [viewTab, setViewTab] = useState('exercises');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);
  
  // Fetch assessment and recommendations
  const { data: assessmentData, isLoading: assessmentLoading } = useQuery({
    queryKey: ['/api/coach/assessments', assessmentId],
  });
  
  const { data: exerciseRecommendations, isLoading: exercisesLoading } = useQuery({
    queryKey: ['/api/coach/exercise-recommendations', assessmentId],
  });
  
  const { data: programRecommendations, isLoading: programsLoading } = useQuery({
    queryKey: ['/api/coach/program-recommendations', assessmentId],
  });
  
  // Mutations for approving/rejecting recommendations
  const updateRecommendation = useMutation({
    mutationFn: async (payload: { 
      assessmentId: string; 
      action: 'approve' | 'reject'; 
      notes: string;
    }) => {
      const response = await fetch('/api/coach/update-recommendation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recommendation status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/pending-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/assessments', assessmentId] });
      
      toast({
        title: selectedAction === 'approve' ? 'Recommendations Approved' : 'Recommendations Rejected',
        description: selectedAction === 'approve' 
          ? 'Patient will now have access to these recommendations'
          : 'Recommendations have been rejected and will not be shown to the patient',
        variant: selectedAction === 'approve' ? 'default' : 'destructive',
      });
      
      onBack();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update recommendation status: ' + error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });
  
  const handleSubmit = (action: 'approve' | 'reject') => {
    setSelectedAction(action);
    setIsSubmitting(true);
    
    updateRecommendation.mutate({
      assessmentId,
      action,
      notes: reviewNotes,
    });
  };
  
  if (assessmentLoading || exercisesLoading || programsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading assessment data...</p>
        </div>
      </div>
    );
  }
  
  const assessment = assessmentData as Assessment;
  const exercises = exerciseRecommendations as Exercise[] || [];
  const programs = programRecommendations as Program[] || [];
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'low':
        return 'Low intensity exercise appropriate for early treatment, high fatigue, or multiple comorbidities';
      case 'moderate':
        return 'Moderate intensity exercise suitable for most patients with average mobility and energy';
      case 'high':
        return 'Higher intensity exercise for patients with good baseline fitness and fewer limitations';
      default:
        return '';
    }
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reviews
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Patient Assessment</CardTitle>
                  <CardDescription>Review patient information</CardDescription>
                </div>
                {assessment.hasRiskFlags && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This patient has risk flags that need review</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-medium">{assessment.patientName}</p>
                <p className="text-sm text-muted-foreground">Cancer Type: {assessment.cancerType}</p>
                <p className="text-sm text-muted-foreground">Treatment Stage: {assessment.treatmentStage}</p>
              </div>
              
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-2">Physical Assessment</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Energy Level</p>
                    <p className="font-medium">{assessment.energy}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mobility</p>
                    <p className="font-medium">{assessment.mobility}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className="font-medium">{assessment.balance}/10</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Strength</p>
                    <p className="font-medium">{assessment.strength}/10</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Pain Level</p>
                    <p className="font-medium">{assessment.painLevel}/10</p>
                  </div>
                </div>
              </div>
              
              {assessment.comorbidities.length > 0 && (
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Comorbidities</h4>
                  <div className="flex flex-wrap gap-1">
                    {assessment.comorbidities.map((condition, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-2">Exercise History</h4>
                <p className="text-sm">{assessment.exerciseHistory || "No exercise history provided"}</p>
              </div>
              
              {assessment.hasRiskFlags && (
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                    Risk Flags
                  </h4>
                  <div className="space-y-2">
                    {assessment.riskFlags.map((flag, index) => (
                      <div key={index} className="p-2 rounded-md bg-amber-50 border border-amber-200">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">{flag.type}</p>
                          <Badge className={getSeverityColor(flag.severity)}>
                            {flag.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{flag.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Source: {flag.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <h4 className="font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Recommendation Tier
                </h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getTierColor(assessment.tier)}>
                    {assessment.tier === 'low' ? 'Low Intensity' : 
                     assessment.tier === 'moderate' ? 'Moderate' : 'High Intensity'}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getTierDescription(assessment.tier)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Prescription</CardTitle>
              <CardDescription>
                Review and approve the following exercise prescription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={viewTab} onValueChange={setViewTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="exercises">
                    Exercises ({exercises.length})
                  </TabsTrigger>
                  <TabsTrigger value="programs">
                    Programs ({programs.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="exercises" className="space-y-4">
                  {exercises.length === 0 ? (
                    <div className="text-center p-12 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">No individual exercises recommended</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {exercises.map((exercise) => (
                        <Card key={exercise.id}>
                          <CardHeader className="p-4">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">{exercise.name}</CardTitle>
                              <Badge variant="outline" className="ml-2">
                                Score: {Math.round(exercise.score * 100)}%
                              </Badge>
                            </div>
                            <CardDescription>{exercise.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                              <div>
                                <p className="text-muted-foreground">Energy Level</p>
                                <p className="font-medium">{exercise.energyLevel}/10</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium capitalize">{exercise.movementType}</p>
                              </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="details">
                                <AccordionTrigger className="text-sm font-medium">
                                  View Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    <div>
                                      <h4 className="text-sm font-medium">Body Focus</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {exercise.bodyFocus.map((area, i) => (
                                          <Badge key={i} variant="outline" className="bg-blue-50">
                                            {area}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Benefits</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {exercise.benefits.map((benefit, i) => (
                                          <Badge key={i} variant="outline" className="bg-green-50">
                                            {benefit}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {exercise.precautions && (
                                      <div>
                                        <h4 className="text-sm font-medium">Precautions</h4>
                                        <p className="text-sm mt-1">{exercise.precautions}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Recommendation Reasons</h4>
                                      <ul className="list-disc list-inside text-sm mt-1">
                                        {exercise.reasonCodes.map((reason, i) => (
                                          <li key={i}>{reason}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="programs" className="space-y-4">
                  {programs.length === 0 ? (
                    <div className="text-center p-12 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">No programs recommended</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {programs.map((program) => (
                        <Card key={program.id}>
                          <CardHeader className="p-4">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">{program.name}</CardTitle>
                              <Badge variant="outline" className="ml-2">
                                Score: {Math.round(program.score * 100)}%
                              </Badge>
                            </div>
                            <CardDescription>{program.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                              <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium">{program.duration} days</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Energy Level</p>
                                <p className="font-medium">{program.energyLevel}/10</p>
                              </div>
                            </div>
                            
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="details">
                                <AccordionTrigger className="text-sm font-medium">
                                  View Details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    <div>
                                      <h4 className="text-sm font-medium">Treatment Phases</h4>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {program.treatmentPhases.map((phase, i) => (
                                          <Badge key={i} variant="outline" className="bg-purple-50">
                                            {phase}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Recommendation Reasons</h4>
                                      <ul className="list-disc list-inside text-sm mt-1">
                                        {program.reasonCodes.map((reason, i) => (
                                          <li key={i}>{reason}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    {program.matchingExercises && program.matchingExercises.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium">Key Exercises</h4>
                                        <ul className="list-disc list-inside text-sm mt-1">
                                          {program.matchingExercises.map((exercise, i) => (
                                            <li key={i}>{exercise.name}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-4">
              <div className="w-full">
                <label htmlFor="notes" className="text-sm font-medium mb-2 block">
                  Specialist Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about your recommendation decision..."
                  className="w-full h-24"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between w-full pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isSubmitting}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject Recommendations
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Exercise Recommendations</DialogTitle>
                      <DialogDescription>
                        These recommendations will not be presented to the patient. The system 
                        will wait for you to provide an alternative prescription.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-muted-foreground">
                        Are you sure you want to reject these recommendations?
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleSubmit('reject')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={isSubmitting}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve Recommendations
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Exercise Recommendations</DialogTitle>
                      <DialogDescription>
                        These recommendations will be presented to the patient as their personalized
                        exercise prescription.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-muted-foreground">
                        Please confirm you've reviewed all the recommendations and risk flags.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={() => handleSubmit('approve')}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}