import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDemoParam } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ArrowLeft,
  Heart,
  Award,
  ThumbsUp,
  Info,
  Stars,
  Dumbbell,
  Calendar,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface Assessment {
  id: number;
  assessmentDate: string;
  userId: string;
  energyLevel: number | null;
  painLevel: number | null;
  [key: string]: any;
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  energyLevel: number;
  [key: string]: any;
}

interface Program {
  id: number;
  name: string;
  description: string;
  duration: number;
  energyLevel: number;
  [key: string]: any;
}

interface ExerciseRecommendation {
  id: number;
  exercise: Exercise;
  recommendationScore: number;
  reasonCodes: string[];
  specialistApproved: boolean;
  [key: string]: any;
}

interface ProgramRecommendation {
  id: number;
  program: Program;
  recommendationScore: number;
  reasonCodes: string[];
  specialistApproved: boolean;
  [key: string]: any;
}

interface RecommendationsResponse {
  exercises: ExerciseRecommendation[];
  programs: ProgramRecommendation[];
}

export default function RecommendationsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | undefined>(undefined);

  // Get all assessments for the user
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery<Assessment[]>({
    queryKey: [addDemoParam('/api/patient/assessments')],
    enabled: !!user,
  });

  // Get recommendations for the selected assessment (or most recent if none selected)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<RecommendationsResponse>({
    queryKey: [
      addDemoParam(`/api/patient/recommendations${selectedAssessmentId ? `?assessmentId=${selectedAssessmentId}` : ''}`),
    ],
    enabled: !!user,
  });

  const isLoading = isLoadingAuth || isLoadingAssessments || isLoadingRecommendations;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-8">
          <Alert>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to view recommendations. Please log in or sign up to continue.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <a href="/api/login">Log In</a>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if user has completed an assessment
  if (!assessments || assessments.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-8">
          <Alert>
            <AlertTitle>No Assessments Found</AlertTitle>
            <AlertDescription>
              You haven't completed any health assessments yet. Complete an assessment to get personalized exercise recommendations.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link href="/assessment">Complete an Assessment</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if recommendations are available
  const hasExercises = recommendations?.exercises && recommendations.exercises.length > 0;
  const hasPrograms = recommendations?.programs && recommendations.programs.length > 0;

  if (!hasExercises && !hasPrograms) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-8">
          <Alert>
            <AlertTitle>Recommendations Being Generated</AlertTitle>
            <AlertDescription>
              Your recommendations are still being generated. This process can take a few minutes. Please check back shortly.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          
          {assessments && assessments.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Assessment:</span>
              <select
                className="text-sm border rounded p-1"
                value={selectedAssessmentId || ''}
                onChange={(e) => setSelectedAssessmentId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Most Recent</option>
                {assessments.map((assessment: any) => (
                  <option key={assessment.id} value={assessment.id}>
                    {new Date(assessment.assessmentDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="mr-2 h-6 w-6 text-primary" />
            Your Personalized Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            Based on your health assessment, we've created personalized exercise recommendations to help you feel better and reach your goals.
          </p>
        </div>

        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="exercises">Individual Exercises</TabsTrigger>
            <TabsTrigger value="programs">Complete Programs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercises" className="mt-6">
            {hasExercises ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.exercises.map((recommendation: any) => (
                  <ExerciseRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Exercise Recommendations</AlertTitle>
                <AlertDescription>
                  We don't have any specific exercise recommendations for you yet. Check the Programs tab to see if you have any program recommendations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="programs" className="mt-6">
            {hasPrograms ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.programs.map((recommendation: any) => (
                  <ProgramRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Program Recommendations</AlertTitle>
                <AlertDescription>
                  We don't have any program recommendations for you yet. Check the Exercises tab to see individual exercise recommendations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-10 mb-4">
          <Alert>
            <ThumbsUp className="h-4 w-4" />
            <AlertTitle>Small Wins Matter</AlertTitle>
            <AlertDescription>
              Remember, every bit of movement counts. Start with what feels comfortable and gradually build up. 
              Focus on consistency rather than intensity.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </MainLayout>
  );
}

function ExerciseRecommendationCard({ recommendation }: { recommendation: ExerciseRecommendation }) {
  const { exercise, recommendationScore, reasonCodes, specialistApproved } = recommendation;
  const status = specialistApproved ? 'approved' : 'recommended';
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          <Badge variant={status === 'approved' ? 'default' : 'outline'}>
            {status === 'approved' ? 'Approved' : 'Recommended'}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {exercise.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Match Score</p>
          <div className="flex items-center gap-2">
            <Progress value={recommendationScore} className="h-2" />
            <span className="text-sm">{Math.round(recommendationScore)}%</span>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Energy Level</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < Math.ceil(exercise.energyLevel / 2)
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
            <span className="text-sm ml-2">{exercise.energyLevel}/10</span>
          </div>
        </div>
        
        {reasonCodes && reasonCodes.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Why This Exercise?</p>
            <div className="flex flex-wrap gap-1">
              {reasonCodes.map((reason: string, index: number) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-help">
                        {reason}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {getReasonDescription(reason)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Button className="w-full" asChild>
          <Link href={`/exercises/${exercise.id}`}>
            View Exercise Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProgramRecommendationCard({ recommendation }: { recommendation: ProgramRecommendation }) {
  const { program, recommendationScore, reasonCodes, specialistApproved } = recommendation;
  const status = specialistApproved ? 'approved' : 'recommended';
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{program.name}</CardTitle>
          <Badge variant={status === 'approved' ? 'default' : 'outline'}>
            {status === 'approved' ? 'Approved' : 'Recommended'}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {program.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Match Score</p>
          <div className="flex items-center gap-2">
            <Progress value={recommendationScore} className="h-2" />
            <span className="text-sm">{Math.round(recommendationScore)}%</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{program.duration} days</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Avg. Level: {program.energyLevel}/10</span>
          </div>
        </div>
        
        {reasonCodes && reasonCodes.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Why This Program?</p>
            <div className="flex flex-wrap gap-1">
              {reasonCodes.map((reason: string, index: number) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-help">
                        {reason}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        {getReasonDescription(reason)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Button className="w-full" asChild>
          <Link href={`/programs/${program.id}`}>
            View Program Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to get descriptions for reason codes
function getReasonDescription(reasonCode: string): string {
  const reasonDescriptions: Record<string, string> = {
    // Energy level matches
    'perfect_energy_match': 'Perfectly matches your current energy level',
    'good_energy_match': 'Closely matches your energy level',
    'energy_mismatch': 'May be challenging for your current energy level',

    // Duration appropriateness
    'appropriate_short_duration': 'Short duration is ideal for your energy level',
    'appropriate_long_duration': 'Longer duration suits your energy capacity',

    // Treatment stage matches
    'suitable_during_treatment': 'Designed for patients during active treatment',
    'suitable_post_treatment': 'Ideal for post-treatment recovery',
    'suitable_for_remission': 'Appropriate for patients in remission',

    // General reason codes
    'ENERGY_MATCH': 'Matches your current energy level',
    'TREATMENT_MATCH': 'Appropriate for your treatment stage',
    'FITNESS_MATCH': 'Aligns with your fitness level',
    'GOAL_MATCH': 'Helps achieve your fitness goals',
    'PREFERENCE_MATCH': 'Matches your exercise preferences',
    'MOBILITY_MATCH': 'Suitable for your mobility level',
    'pain_appropriate': 'Designed with pain management in mind',
    'LOW_IMPACT': 'Gentle, low-impact movement',
    'STRENGTH_FOCUS': 'Focuses on building strength',
    'FLEXIBILITY_FOCUS': 'Improves flexibility and range of motion',
    'BALANCE_FOCUS': 'Helps improve balance and stability',
    'FATIGUE_MANAGEMENT': 'Designed to manage cancer-related fatigue',
    'CONFIDENCE_BUILDER': 'Builds confidence in movement',
    'LYMPHEDEMA_SAFE': 'Safe for those with lymphedema risk',
    'PAIN_MANAGEMENT': 'May help with pain management',
    'EQUIPMENT_MATCH': 'Uses equipment you have available',
    'ENVIRONMENT_MATCH': 'Suitable for your exercise environment',
    'TIME_MATCH': 'Fits your preferred session duration',
    'low_injury_risk': 'Low risk of injury',
    'addresses_physical_limitations': 'Takes into account your physical limitations',
    'matches_confidence_level': 'Matches your confidence level with exercise',
    'cancer_appropriate': 'Specifically designed for cancer patients',
    'matches_preferences': 'Aligns with your exercise preferences',
  };
  
  return reasonDescriptions[reasonCode] || 'Recommended by our algorithm';
}