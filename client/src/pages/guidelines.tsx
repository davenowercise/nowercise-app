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
  Bookmark,
  FileText,
  Award,
  HeartPulse,
  BookOpen,
  Building,
  AlertTriangle,
  Check,
  X,
  Info,
  Loader2,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Type definitions
interface MedicalResearchSource {
  id: number;
  title: string;
  authors: string;
  journalName: string;
  publicationDate: string;
  abstract: string;
  doi: string;
  url: string;
  institution: string;
  citationCount: number;
  peerReviewed: boolean;
  qualityRating: number;
  [key: string]: any;
}

interface ExerciseGuideline {
  id: number;
  cancerType: string;
  treatmentPhase: string;
  guidelineTitle: string;
  recommendedExerciseTypes: string[];
  exerciseIntensity: Record<string, any>;
  frequencyPerWeek: Record<string, any>;
  durationMinutes: Record<string, any>;
  precautions: string[];
  contraindications: string[];
  specialConsiderations: string;
  adaptations: Record<string, any>;
  progressionTimeline: Record<string, any>;
  evidenceLevel: string;
  sourceId: number;
  [key: string]: any;
}

interface SymptomManagementGuideline {
  id: number;
  symptomName: string;
  cancerRelated: boolean;
  treatmentRelated: boolean;
  description: string;
  recommendedApproaches: string[];
  exerciseBenefits: string;
  recommendedExercises: string[];
  avoidedExercises: string[];
  intensityModifications: Record<string, any>;
  evidenceQuality: string;
  sourceId: number;
  [key: string]: any;
}

interface MedicalOrganizationGuideline {
  id: number;
  organizationName: string;
  guidelineName: string;
  publicationYear: number;
  lastUpdated: string;
  scope: string;
  populationFocus: string;
  exerciseRecommendations: Record<string, any>;
  safetyConsiderations: Record<string, any>;
  implementationNotes: string;
  url: string;
  [key: string]: any;
}

interface SafetyGuidelines {
  safe: string[];
  caution: string[];
  avoid: string[];
}

// Cancer types and treatment phases for filtering
const CANCER_TYPES = [
  'Breast', 
  'Prostate', 
  'Colorectal', 
  'Lung', 
  'Lymphoma',
  'Leukemia',
  'Myeloma',
  'Melanoma',
  'Ovarian',
  'Pancreatic',
  'Other'
];

const TREATMENT_PHASES = [
  'Pre-Treatment',
  'During Treatment',
  'Recovery',
  'Remission',
  'Advanced Disease',
  'Survivorship'
];

const SYMPTOMS = [
  'Cancer-related fatigue',
  'Pain',
  'Lymphedema',
  'Nausea',
  'Peripheral neuropathy',
  'Bone health concerns',
  'Cognitive changes',
  'Sleep disturbances',
  'Psychological distress',
  'Cardiotoxicity',
  'Other'
];

export default function GuidelinesPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  
  const [selectedCancerType, setSelectedCancerType] = useState<string | undefined>(undefined);
  const [selectedTreatmentPhase, setSelectedTreatmentPhase] = useState<string | undefined>(undefined);
  const [selectedSymptom, setSelectedSymptom] = useState<string | undefined>(undefined);
  
  // Get medical research sources
  const { data: researchSources, isLoading: isLoadingResearch } = useQuery<MedicalResearchSource[]>({
    queryKey: [addDemoParam('/api/medical-research')],
  });

  // Get exercise guidelines
  const { data: exerciseGuidelines, isLoading: isLoadingExerciseGuidelines } = useQuery<ExerciseGuideline[]>({
    queryKey: [
      addDemoParam(
        `/api/exercise-guidelines${
          selectedCancerType && selectedCancerType !== 'all' && selectedTreatmentPhase && selectedTreatmentPhase !== 'all'
            ? `?cancerType=${selectedCancerType}&treatmentPhase=${selectedTreatmentPhase}`
            : selectedCancerType && selectedCancerType !== 'all'
              ? `?cancerType=${selectedCancerType}`
              : selectedTreatmentPhase && selectedTreatmentPhase !== 'all'
                ? `?treatmentPhase=${selectedTreatmentPhase}`
                : ''
        }`
      ),
    ],
  });

  // Get symptom management guidelines
  const { data: symptomGuidelines, isLoading: isLoadingSymptomGuidelines } = useQuery<SymptomManagementGuideline[]>({
    queryKey: [
      addDemoParam(
        `/api/symptom-guidelines${selectedSymptom && selectedSymptom !== 'all' ? `?symptomName=${selectedSymptom}` : ''}`
      ),
    ],
  });

  // Get medical organization guidelines
  const { data: organizationGuidelines, isLoading: isLoadingOrganizationGuidelines } = useQuery<MedicalOrganizationGuideline[]>({
    queryKey: [addDemoParam('/api/organization-guidelines')],
  });

  // Get safety guidelines if both cancer type and treatment phase are selected
  const { data: safetyGuidelines, isLoading: isLoadingSafetyGuidelines } = useQuery<SafetyGuidelines>({
    queryKey: [
      addDemoParam(
        `/api/exercise-safety-guidelines?cancerType=${selectedCancerType}&treatmentPhase=${selectedTreatmentPhase}`
      ),
    ],
    enabled: !!(selectedCancerType && selectedTreatmentPhase),
  });

  const isLoading = 
    isLoadingAuth || 
    isLoadingResearch || 
    isLoadingExerciseGuidelines || 
    isLoadingSymptomGuidelines || 
    isLoadingOrganizationGuidelines ||
    (selectedCancerType && selectedTreatmentPhase && isLoadingSafetyGuidelines);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
            <Link href="/dashboard">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Medical Exercise Guidelines
          </h1>
          <p className="text-muted-foreground">
            Evidence-based exercise guidelines for cancer patients based on current medical research. 
            These guidelines are tailored to specific cancer types, treatment phases, and symptoms.
          </p>
        </div>

        {/* Filters */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Cancer Type</label>
            <Select
              value={selectedCancerType}
              onValueChange={(value) => setSelectedCancerType(value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cancer Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cancer Types</SelectItem>
                {CANCER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Treatment Phase</label>
            <Select
              value={selectedTreatmentPhase}
              onValueChange={(value) => setSelectedTreatmentPhase(value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Treatment Phases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Treatment Phases</SelectItem>
                {TREATMENT_PHASES.map((phase) => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Symptom Focus</label>
            <Select
              value={selectedSymptom}
              onValueChange={(value) => setSelectedSymptom(value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Symptoms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Symptoms</SelectItem>
                {SYMPTOMS.map((symptom) => (
                  <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Safety Guidelines (shown when cancer type and treatment phase are selected) */}
        {selectedCancerType && selectedTreatmentPhase && safetyGuidelines && (
          <Card className="mb-8 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Exercise Safety Guidelines for {selectedCancerType} Cancer - {selectedTreatmentPhase}
              </CardTitle>
              <CardDescription>
                These guidelines help determine which exercises are safe, which require caution, and which should be avoided
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#EAF2FF] p-4 rounded-lg border border-[#C5D9F5]">
                  <h3 className="font-semibold text-[#2F6FCA] flex items-center mb-2">
                    <Check className="mr-1 h-4 w-4 text-green-600" />
                    Safe Exercises
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {safetyGuidelines.safe.map((exercise, index) => (
                      <li key={index} className="text-[#4D86D9]">{exercise}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="font-semibold text-amber-700 flex items-center mb-2">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Use Caution
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {safetyGuidelines.caution.map((exercise, index) => (
                      <li key={index} className="text-amber-800">{exercise}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h3 className="font-semibold text-red-700 flex items-center mb-2">
                    <X className="mr-1 h-4 w-4" />
                    Avoid These Exercises
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {safetyGuidelines.avoid.map((exercise, index) => (
                      <li key={index} className="text-red-800">{exercise}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="exercise" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="exercise">
              <HeartPulse className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Exercise Guidelines</span>
              <span className="sm:hidden">Exercise</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms">
              <FileText className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Symptom Management</span>
              <span className="sm:hidden">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="organizations">
              <Building className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Organization Guidelines</span>
              <span className="sm:hidden">Organizations</span>
            </TabsTrigger>
            <TabsTrigger value="research">
              <BookOpen className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Research Sources</span>
              <span className="sm:hidden">Research</span>
            </TabsTrigger>
          </TabsList>

          {/* Exercise Guidelines Tab */}
          <TabsContent value="exercise" className="mt-6">
            {exerciseGuidelines && exerciseGuidelines.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exerciseGuidelines.map((guideline) => (
                  <Card key={guideline.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{guideline.cancerType}</Badge>
                        <Badge variant="outline">{guideline.treatmentPhase}</Badge>
                        <Badge>{guideline.evidenceLevel}</Badge>
                      </div>
                      <CardTitle>{guideline.guidelineTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="recommended">
                          <AccordionTrigger>Recommended Exercise Types</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {guideline.recommendedExerciseTypes.map((type: string, i: number) => (
                                <li key={i}>{type}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="intensity">
                          <AccordionTrigger>Intensity & Frequency</AccordionTrigger>
                          <AccordionContent>
                            <h4 className="font-medium mb-1">Intensity:</h4>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                              {Object.entries(guideline.exerciseIntensity).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium mb-1">Frequency:</h4>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                              {Object.entries(guideline.frequencyPerWeek).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium mb-1">Duration:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(guideline.durationMinutes).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="safety">
                          <AccordionTrigger>Safety Considerations</AccordionTrigger>
                          <AccordionContent>
                            <h4 className="font-medium mb-1">Precautions:</h4>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                              {guideline.precautions.map((precaution: string, i: number) => (
                                <li key={i}>{precaution}</li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium mb-1">Contraindications:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {guideline.contraindications.map((contraindication: string, i: number) => (
                                <li key={i}>{contraindication}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="adaptations">
                          <AccordionTrigger>Adaptations & Progression</AccordionTrigger>
                          <AccordionContent>
                            <h4 className="font-medium mb-1">Adaptations for Symptoms:</h4>
                            <ul className="list-disc pl-5 space-y-1 mb-3">
                              {Object.entries(guideline.adaptations).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                            
                            <h4 className="font-medium mb-1">Progression Timeline:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(guideline.progressionTimeline).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key.replace('_', '-')}:</span> {value as string}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="considerations">
                          <AccordionTrigger>Special Considerations</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm">{guideline.specialConsiderations}</p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      {researchSources && researchSources.find(source => source.id === guideline.sourceId) && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Source:</span>{' '}
                          {researchSources.find(source => source.id === guideline.sourceId)?.title}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Guidelines Found</AlertTitle>
                <AlertDescription>
                  {selectedCancerType || selectedTreatmentPhase 
                    ? `No specific exercise guidelines found for the selected filters. Try adjusting your selection.`
                    : `No exercise guidelines are available. Please check back later.`}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Symptom Management Tab */}
          <TabsContent value="symptoms" className="mt-6">
            {symptomGuidelines && symptomGuidelines.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {symptomGuidelines.map((guideline) => (
                  <Card key={guideline.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">
                          {guideline.cancerRelated ? 'Cancer-Related' : 'Treatment-Related'}
                        </Badge>
                        <Badge>{guideline.evidenceQuality}</Badge>
                      </div>
                      <CardTitle>{guideline.symptomName}</CardTitle>
                      <CardDescription>{guideline.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="approaches">
                          <AccordionTrigger>Recommended Approaches</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {guideline.recommendedApproaches.map((approach: string, i: number) => (
                                <li key={i}>{approach}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="benefits">
                          <AccordionTrigger>Exercise Benefits</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm">{guideline.exerciseBenefits}</p>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="recommended">
                          <AccordionTrigger>Recommended Exercises</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {guideline.recommendedExercises.map((exercise: string, i: number) => (
                                <li key={i}>{exercise}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="avoided">
                          <AccordionTrigger>Exercises to Avoid</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {guideline.avoidedExercises.map((exercise: string, i: number) => (
                                <li key={i}>{exercise}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="intensity">
                          <AccordionTrigger>Intensity Modifications</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(guideline.intensityModifications).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      {researchSources && researchSources.find(source => source.id === guideline.sourceId) && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Source:</span>{' '}
                          {researchSources.find(source => source.id === guideline.sourceId)?.title}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Guidelines Found</AlertTitle>
                <AlertDescription>
                  {selectedSymptom 
                    ? `No specific symptom management guidelines found for ${selectedSymptom}. Try selecting a different symptom.`
                    : `No symptom management guidelines are available. Please check back later.`}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Organization Guidelines Tab */}
          <TabsContent value="organizations" className="mt-6">
            {organizationGuidelines && organizationGuidelines.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {organizationGuidelines.map((guideline) => (
                  <Card key={guideline.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{guideline.publicationYear}</Badge>
                        <Badge variant="outline">Last Updated: {new Date(guideline.lastUpdated).toLocaleDateString()}</Badge>
                      </div>
                      <CardTitle>{guideline.organizationName}</CardTitle>
                      <CardDescription>{guideline.guidelineName}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="scope">
                          <AccordionTrigger>Scope & Population</AccordionTrigger>
                          <AccordionContent>
                            <p className="mb-2"><span className="font-medium">Scope:</span> {guideline.scope}</p>
                            <p><span className="font-medium">Population Focus:</span> {guideline.populationFocus}</p>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="recommendations">
                          <AccordionTrigger>Exercise Recommendations</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(guideline.exerciseRecommendations).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="safety">
                          <AccordionTrigger>Safety Considerations</AccordionTrigger>
                          <AccordionContent>
                            <ul className="list-disc pl-5 space-y-1">
                              {Object.entries(guideline.safetyConsiderations).map(([key, value], i) => (
                                <li key={i}><span className="font-medium">{key}:</span> {value as string}</li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="implementation">
                          <AccordionTrigger>Implementation Notes</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm">{guideline.implementationNotes}</p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">
                        <a 
                          href={guideline.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Original Guidelines
                        </a>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Organization Guidelines</AlertTitle>
                <AlertDescription>
                  No organization guidelines are available. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Research Sources Tab */}
          <TabsContent value="research" className="mt-6">
            {researchSources && researchSources.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {researchSources.map((source) => (
                  <Card key={source.id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{source.journalName}</Badge>
                        <Badge variant="outline">Published: {new Date(source.publicationDate).toLocaleDateString()}</Badge>
                        {source.peerReviewed && <Badge>Peer Reviewed</Badge>}
                      </div>
                      <CardTitle>{source.title}</CardTitle>
                      <CardDescription>{source.authors}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-1">Abstract</h4>
                        <p className="text-sm">{source.abstract}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Institution</h4>
                          <p className="text-sm">{source.institution}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Publication Details</h4>
                          <p className="text-sm">
                            Vol. {source.volume}, Issue {source.issueNumber}, pp. {source.pages}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Citation Count</h4>
                          <p className="text-sm">{source.citationCount} citations</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Quality Rating</h4>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Award
                                key={i}
                                className={`h-4 w-4 ${
                                  i < source.qualityRating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        DOI: <a 
                          href={`https://doi.org/${source.doi}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {source.doi}
                        </a>
                      </div>
                      
                      <Button size="sm" variant="outline" asChild>
                        <a 
                          href={source.url}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <FileText className="mr-1 h-4 w-4" />
                          Full Text
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Research Sources</AlertTitle>
                <AlertDescription>
                  No research sources are available. Please check back later.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-10">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Medical Disclaimer</AlertTitle>
            <AlertDescription className="text-blue-700">
              These guidelines are based on current medical research, but individual needs may vary. 
              Always consult with your healthcare provider before starting any exercise program.
              Guidelines may change as new research becomes available.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </MainLayout>
  );
}