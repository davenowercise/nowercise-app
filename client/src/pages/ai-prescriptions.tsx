import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Brain, Activity, Target, Shield, Clock, User, CheckCircle2, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AIExercisePrescription {
  id: number;
  prescriptionName: string;
  tier: number;
  duration: number;
  frequency: number;
  status: string;
  startDate: string;
  medicalConsiderations: string;
  prescriptionData: string;
}

interface PrescriptionDetails {
  programName: string;
  duration: number;
  frequency: number;
  tier: number;
  exercises: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    intensity: string;
    restPeriod: string;
    modifications: string[];
    safetyNotes: string[];
    progressionTriggers: string[];
  }>;
  warmup: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    intensity: string;
    restPeriod: string;
    modifications: string[];
    safetyNotes: string[];
  }>;
  cooldown: Array<{
    exerciseName: string;
    sets: number;
    reps: string;
    intensity: string;
    restPeriod: string;
    modifications: string[];
    safetyNotes: string[];
  }>;
  progressionPlan: Array<{
    week: number;
    modifications: string[];
  }>;
  safetyGuidelines: string[];
  medicalNotes: string[];
  reviewSchedule: string[];
}

const getTierColor = (tier: number) => {
  switch (tier) {
    case 1: return 'bg-blue-100 text-blue-800';
    case 2: return 'bg-green-100 text-green-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 4: return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTierLabel = (tier: number) => {
  switch (tier) {
    case 1: return 'Foundation';
    case 2: return 'Building';
    case 3: return 'Progressive';
    case 4: return 'Advanced';
    default: return `Tier ${tier}`;
  }
};

export default function AIPrescriptionsPage() {
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [formData, setFormData] = useState({
    cancerType: '',
    treatmentStage: '',
    medicalClearance: 'cleared',
    energyLevel: 5,
    mobilityStatus: 5, 
    painLevel: 3
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ['/api/ai-prescriptions'],
  });

  const { data: activePrescription, isLoading: activeLoading } = useQuery({
    queryKey: ['/api/ai-prescriptions/active'],
    retry: false,
  });

  const { data: prescriptionDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/ai-prescriptions', selectedPrescription],
    enabled: !!selectedPrescription,
  });

  const generatePrescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai-prescriptions/generate', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "AI Prescription Generated",
        description: "Your personalized exercise program has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prescriptions/active'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI prescription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePrescription = () => {
    if (!formData.cancerType || !formData.treatmentStage) {
      toast({
        title: "Missing Information",
        description: "Please select cancer type and treatment stage.",
        variant: "destructive",
      });
      return;
    }

    generatePrescriptionMutation.mutate({
      userId: 'demo-user',
      cancerType: formData.cancerType,
      treatmentStage: formData.treatmentStage,
      medicalClearance: formData.medicalClearance,
      physicalAssessment: {
        energyLevel: formData.energyLevel[0],
        mobilityStatus: formData.mobilityStatus[0],
        painLevel: formData.painLevel[0]
      },
      goals: ['improve_strength', 'increase_energy', 'reduce_fatigue'],
      limitations: []
    });
  };

  const parsePrescriptionData = (data: string): PrescriptionDetails | null => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  if (prescriptionsLoading || activeLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Exercise Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            Personalized exercise programs powered by artificial intelligence and ACSM guidelines
          </p>
        </div>
      </div>

      {/* Active Prescription Card */}
      {activePrescription ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Active AI Prescription</CardTitle>
            </div>
            <CardDescription>
              Your current personalized exercise program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{activePrescription.prescription.prescriptionName}</p>
                  <Badge className={getTierColor(activePrescription.prescription.tier)}>
                    {getTierLabel(activePrescription.prescription.tier)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{activePrescription.prescription.duration} weeks</p>
                  <p className="text-xs text-gray-500">{activePrescription.prescription.frequency}x per week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{activePrescription.exercises?.length || 0} exercises</p>
                  <p className="text-xs text-gray-500">Including warmup & cooldown</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">AI-Optimized</p>
                  <p className="text-xs text-gray-500">Evidence-based</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={() => setSelectedPrescription(activePrescription.prescription.id)}
              >
                View Full Prescription
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowGenerateForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New Prescription
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Generate AI Prescription</CardTitle>
            </div>
            <CardDescription>
              Create a personalized exercise program based on your profile and assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showGenerateForm ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI system will analyze your cancer type, treatment stage, physical assessments, and medical guidelines 
                  to create a customized exercise prescription that's safe and effective for your specific needs.
                </p>
                <Button 
                  onClick={() => setShowGenerateForm(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancerType">Cancer Type</Label>
                    <Select 
                      value={formData.cancerType} 
                      onValueChange={(value) => setFormData({...formData, cancerType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cancer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breast">Breast Cancer</SelectItem>
                        <SelectItem value="lung">Lung Cancer</SelectItem>
                        <SelectItem value="colorectal">Colorectal Cancer</SelectItem>
                        <SelectItem value="prostate">Prostate Cancer</SelectItem>
                        <SelectItem value="melanoma">Melanoma</SelectItem>
                        <SelectItem value="bladder">Bladder Cancer</SelectItem>
                        <SelectItem value="kidney">Kidney Cancer</SelectItem>
                        <SelectItem value="head_neck">Head & Neck Cancer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="treatmentStage">Treatment Stage</Label>
                    <Select 
                      value={formData.treatmentStage} 
                      onValueChange={(value) => setFormData({...formData, treatmentStage: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-treatment">Pre-Treatment</SelectItem>
                        <SelectItem value="during-treatment">During Treatment</SelectItem>
                        <SelectItem value="post-treatment">Post-Treatment</SelectItem>
                        <SelectItem value="survivorship">Survivorship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Energy Level: {formData.energyLevel[0]}/10</Label>
                    <Slider
                      value={formData.energyLevel}
                      onValueChange={(value) => setFormData({...formData, energyLevel: value})}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Very Low</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Mobility Status: {formData.mobilityStatus[0]}/10</Label>
                    <Slider
                      value={formData.mobilityStatus}
                      onValueChange={(value) => setFormData({...formData, mobilityStatus: value})}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Limited</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Pain Level: {formData.painLevel[0]}/10</Label>
                    <Slider
                      value={formData.painLevel}
                      onValueChange={(value) => setFormData({...formData, painLevel: value})}
                      max={10}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>No Pain</span>
                      <span>Severe</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleGeneratePrescription}
                    disabled={generatePrescriptionMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {generatePrescriptionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Prescription...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate AI Prescription
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGenerateForm(false)}
                    disabled={generatePrescriptionMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate New Prescription Form */}
      {showGenerateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Generate New AI Prescription</CardTitle>
            </div>
            <CardDescription>
              Create a personalized exercise program based on your current health status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cancerType">Cancer Type</Label>
                  <Select 
                    value={formData.cancerType} 
                    onValueChange={(value) => setFormData({...formData, cancerType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cancer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breast">Breast Cancer</SelectItem>
                      <SelectItem value="lung">Lung Cancer</SelectItem>
                      <SelectItem value="colorectal">Colorectal Cancer</SelectItem>
                      <SelectItem value="prostate">Prostate Cancer</SelectItem>
                      <SelectItem value="melanoma">Melanoma</SelectItem>
                      <SelectItem value="bladder">Bladder Cancer</SelectItem>
                      <SelectItem value="kidney">Kidney Cancer</SelectItem>
                      <SelectItem value="head_neck">Head & Neck Cancer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentStage">Treatment Stage</Label>
                  <Select 
                    value={formData.treatmentStage} 
                    onValueChange={(value) => setFormData({...formData, treatmentStage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select treatment stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-treatment">Pre-Treatment</SelectItem>
                      <SelectItem value="during-treatment">During Treatment</SelectItem>
                      <SelectItem value="post-treatment">Post-Treatment</SelectItem>
                      <SelectItem value="survivorship">Survivorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Energy Level: {formData.energyLevel}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.energyLevel}
                    onChange={(e) => setFormData({...formData, energyLevel: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Very Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mobility Status: {formData.mobilityStatus}/10</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.mobilityStatus}
                    onChange={(e) => setFormData({...formData, mobilityStatus: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Limited</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pain Level: {formData.painLevel}/10</Label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={formData.painLevel}
                    onChange={(e) => setFormData({...formData, painLevel: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>No Pain</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGeneratePrescription}
                  disabled={generatePrescriptionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  {generatePrescriptionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Prescription...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Prescription
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowGenerateForm(false)}
                  disabled={generatePrescriptionMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">All Prescriptions</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedPrescription}>
            Prescription Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          {prescriptions && prescriptions.length > 0 ? (
            <div className="grid gap-4">
              {prescriptions.map((prescription: AIExercisePrescription) => (
                <Card key={prescription.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{prescription.prescriptionName}</h3>
                            <p className="text-sm text-gray-500">
                              Started {new Date(prescription.startDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={getTierColor(prescription.tier)}>
                          {getTierLabel(prescription.tier)}
                        </Badge>
                        <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                          {prescription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{prescription.duration} weeks</span>
                        <span>{prescription.frequency}x/week</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPrescription(prescription.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                    {prescription.medicalConsiderations && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            {prescription.medicalConsiderations}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Prescriptions Yet</h3>
                <p className="text-gray-500 mb-6">
                  Generate your first AI-powered exercise prescription to get started with personalized programs.
                </p>
                <Button onClick={handleGeneratePrescription} disabled={generatePrescriptionMutation.isPending}>
                  {generatePrescriptionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Prescription
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {detailsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : prescriptionDetails ? (
            <div className="space-y-6">
              {(() => {
                const details = parsePrescriptionData(prescriptionDetails.prescription.prescriptionData);
                if (!details) return <p>Unable to parse prescription details.</p>;

                return (
                  <>
                    {/* Prescription Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Program Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Program Name</p>
                            <p className="text-lg font-semibold">{details.programName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Duration & Frequency</p>
                            <p className="text-lg font-semibold">{details.duration} weeks, {details.frequency}x/week</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Tier Level</p>
                            <Badge className={getTierColor(details.tier)}>
                              {getTierLabel(details.tier)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Safety Guidelines */}
                    {details.safetyGuidelines.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Safety Guidelines
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {details.safetyGuidelines.map((guideline, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{guideline}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Exercise Components */}
                    <div className="grid gap-6">
                      {/* Warmup */}
                      {details.warmup.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Warmup Exercises</CardTitle>
                            <CardDescription>Prepare your body for the main workout</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {details.warmup.map((exercise, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{exercise.exerciseName}</h4>
                                    <Badge variant="outline">{exercise.intensity}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                                    <span>Sets: {exercise.sets}</span>
                                    <span>Reps: {exercise.reps}</span>
                                    <span>Rest: {exercise.restPeriod}</span>
                                    <span>Intensity: {exercise.intensity}</span>
                                  </div>
                                  {exercise.modifications.length > 0 && (
                                    <div className="text-sm">
                                      <p className="font-medium mb-1">Modifications:</p>
                                      <ul className="list-disc list-inside text-gray-600">
                                        {exercise.modifications.map((mod, i) => (
                                          <li key={i}>{mod}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Main Exercises */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Main Exercises</CardTitle>
                          <CardDescription>Core workout activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {details.exercises.map((exercise, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{exercise.exerciseName}</h4>
                                  <Badge variant="outline">{exercise.intensity}</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                                  <span>Sets: {exercise.sets}</span>
                                  <span>Reps: {exercise.reps}</span>
                                  <span>Rest: {exercise.restPeriod}</span>
                                  <span>Intensity: {exercise.intensity}</span>
                                </div>
                                {exercise.safetyNotes.length > 0 && (
                                  <div className="text-sm mb-3">
                                    <p className="font-medium mb-1">Safety Notes:</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                      {exercise.safetyNotes.map((note, i) => (
                                        <li key={i}>{note}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {exercise.progressionTriggers.length > 0 && (
                                  <div className="text-sm">
                                    <p className="font-medium mb-1">Progress When:</p>
                                    <ul className="list-disc list-inside text-gray-600">
                                      {exercise.progressionTriggers.map((trigger, i) => (
                                        <li key={i}>{trigger}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cooldown */}
                      {details.cooldown.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Cooldown Exercises</CardTitle>
                            <CardDescription>Recovery and relaxation activities</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {details.cooldown.map((exercise, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{exercise.exerciseName}</h4>
                                    <Badge variant="outline">{exercise.intensity}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                                    <span>Sets: {exercise.sets}</span>
                                    <span>Reps: {exercise.reps}</span>
                                    <span>Rest: {exercise.restPeriod}</span>
                                    <span>Intensity: {exercise.intensity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Progression Plan */}
                    {details.progressionPlan.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Progression Plan
                          </CardTitle>
                          <CardDescription>How your program will evolve over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {details.progressionPlan.map((plan, index) => (
                              <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold">Week {plan.week}</h4>
                                <ul className="text-sm text-gray-600 mt-1">
                                  {plan.modifications.map((mod, i) => (
                                    <li key={i}>• {mod}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Medical Notes */}
                    {details.medicalNotes.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Medical Considerations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {details.medicalNotes.map((note, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Select a prescription to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}