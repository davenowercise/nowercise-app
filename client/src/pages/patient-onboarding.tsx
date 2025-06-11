import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Heart, Activity, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface PatientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Cancer Details
  cancerType: string;
  cancerStage: string;
  diagnosisDate: string;
  primaryTumorLocation: string;
  metastases: boolean;
  metastasesLocations: string;
  
  // Treatment History
  treatmentStage: string;
  currentTreatments: string[];
  chemotherapyHistory: boolean;
  chemotherapyType: string;
  radiationHistory: boolean;
  radiationArea: string;
  surgeryHistory: boolean;
  surgeryType: string;
  surgeryDate: string;
  
  // Medical History
  comorbidities: string[];
  currentMedications: string;
  allergies: string;
  previousSurgeries: string;
  familyHistory: string;
  
  // Physical Assessment
  energyLevel: number;
  mobilityStatus: number;
  painLevel: number;
  fatigueLevel: number;
  balanceIssues: boolean;
  lymphedemaRisk: boolean;
  physicalRestrictions: string;
  
  // Lifestyle & Exercise History
  previousExerciseLevel: string;
  exercisePreferences: string[];
  mobilityAids: string[];
  fitnessGoals: string[];
  motivationLevel: number;
  
  // Medical Clearance
  medicalClearance: string;
  clearanceDate: string;
  clearingPhysician: string;
  specialRestrictions: string;
  
  // Additional Notes
  patientConcerns: string;
  additionalNotes: string;
}

export default function PatientOnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PatientFormData>({
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // Cancer Details
    cancerType: '',
    cancerStage: '',
    diagnosisDate: '',
    primaryTumorLocation: '',
    metastases: false,
    metastasesLocations: '',
    
    // Treatment History
    treatmentStage: '',
    currentTreatments: [],
    chemotherapyHistory: false,
    chemotherapyType: '',
    radiationHistory: false,
    radiationArea: '',
    surgeryHistory: false,
    surgeryType: '',
    surgeryDate: '',
    
    // Medical History
    comorbidities: [],
    currentMedications: '',
    allergies: '',
    previousSurgeries: '',
    familyHistory: '',
    
    // Physical Assessment
    energyLevel: 5,
    mobilityStatus: 5,
    painLevel: 3,
    fatigueLevel: 5,
    balanceIssues: false,
    lymphedemaRisk: false,
    physicalRestrictions: '',
    
    // Lifestyle & Exercise History
    previousExerciseLevel: '',
    exercisePreferences: [],
    mobilityAids: [],
    fitnessGoals: [],
    motivationLevel: 5,
    
    // Medical Clearance
    medicalClearance: '',
    clearanceDate: '',
    clearingPhysician: '',
    specialRestrictions: '',
    
    // Additional Notes
    patientConcerns: '',
    additionalNotes: ''
  });

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const patient = await apiRequest('/api/patients', {
        method: 'POST',
        data: data
      });
      
      // Generate initial AI prescription based on patient data
      const prescriptionData = {
        userId: patient.id,
        cancerType: data.cancerType,
        treatmentStage: data.treatmentStage,
        medicalClearance: data.medicalClearance,
        physicalAssessment: {
          energyLevel: data.energyLevel,
          mobilityStatus: data.mobilityStatus,
          painLevel: data.painLevel,
          fatigueLevel: data.fatigueLevel
        },
        goals: data.fitnessGoals,
        limitations: data.physicalRestrictions ? [data.physicalRestrictions] : []
      };
      
      await apiRequest('/api/ai-prescriptions/generate', {
        method: 'POST',
        data: prescriptionData
      });
      
      return patient;
    },
    onSuccess: (patient) => {
      toast({
        title: "Patient Profile Created",
        description: `${patient.firstName} ${patient.lastName}'s profile and initial prescription have been generated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-prescriptions'] });
      setLocation('/ai-prescriptions');
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Patient Profile",
        description: error.message || "Failed to create patient profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.cancerType) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all required fields: Name and Cancer Type.",
        variant: "destructive",
      });
      return;
    }
    
    createPatientMutation.mutate(formData);
  };

  const updateFormData = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Patient Onboarding</h1>
          <p className="text-gray-600 mt-1">
            Complete comprehensive health assessment for personalized exercise prescription
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic patient details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Cancer Information
            </CardTitle>
            <CardDescription>Detailed cancer diagnosis and staging information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cancerType">Cancer Type *</Label>
                <Select value={formData.cancerType} onValueChange={(value) => updateFormData('cancerType', value)}>
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
                    <SelectItem value="liver">Liver Cancer</SelectItem>
                    <SelectItem value="pancreatic">Pancreatic Cancer</SelectItem>
                    <SelectItem value="ovarian">Ovarian Cancer</SelectItem>
                    <SelectItem value="cervical">Cervical Cancer</SelectItem>
                    <SelectItem value="endometrial">Endometrial Cancer</SelectItem>
                    <SelectItem value="leukemia">Leukemia</SelectItem>
                    <SelectItem value="lymphoma">Lymphoma</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancerStage">Cancer Stage</Label>
                <Select value={formData.cancerStage} onValueChange={(value) => updateFormData('cancerStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage-0">Stage 0 (In situ)</SelectItem>
                    <SelectItem value="stage-1">Stage I (Early stage)</SelectItem>
                    <SelectItem value="stage-2">Stage II (Locally advanced)</SelectItem>
                    <SelectItem value="stage-3">Stage III (Regional spread)</SelectItem>
                    <SelectItem value="stage-4">Stage IV (Metastatic)</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                <Input
                  id="diagnosisDate"
                  type="date"
                  value={formData.diagnosisDate}
                  onChange={(e) => updateFormData('diagnosisDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryTumorLocation">Primary Tumor Location</Label>
                <Input
                  id="primaryTumorLocation"
                  value={formData.primaryTumorLocation}
                  onChange={(e) => updateFormData('primaryTumorLocation', e.target.value)}
                  placeholder="Specific location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metastases"
                  checked={formData.metastases}
                  onCheckedChange={(checked) => updateFormData('metastases', checked)}
                />
                <Label htmlFor="metastases">Cancer has spread (metastases)</Label>
              </div>
              {formData.metastases && (
                <div className="space-y-2">
                  <Label htmlFor="metastasesLocations">Metastases Locations</Label>
                  <Input
                    id="metastasesLocations"
                    value={formData.metastasesLocations}
                    onChange={(e) => updateFormData('metastasesLocations', e.target.value)}
                    placeholder="List locations where cancer has spread"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treatment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Treatment History
            </CardTitle>
            <CardDescription>Current and past cancer treatments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentStage">Current Treatment Stage</Label>
              <Select value={formData.treatmentStage} onValueChange={(value) => updateFormData('treatmentStage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-treatment">Pre-Treatment</SelectItem>
                  <SelectItem value="during-treatment">During Treatment</SelectItem>
                  <SelectItem value="post-treatment">Post-Treatment</SelectItem>
                  <SelectItem value="survivorship">Survivorship</SelectItem>
                  <SelectItem value="palliative">Palliative Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Current Treatments (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Chemotherapy', 'Radiation Therapy', 'Immunotherapy', 'Hormone Therapy', 'Targeted Therapy', 'Surgery Recovery'].map((treatment) => (
                  <div key={treatment} className="flex items-center space-x-2">
                    <Checkbox
                      id={treatment}
                      checked={formData.currentTreatments.includes(treatment)}
                      onCheckedChange={() => toggleArrayField('currentTreatments', treatment)}
                    />
                    <Label htmlFor={treatment} className="text-sm">{treatment}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chemotherapyHistory"
                    checked={formData.chemotherapyHistory}
                    onCheckedChange={(checked) => updateFormData('chemotherapyHistory', checked)}
                  />
                  <Label htmlFor="chemotherapyHistory">Previous Chemotherapy</Label>
                </div>
                {formData.chemotherapyHistory && (
                  <div className="space-y-2">
                    <Label htmlFor="chemotherapyType">Chemotherapy Type/Regimen</Label>
                    <Input
                      id="chemotherapyType"
                      value={formData.chemotherapyType}
                      onChange={(e) => updateFormData('chemotherapyType', e.target.value)}
                      placeholder="e.g., ABVD, CHOP, AC-T"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="radiationHistory"
                    checked={formData.radiationHistory}
                    onCheckedChange={(checked) => updateFormData('radiationHistory', checked)}
                  />
                  <Label htmlFor="radiationHistory">Previous Radiation Therapy</Label>
                </div>
                {formData.radiationHistory && (
                  <div className="space-y-2">
                    <Label htmlFor="radiationArea">Radiation Treatment Area</Label>
                    <Input
                      id="radiationArea"
                      value={formData.radiationArea}
                      onChange={(e) => updateFormData('radiationArea', e.target.value)}
                      placeholder="e.g., chest, abdomen, brain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="surgeryHistory"
                  checked={formData.surgeryHistory}
                  onCheckedChange={(checked) => updateFormData('surgeryHistory', checked)}
                />
                <Label htmlFor="surgeryHistory">Previous Cancer Surgery</Label>
              </div>
              {formData.surgeryHistory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surgeryType">Surgery Type</Label>
                    <Input
                      id="surgeryType"
                      value={formData.surgeryType}
                      onChange={(e) => updateFormData('surgeryType', e.target.value)}
                      placeholder="e.g., mastectomy, lobectomy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surgeryDate">Surgery Date</Label>
                    <Input
                      id="surgeryDate"
                      type="date"
                      value={formData.surgeryDate}
                      onChange={(e) => updateFormData('surgeryDate', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Physical Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Physical Assessment
            </CardTitle>
            <CardDescription>Current physical status and capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Energy Level: {formData.energyLevel}/10</Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.energyLevel}
                  onChange={(e) => updateFormData('energyLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                  onChange={(e) => updateFormData('mobilityStatus', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
                  onChange={(e) => updateFormData('painLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>No Pain</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fatigue Level: {formData.fatigueLevel}/10</Label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.fatigueLevel}
                  onChange={(e) => updateFormData('fatigueLevel', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimal</span>
                  <span>Severe</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balanceIssues"
                  checked={formData.balanceIssues}
                  onCheckedChange={(checked) => updateFormData('balanceIssues', checked)}
                />
                <Label htmlFor="balanceIssues">Balance or coordination issues</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lymphedemaRisk"
                  checked={formData.lymphedemaRisk}
                  onCheckedChange={(checked) => updateFormData('lymphedemaRisk', checked)}
                />
                <Label htmlFor="lymphedemaRisk">Lymphedema risk or present</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicalRestrictions">Physical Restrictions or Limitations</Label>
              <Textarea
                id="physicalRestrictions"
                value={formData.physicalRestrictions}
                onChange={(e) => updateFormData('physicalRestrictions', e.target.value)}
                placeholder="Describe any physical limitations, movement restrictions, or areas to avoid"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercise History & Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exercise History & Goals
            </CardTitle>
            <CardDescription>Previous fitness experience and current objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previousExerciseLevel">Previous Exercise Level</Label>
              <Select value={formData.previousExerciseLevel} onValueChange={(value) => updateFormData('previousExerciseLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select previous exercise level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="lightly-active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately-active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very-active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="athlete">Competitive Athlete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Exercise Preferences (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Walking', 'Swimming', 'Cycling', 'Yoga', 'Pilates', 'Strength Training', 'Dancing', 'Tai Chi', 'Water Aerobics', 'Stretching', 'Balance Training', 'Cardio Equipment'].map((exercise) => (
                  <div key={exercise} className="flex items-center space-x-2">
                    <Checkbox
                      id={exercise}
                      checked={formData.exercisePreferences.includes(exercise)}
                      onCheckedChange={() => toggleArrayField('exercisePreferences', exercise)}
                    />
                    <Label htmlFor={exercise} className="text-sm">{exercise}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Fitness Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Improve Strength', 'Increase Energy', 'Reduce Fatigue', 'Better Balance', 'Pain Management', 'Weight Management', 'Mood Enhancement', 'Sleep Quality', 'Bone Health', 'Cardiovascular Health', 'Flexibility', 'Return to Daily Activities'].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onCheckedChange={() => toggleArrayField('fitnessGoals', goal)}
                    />
                    <Label htmlFor={goal} className="text-sm">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivation Level: {formData.motivationLevel}/10</Label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.motivationLevel}
                onChange={(e) => updateFormData('motivationLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Very High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Clearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical Clearance
            </CardTitle>
            <CardDescription>Exercise clearance and medical approval status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicalClearance">Medical Clearance Status</Label>
              <Select value={formData.medicalClearance} onValueChange={(value) => updateFormData('medicalClearance', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clearance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleared">Cleared for all exercise</SelectItem>
                  <SelectItem value="modified">Cleared with modifications</SelectItem>
                  <SelectItem value="restricted">Restricted exercise only</SelectItem>
                  <SelectItem value="pending">Clearance pending</SelectItem>
                  <SelectItem value="not-required">Not required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clearanceDate">Clearance Date</Label>
                <Input
                  id="clearanceDate"
                  type="date"
                  value={formData.clearanceDate}
                  onChange={(e) => updateFormData('clearanceDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clearingPhysician">Clearing Physician</Label>
                <Input
                  id="clearingPhysician"
                  value={formData.clearingPhysician}
                  onChange={(e) => updateFormData('clearingPhysician', e.target.value)}
                  placeholder="Dr. Name, Institution"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRestrictions">Special Restrictions or Precautions</Label>
              <Textarea
                id="specialRestrictions"
                value={formData.specialRestrictions}
                onChange={(e) => updateFormData('specialRestrictions', e.target.value)}
                placeholder="Any specific exercise restrictions or precautions from medical team"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Additional Information
            </CardTitle>
            <CardDescription>Patient concerns and additional notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientConcerns">Patient Concerns or Questions</Label>
              <Textarea
                id="patientConcerns"
                value={formData.patientConcerns}
                onChange={(e) => updateFormData('patientConcerns', e.target.value)}
                placeholder="Any concerns, fears, or questions about exercise during cancer treatment"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                placeholder="Any other relevant information"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => setLocation('/ai-prescriptions')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createPatientMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createPatientMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile & Prescription...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Patient Profile & Generate Prescription
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}