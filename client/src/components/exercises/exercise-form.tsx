import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash, 
  Video, 
  X 
} from "lucide-react";
import { Exercise } from "@/lib/types";
import { YouTubeVideoBrowser } from "./youtube-video-browser";

// Helper function to extract YouTube video ID from URL
const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Constants
const CANCER_TYPES = [
  "Breast Cancer",
  "Colorectal Cancer",
  "Prostate Cancer",
  "Lung Cancer",
  "Lymphoma",
  "Leukemia",
  "Melanoma",
  "Ovarian Cancer",
  "Pancreatic Cancer",
  "Thyroid Cancer",
  "Other"
];

const TREATMENT_PHASES = [
  "Pre-Treatment",
  "During Treatment",
  "Post-Treatment",
  "Recovery",
  "Maintenance",
  "Remission"
];

const MOVEMENT_TYPES = [
  "Cardio",
  "Strength",
  "Flexibility",
  "Balance",
  "Mobility",
  "Coordination"
];

const BODY_FOCUS = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Core",
  "Back",
  "Arms",
  "Legs",
  "Shoulders",
  "Chest"
];

const EQUIPMENT = [
  "None",
  "Resistance Bands",
  "Light Dumbbells",
  "Chair",
  "Yoga Mat",
  "Stability Ball",
  "Foam Roller",
  "Treadmill",
  "Stationary Bike",
  "Swimming Pool"
];

const COMMON_BENEFITS = [
  "Improves cardiovascular health",
  "Increases muscle strength",
  "Enhances flexibility",
  "Reduces fatigue",
  "Boosts mood and mental health",
  "Improves balance and stability",
  "Reduces risk of falls",
  "Helps maintain healthy weight",
  "Improves quality of life"
];

// Form validation schema
const exerciseFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  energyLevel: z.coerce.number().min(1).max(5),
  cancerAppropriate: z.array(z.string()).min(1, "Select at least one cancer type"),
  treatmentPhases: z.array(z.string()).optional(),
  bodyFocus: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  movementType: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  videoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  duration: z.number().min(1, "Duration must be at least 1 minute").optional().or(z.literal(0)),
  instructionSteps: z.array(z.string()).min(1, "Add at least one instruction step"),
  precautions: z.string().optional(),
  modifications: z.record(z.string()).optional(),

});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExerciseFormValues) => void;
  initialData?: Exercise;
  isSubmitting: boolean;
}

export function ExerciseForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting
}: ExerciseFormProps) {
  const [instructionStep, setInstructionStep] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [modificationKey, setModificationKey] = useState("");
  const [modificationValue, setModificationValue] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  
  // Initialize the form
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      energyLevel: 2,
      cancerAppropriate: [],
      treatmentPhases: [],
      bodyFocus: [],
      benefits: [],
      movementType: "",
      equipment: [],
      videoUrl: "",
      imageUrl: "",
      duration: 0,
      instructionSteps: [],
      precautions: "",
      modifications: {},
      citations: []
    }
  });
  
  // Add an instruction step
  const addInstructionStep = () => {
    if (!instructionStep) return;
    
    const currentSteps = form.getValues("instructionSteps") || [];
    form.setValue("instructionSteps", [...currentSteps, instructionStep], {
      shouldValidate: true
    });
    
    setInstructionStep("");
  };
  
  // Remove an instruction step
  const removeInstructionStep = (index: number) => {
    const currentSteps = form.getValues("instructionSteps") || [];
    form.setValue(
      "instructionSteps",
      currentSteps.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };
  
  // Add a cancer type
  const toggleCancerType = (type: string) => {
    const currentTypes = form.getValues("cancerAppropriate") || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    form.setValue("cancerAppropriate", newTypes, { shouldValidate: true });
  };
  
  // Add a treatment phase
  const toggleTreatmentPhase = (phase: string) => {
    const currentPhases = form.getValues("treatmentPhases") || [];
    const newPhases = currentPhases.includes(phase)
      ? currentPhases.filter(p => p !== phase)
      : [...currentPhases, phase];
    
    form.setValue("treatmentPhases", newPhases, { shouldValidate: true });
  };
  
  // Add a body focus area
  const toggleBodyFocus = (area: string) => {
    const currentAreas = form.getValues("bodyFocus") || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area];
    
    form.setValue("bodyFocus", newAreas, { shouldValidate: true });
  };
  
  // Add equipment
  const toggleEquipment = (item: string) => {
    const currentItems = form.getValues("equipment") || [];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    form.setValue("equipment", newItems, { shouldValidate: true });
  };
  
  // Add a benefit
  const addBenefit = () => {
    if (!benefitInput) return;
    
    const currentBenefits = form.getValues("benefits") || [];
    if (!currentBenefits.includes(benefitInput)) {
      form.setValue("benefits", [...currentBenefits, benefitInput], {
        shouldValidate: true
      });
    }
    
    setBenefitInput("");
  };
  
  // Add a common benefit
  const addCommonBenefit = (benefit: string) => {
    const currentBenefits = form.getValues("benefits") || [];
    if (!currentBenefits.includes(benefit)) {
      form.setValue("benefits", [...currentBenefits, benefit], {
        shouldValidate: true
      });
    }
  };
  
  // Remove a benefit
  const removeBenefit = (benefit: string) => {
    const currentBenefits = form.getValues("benefits") || [];
    form.setValue(
      "benefits",
      currentBenefits.filter(b => b !== benefit),
      { shouldValidate: true }
    );
  };
  
  // Add a modification
  const addModification = () => {
    if (!modificationKey || !modificationValue) return;
    
    const currentMods = form.getValues("modifications") || {};
    form.setValue("modifications", {
      ...currentMods,
      [modificationKey]: modificationValue
    }, { shouldValidate: true });
    
    setModificationKey("");
    setModificationValue("");
  };
  
  // Remove a modification
  const removeModification = (key: string) => {
    const currentMods = form.getValues("modifications") || {};
    const { [key]: _, ...rest } = currentMods;
    form.setValue("modifications", rest, { shouldValidate: true });
  };
  
  // Add a citation
  const addCitation = () => {
    const currentCitations = form.getValues("citations") || [];
    form.setValue("citations", [
      ...currentCitations,
      { author: "", title: "", journal: "", year: 0, url: "" }
    ], { shouldValidate: true });
  };
  
  // Update a citation field
  const updateCitation = (index: number, field: string, value: string | number) => {
    const currentCitations = form.getValues("citations") || [];
    const updatedCitations = [...currentCitations];
    updatedCitations[index] = {
      ...updatedCitations[index],
      [field]: value
    };
    
    form.setValue("citations", updatedCitations, { shouldValidate: true });
  };
  
  // Remove a citation
  const removeCitation = (index: number) => {
    const currentCitations = form.getValues("citations") || [];
    form.setValue(
      "citations",
      currentCitations.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Exercise" : "Add New Exercise"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => {
            console.log("Form submission data:", data);
            console.log("Form errors:", form.formState.errors);
            onSubmit(data);
          })} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exercise Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Gentle Walking" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="energyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energy Level Required (1-5)*</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select energy level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Low Energy</SelectItem>
                            <SelectItem value="2">2 - Low Energy</SelectItem>
                            <SelectItem value="3">3 - Moderate Energy</SelectItem>
                            <SelectItem value="4">4 - High Energy</SelectItem>
                            <SelectItem value="5">5 - Very High Energy</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Provide a detailed description of the exercise..." 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="movementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Movement Type</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOVEMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommended Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="e.g., 15"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          YouTube Video URL
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Input 
                              {...field} 
                              placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                              className="font-mono text-sm"
                            />
                            
                            {/* YouTube Video Browser */}
                            <YouTubeVideoBrowser
                              onVideoSelect={(videoUrl, videoTitle) => {
                                field.onChange(videoUrl);
                                // Optional: Auto-fill exercise name if empty
                                if (!form.getValues("name") && videoTitle) {
                                  form.setValue("name", videoTitle);
                                }
                              }}
                              selectedVideoUrl={field.value}
                            />
                            
                            <div className="text-xs text-muted-foreground">
                              Paste your YouTube video URL above or browse your channel videos below.
                            </div>
                            
                            {field.value && (
                              <div className="mt-2 p-3 bg-muted rounded-md">
                                <div className="text-xs font-medium mb-2">Video Preview:</div>
                                {extractVideoId(field.value) ? (
                                  <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${extractVideoId(field.value)}`}
                                      title="Exercise Video Preview"
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allowFullScreen
                                    />
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-gray-100 rounded flex items-center justify-center text-sm text-muted-foreground">
                                    Invalid YouTube URL
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div>
                  <FormLabel>Body Focus Areas</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {BODY_FOCUS.map((area) => {
                      const isSelected = form.getValues().bodyFocus?.includes(area) || false;
                      return (
                        <Badge 
                          key={area}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleBodyFocus(area)}
                        >
                          {area}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <FormLabel>Equipment Needed</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {EQUIPMENT.map((item) => {
                      const isSelected = form.getValues().equipment?.includes(item) || false;
                      return (
                        <Badge 
                          key={item}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleEquipment(item)}
                        >
                          {item}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <FormLabel>Benefits</FormLabel>
                  <div className="mt-2 mb-2">
                    <div className="text-sm mb-2 text-muted-foreground">Common benefits:</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {COMMON_BENEFITS.map((benefit) => {
                        const isSelected = form.getValues().benefits?.includes(benefit) || false;
                        return (
                          <Badge 
                            key={benefit}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => isSelected ? removeBenefit(benefit) : addCommonBenefit(benefit)}
                          >
                            {benefit}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        placeholder="Add custom benefit..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addBenefit}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      {form.getValues().benefits?.map((benefit) => (
                        <div 
                          key={benefit} 
                          className="flex items-center gap-2 bg-muted p-2 rounded-md mt-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm flex-1">{benefit}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0" 
                            onClick={() => removeBenefit(benefit)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-4">
                <FormField
                  control={form.control}
                  name="instructionSteps"
                  render={() => (
                    <FormItem>
                      <FormLabel>Instruction Steps*</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          value={instructionStep}
                          onChange={(e) => setInstructionStep(e.target.value)}
                          placeholder="Add a step instruction..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addInstructionStep}
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {form.getValues().instructionSteps?.map((step, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-2 bg-muted p-2 rounded-md"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                              {index + 1}
                            </span>
                            <span className="text-sm flex-1">{step}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0" 
                              onClick={() => removeInstructionStep(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {form.formState.errors.instructionSteps && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.instructionSteps.message}
                          </p>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Modifications</FormLabel>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        value={modificationKey}
                        onChange={(e) => setModificationKey(e.target.value)}
                        placeholder="Scenario (e.g., 'Low mobility')"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={modificationValue}
                          onChange={(e) => setModificationValue(e.target.value)}
                          placeholder="Modification"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addModification}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      {Object.entries(form.getValues().modifications || {}).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="bg-muted p-3 rounded-md"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{key}</h4>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="h-6 w-6 p-0 -mt-1 -mr-1" 
                              onClick={() => removeModification(key)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Medical Tab */}
              <TabsContent value="medical" className="space-y-4">
                <div>
                  <FormLabel className="text-base font-medium">Cancer Types*</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CANCER_TYPES.map((type) => {
                      const isSelected = form.getValues().cancerAppropriate?.includes(type) || false;
                      return (
                        <Badge 
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleCancerType(type)}
                        >
                          {type}
                        </Badge>
                      );
                    })}
                  </div>
                  {form.formState.errors.cancerAppropriate && (
                    <p className="text-sm text-destructive mt-2">
                      {form.formState.errors.cancerAppropriate.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <FormLabel className="text-base font-medium">Treatment Phases</FormLabel>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TREATMENT_PHASES.map((phase) => {
                      const isSelected = form.getValues().treatmentPhases?.includes(phase) || false;
                      return (
                        <Badge 
                          key={phase}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTreatmentPhase(phase)}
                        >
                          {phase}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="precautions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precautions & Warnings</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter any medical precautions or warnings..." 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-medium">Research Citations</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCitation}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Citation
                    </Button>
                  </div>
                  
                  <div className="mt-3 space-y-4">
                    {form.getValues().citations?.map((citation, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Citation #{index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0" 
                            onClick={() => removeCitation(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <div>
                            <FormLabel className="text-sm">Author*</FormLabel>
                            <Input
                              value={citation.author || ""}
                              onChange={(e) => updateCitation(index, "author", e.target.value)}
                              placeholder="Author name"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <FormLabel className="text-sm">Title*</FormLabel>
                            <Input
                              value={citation.title || ""}
                              onChange={(e) => updateCitation(index, "title", e.target.value)}
                              placeholder="Publication title"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <FormLabel className="text-sm">Journal</FormLabel>
                            <Input
                              value={citation.journal || ""}
                              onChange={(e) => updateCitation(index, "journal", e.target.value)}
                              placeholder="Journal name"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <FormLabel className="text-sm">Year</FormLabel>
                            <Input
                              type="number"
                              value={citation.year || ""}
                              onChange={(e) => updateCitation(index, "year", parseInt(e.target.value) || 0)}
                              placeholder="Publication year"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="sm:col-span-2">
                            <FormLabel className="text-sm">URL</FormLabel>
                            <Input
                              value={citation.url || ""}
                              onChange={(e) => updateCitation(index, "url", e.target.value)}
                              placeholder="https://example.com/publication"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update Exercise" : "Create Exercise"}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={async () => {
                  console.log("=== FORM DEBUG ===");
                  const values = form.getValues();
                  const errors = form.formState.errors;
                  
                  console.log("Current form values:", values);
                  console.log("Form errors:", errors);
                  console.log("Form is valid:", form.formState.isValid);
                  
                  // Trigger validation
                  const isValid = await form.trigger();
                  console.log("Manual validation result:", isValid);
                  console.log("Errors after validation:", form.formState.errors);
                  
                  // Show alert with summary
                  const errorCount = Object.keys(errors).length;
                  const errorDetails = Object.entries(errors).map(([field, error]) => 
                    `${field}: ${error?.message || 'Invalid'}`
                  ).join('\n');
                  
                  alert(`Form Debug:\n- Has errors: ${errorCount > 0}\n- Error count: ${errorCount}\n- Is valid: ${isValid}\n\nErrors:\n${errorDetails}\n\nCheck console for details`);
                }}
              >
                Debug Form
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}