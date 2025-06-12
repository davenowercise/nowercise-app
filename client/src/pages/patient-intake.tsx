import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Comprehensive patient intake schema
const patientIntakeSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(1, "Emergency phone is required"),
  
  // Cancer Information
  cancerType: z.string().min(1, "Cancer type is required"),
  cancerStage: z.string().min(1, "Cancer stage is required"),
  diagnosisDate: z.string().min(1, "Diagnosis date is required"),
  primaryTumorLocation: z.string().min(1, "Primary tumor location is required"),
  metastases: z.boolean(),
  metastasesLocations: z.string().optional(),
  
  // Treatment Information
  treatmentStage: z.string().min(1, "Treatment stage is required"),
  currentTreatments: z.array(z.string()),
  chemotherapyHistory: z.boolean(),
  chemotherapyType: z.string().optional(),
  radiationHistory: z.boolean(),
  radiationArea: z.string().optional(),
  surgeryHistory: z.boolean(),
  surgeryType: z.string().optional(),
  surgeryDate: z.string().optional(),
  
  // Medical History
  comorbidities: z.array(z.string()),
  currentMedications: z.string().optional(),
  allergies: z.string().optional(),
  previousSurgeries: z.string().optional(),
  familyHistory: z.string().optional(),
  
  // Physical Assessment
  energyLevel: z.number().min(1).max(10),
  mobilityStatus: z.number().min(1).max(10),
  painLevel: z.number().min(0).max(10),
  fatigueLevel: z.number().min(0).max(10),
  balanceIssues: z.boolean(),
  lymphedemaRisk: z.boolean(),
  physicalRestrictions: z.string().optional(),
  
  // Exercise History
  previousExerciseLevel: z.string().min(1, "Previous exercise level is required"),
  exercisePreferences: z.array(z.string()),
  mobilityAids: z.array(z.string()),
  fitnessGoals: z.array(z.string()),
  motivationLevel: z.number().min(1).max(10),
  
  // Medical Clearance
  medicalClearance: z.string().min(1, "Medical clearance status is required"),
  clearanceDate: z.string().optional(),
  clearingPhysician: z.string().optional(),
  specialRestrictions: z.string().optional(),
  
  // Additional Information
  patientConcerns: z.string().optional(),
  additionalNotes: z.string().optional(),
});

type PatientIntakeFormData = z.infer<typeof patientIntakeSchema>;

const cancerTypes = [
  "Breast Cancer", "Lung Cancer", "Prostate Cancer", "Colorectal Cancer",
  "Melanoma", "Lymphoma", "Leukemia", "Pancreatic Cancer", "Ovarian Cancer",
  "Kidney Cancer", "Bladder Cancer", "Liver Cancer", "Brain Cancer", "Other"
];

const cancerStages = [
  "Stage 0 (In Situ)", "Stage I", "Stage II", "Stage III", "Stage IV", "Unknown"
];

const treatmentStages = [
  "Pre-Treatment", "During Treatment", "Post-Treatment", "Survivorship", 
  "Palliative Care", "Advanced/Palliative"
];

const currentTreatmentOptions = [
  "Chemotherapy", "Radiation Therapy", "Immunotherapy", "Hormone Therapy",
  "Targeted Therapy", "Surgery", "Stem Cell Transplant", "Clinical Trial", "None"
];

const comorbidityOptions = [
  "Diabetes", "Heart Disease", "High Blood Pressure", "Arthritis",
  "Osteoporosis", "Depression", "Anxiety", "Chronic Pain", "COPD", "None"
];

const exercisePreferenceOptions = [
  "Walking", "Swimming", "Yoga", "Strength Training", "Cycling",
  "Dancing", "Tai Chi", "Stretching", "Group Classes", "Home Workouts"
];

const mobilityAidOptions = [
  "None", "Cane", "Walker", "Wheelchair", "Crutches", "Prosthetic"
];

const fitnessGoalOptions = [
  "Increase Energy", "Reduce Fatigue", "Improve Strength", "Better Sleep",
  "Manage Weight", "Reduce Pain", "Improve Mood", "Better Balance", "Social Connection"
];

export default function PatientIntakePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatientIntakeFormData>({
    resolver: zodResolver(patientIntakeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      phone: "",
      emergencyContact: "",
      emergencyPhone: "",
      cancerType: "",
      cancerStage: "",
      diagnosisDate: "",
      primaryTumorLocation: "",
      metastases: false,
      metastasesLocations: "",
      treatmentStage: "",
      currentTreatments: [],
      chemotherapyHistory: false,
      chemotherapyType: "",
      radiationHistory: false,
      radiationArea: "",
      surgeryHistory: false,
      surgeryType: "",
      surgeryDate: "",
      comorbidities: [],
      currentMedications: "",
      allergies: "",
      previousSurgeries: "",
      familyHistory: "",
      energyLevel: 5,
      mobilityStatus: 8,
      painLevel: 0,
      fatigueLevel: 3,
      balanceIssues: false,
      lymphedemaRisk: false,
      physicalRestrictions: "",
      previousExerciseLevel: "",
      exercisePreferences: [],
      mobilityAids: [],
      fitnessGoals: [],
      motivationLevel: 7,
      medicalClearance: "",
      clearanceDate: "",
      clearingPhysician: "",
      specialRestrictions: "",
      patientConcerns: "",
      additionalNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PatientIntakeFormData) => {
      return await apiRequest("/api/patient-intake", {
        method: "POST",
        data: data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Patient Profile Created",
        description: `Welcome ${data.firstName}! Your comprehensive profile has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      form.reset();
      setCurrentStep(1);
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Profile",
        description: error.message || "Failed to create patient profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PatientIntakeFormData) => {
    mutation.mutate(data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cancer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cancerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancer Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cancer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cancerTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cancerStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancer Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cancer stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cancerStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diagnosisDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min="1950-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        autoComplete="off"
                        placeholder=""
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryTumorLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Tumor Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="metastases"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Has metastases (cancer spread)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {form.watch("metastases") && (
                <FormField
                  control={form.control}
                  name="metastasesLocations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metastases Locations</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe where the cancer has spread" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Treatment Information</h3>
            <FormField
              control={form.control}
              name="treatmentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Treatment Stage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {treatmentStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentTreatments"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Current Treatments</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {currentTreatmentOptions.map((treatment) => (
                      <FormField
                        key={treatment}
                        control={form.control}
                        name="currentTreatments"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={treatment}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(treatment)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, treatment])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== treatment
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {treatment}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Physical Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="energyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Energy Level</FormLabel>
                    <div className="text-sm text-gray-600 mb-2">
                      Scale: 1 = Very Low Energy, 10 = Very High Energy
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        placeholder="1-10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Pain Level</FormLabel>
                    <div className="text-sm text-gray-600 mb-2">
                      Scale: 0 = No Pain, 10 = Severe Pain
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="10" 
                        placeholder="0-10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatigueLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fatigue Level</FormLabel>
                    <div className="text-sm text-gray-600 mb-2">
                      Scale: 0 = No Fatigue, 10 = Extreme Fatigue
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="10" 
                        placeholder="0-10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobilityStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobility Status</FormLabel>
                    <div className="text-sm text-gray-600 mb-2">
                      Scale: 1 = Very Limited, 10 = Excellent Mobility
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        placeholder="1-10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="balanceIssues"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Has balance issues or falls risk
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lymphedemaRisk"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        At risk for lymphedema
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Exercise & Goals</h3>
            <FormField
              control={form.control}
              name="previousExerciseLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Exercise Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select previous exercise level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sedentary">Sedentary (little to no exercise)</SelectItem>
                      <SelectItem value="Light">Light (1-2 days per week)</SelectItem>
                      <SelectItem value="Moderate">Moderate (3-4 days per week)</SelectItem>
                      <SelectItem value="Active">Active (5+ days per week)</SelectItem>
                      <SelectItem value="Athlete">Athlete/Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exercisePreferences"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Exercise Preferences</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {exercisePreferenceOptions.map((preference) => (
                      <FormField
                        key={preference}
                        control={form.control}
                        name="exercisePreferences"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={preference}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(preference)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, preference])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== preference
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {preference}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fitnessGoals"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Fitness Goals</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {fitnessGoalOptions.map((goal) => (
                      <FormField
                        key={goal}
                        control={form.control}
                        name="fitnessGoals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={goal}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(goal)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, goal])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== goal
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {goal}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Clearance & Final Details</h3>
            <FormField
              control={form.control}
              name="medicalClearance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medical Clearance Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clearance status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cleared">Cleared for Exercise</SelectItem>
                      <SelectItem value="Conditional">Conditional Clearance</SelectItem>
                      <SelectItem value="Pending">Clearance Pending</SelectItem>
                      <SelectItem value="Not Required">Not Required</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clearanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clearance Date (if applicable)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        min="1950-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        autoComplete="off"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clearingPhysician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clearing Physician (if applicable)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="patientConcerns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Concerns or Questions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Any specific concerns or questions about exercise?" 
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Any additional information you'd like to share" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Comprehensive Patient Intake
            <Badge variant="outline">Step {currentStep} of 6</Badge>
          </CardTitle>
          <CardDescription>
            Complete your comprehensive health profile to receive personalized exercise recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}
              
              <Separator />
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 6 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {mutation.isPending ? "Creating Profile..." : "Complete Profile"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}