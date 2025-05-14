import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CircleAlert, CheckCircle, Calendar, User, ArrowLeft, ThumbsUp, ArrowUpDown } from 'lucide-react';

type RecommendationReviewProps = {
  assessmentId: string;
  onBack: () => void;
}

export function RecommendationReview({ assessmentId, onBack }: RecommendationReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'modified'>('approved');
  const [modifiedTier, setModifiedTier] = useState<number | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  
  // Fetch recommendation details
  const { 
    data: recommendation,
    isLoading, 
    error
  } = useQuery({
    queryKey: [`/api/coach/recommendations/assessment/${assessmentId}`],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Mutation for submitting review
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/coach/recommendations/assessment/${assessmentId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          status: reviewStatus,
          coachNotes: notes,
          modifiedTier: reviewStatus === 'modified' ? modifiedTier : undefined,
          selectedExerciseIds: reviewStatus === 'modified' ? selectedExercises : undefined,
          selectedProgramIds: reviewStatus === 'modified' ? selectedPrograms : undefined,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "The recommendation has been successfully reviewed and will be shared with the patient.",
        variant: "success",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/coach/recommendations/pending'] });
      onBack();
    },
    onError: (error) => {
      toast({
        title: "Failed to Submit Review",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle exercise selection
  const toggleExercise = (exerciseId: number) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };
  
  // Handle program selection
  const toggleProgram = (programId: number) => {
    setSelectedPrograms(prev => 
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };
  
  // Initialize selections when data loads
  useState(() => {
    if (recommendation) {
      // Initial tier
      setModifiedTier(recommendation.tier);
      
      // Default all exercises to selected
      const exerciseIds = recommendation.exerciseRecommendations?.map(ex => ex.exerciseId) || [];
      setSelectedExercises(exerciseIds);
      
      // Default all programs to selected
      const programIds = recommendation.programRecommendations?.map(prog => prog.programId) || [];
      setSelectedPrograms(programIds);
    }
  });
  
  // Handle review submission
  const handleSubmitReview = () => {
    submitReviewMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading recommendation details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !recommendation) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md my-4">
        <h3 className="font-semibold mb-2">Error Loading Recommendation</h3>
        <p className="text-sm">There was a problem loading the recommendation details. Please try again.</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <h2 className="text-xl font-bold">Review Recommendations</h2>
      </div>
      
      {/* Patient Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient: {recommendation.patient.name}
          </CardTitle>
          
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={recommendation.tier === 1 ? "destructive" : recommendation.tier === 2 ? "secondary" : recommendation.tier === 3 ? "default" : "outline"}>
              Tier {recommendation.tier} 
              {recommendation.tier === 1 && " (Gentle)"}
              {recommendation.tier === 2 && " (Moderate)"}
              {recommendation.tier === 3 && " (Progressive)"}
              {recommendation.tier === 4 && " (Challenging)"}
            </Badge>
            
            {recommendation.riskFlags && recommendation.riskFlags.length > 0 && (
              <Badge variant="outline" className="text-xs font-normal">
                <CircleAlert className="h-3 w-3 mr-1" />
                {recommendation.riskFlags.length} Risk Flags
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Assessment Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Energy Level</h4>
                <div className="flex items-center">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(recommendation.assessment.energyLevel || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{recommendation.assessment.energyLevel}/10</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Pain Level</h4>
                <div className="flex items-center">
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        (recommendation.assessment.painLevel || 0) > 6 
                          ? 'bg-destructive' 
                          : (recommendation.assessment.painLevel || 0) > 3 
                            ? 'bg-orange-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${(recommendation.assessment.painLevel || 0) * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{recommendation.assessment.painLevel}/10</span>
                </div>
              </div>
            </div>
            
            {/* Risk Flags */}
            {recommendation.riskFlags && recommendation.riskFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Risk Flags</h4>
                <div className="flex flex-wrap gap-1">
                  {recommendation.riskFlags.map((flag, index) => (
                    <Badge key={index} variant="outline" className="text-xs flex items-center">
                      <CircleAlert className="h-3 w-3 mr-1 text-orange-500" />
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Review Tabs */}
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="review">Recommendation Review</TabsTrigger>
          <TabsTrigger value="edit">Edit Recommendations</TabsTrigger>
        </TabsList>
        
        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Alert>
            <AlertTitle className="font-medium flex items-center gap-2">
              <CircleAlert className="h-4 w-4" />
              Algorithm Generated Recommendations
            </AlertTitle>
            <AlertDescription>
              The system has automatically generated these recommendations based on the patient's check-in data. Please review before approving.
            </AlertDescription>
          </Alert>
          
          {/* Exercise Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Exercises</CardTitle>
              <CardDescription>
                The algorithm has selected these exercises based on the patient's profile and check-in data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.exerciseRecommendations?.length > 0 ? (
                  recommendation.exerciseRecommendations.map((exerciseRec) => (
                    <div key={exerciseRec.exerciseId} className="p-3 rounded-md border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{exerciseRec.exercise?.name}</h4>
                        <p className="text-sm text-muted-foreground">{exerciseRec.exercise?.description?.substring(0, 80)}...</p>
                        {exerciseRec.recommendationScore && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              Match Score: {exerciseRec.recommendationScore}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No exercise recommendations available</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Program Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Programs</CardTitle>
              <CardDescription>
                Programs are complete workout routines that combine multiple exercises.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendation.programRecommendations?.length > 0 ? (
                  recommendation.programRecommendations.map((programRec) => (
                    <div key={programRec.programId} className="p-3 rounded-md border flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{programRec.program?.name}</h4>
                        <p className="text-sm text-muted-foreground">{programRec.program?.description?.substring(0, 80)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {programRec.program?.duration} weeks
                          </Badge>
                          {programRec.recommendationScore && (
                            <Badge variant="secondary" className="text-xs">
                              Match Score: {programRec.recommendationScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No program recommendations available</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Notes and Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>
                Add your notes and approve or modify the recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup 
                  value={reviewStatus} 
                  onValueChange={(value) => setReviewStatus(value as 'approved' | 'modified')}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="approved" id="approve" />
                    <Label htmlFor="approve" className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Approve Recommendations
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="modified" id="modify" />
                    <Label htmlFor="modify" className="flex items-center gap-1">
                      <ArrowUpDown className="h-4 w-4 text-orange-500" />
                      Modify Recommendations
                    </Label>
                  </div>
                </RadioGroup>
                
                <div>
                  <Label htmlFor="notes" className="mb-2 block">Coach Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes or instructions for the patient..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none h-24"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSubmitReview}
                disabled={submitReviewMutation.isPending}
                className="flex items-center gap-2"
              >
                {submitReviewMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-4">
          {reviewStatus === 'approved' && (
            <Alert className="bg-orange-100 border-orange-200">
              <AlertTitle className="font-medium flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                Modification Not Enabled
              </AlertTitle>
              <AlertDescription>
                Please select "Modify Recommendations" in the Review tab to edit this prescription.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6" aria-disabled={reviewStatus !== 'modified'}>
            {/* Tier Adjustment */}
            <Card>
              <CardHeader>
                <CardTitle>Adjust Recommendation Tier</CardTitle>
                <CardDescription>
                  Modify the overall tier level based on your clinical judgment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Current Tier: {recommendation.tier}</Label>
                    <Slider 
                      defaultValue={[recommendation.tier]}
                      max={4}
                      min={1}
                      step={1}
                      disabled={reviewStatus !== 'modified'}
                      onValueChange={(values) => setModifiedTier(values[0])}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>1 - Gentle</span>
                      <span>2 - Moderate</span>
                      <span>3 - Progressive</span>
                      <span>4 - Challenging</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 rounded-md bg-primary/10">
                    <p className="text-sm font-medium">New Tier: {modifiedTier ?? recommendation.tier}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {modifiedTier === 1 && "Gentle exercises focused on seated movements, breathing, and very light resistance."}
                      {modifiedTier === 2 && "Moderate activity with standing exercises, light weights, and introductory balance work."}
                      {modifiedTier === 3 && "Progressive training with moderate resistance, balance challenges, and longer durations."}
                      {modifiedTier === 4 && "Challenging workouts with heavier resistance, complex movements, and interval training."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Exercise Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Modify Exercise Recommendations</CardTitle>
                <CardDescription>
                  Select which exercises to include in the patient's program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendation.exerciseRecommendations?.length > 0 ? (
                    recommendation.exerciseRecommendations.map((exerciseRec) => (
                      <div key={exerciseRec.exerciseId} className="p-3 rounded-md border flex justify-between items-center">
                        <div className="flex-grow">
                          <h4 className="font-medium">{exerciseRec.exercise?.name}</h4>
                          <p className="text-sm text-muted-foreground">{exerciseRec.exercise?.description?.substring(0, 80)}...</p>
                        </div>
                        <Checkbox 
                          checked={selectedExercises.includes(exerciseRec.exerciseId)}
                          onCheckedChange={() => toggleExercise(exerciseRec.exerciseId)}
                          disabled={reviewStatus !== 'modified'}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No exercise recommendations available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Program Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Modify Program Recommendations</CardTitle>
                <CardDescription>
                  Select which programs to recommend to the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendation.programRecommendations?.length > 0 ? (
                    recommendation.programRecommendations.map((programRec) => (
                      <div key={programRec.programId} className="p-3 rounded-md border flex justify-between items-center">
                        <div className="flex-grow">
                          <h4 className="font-medium">{programRec.program?.name}</h4>
                          <p className="text-sm text-muted-foreground">{programRec.program?.description?.substring(0, 80)}...</p>
                        </div>
                        <Checkbox 
                          checked={selectedPrograms.includes(programRec.programId)}
                          onCheckedChange={() => toggleProgram(programRec.programId)}
                          disabled={reviewStatus !== 'modified'}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No program recommendations available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}