import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDemoParam } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Define the safety check form schema
const safetyCheckSchema = z.object({
  name: z.string().min(2, { message: "Please enter your full name" }),
  dateOfBirth: z.string().min(2, { message: "Please enter your date of birth" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  safetyConcerns: z.array(z.string()).optional().default([]),
  cancerType: z.string().optional(),
  treatmentStage: z.string(),
  sideEffects: z.string().optional(),
  energyLevel: z.string().optional(),
  confidence: z.string(),
  movementPreferences: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must confirm this statement to continue"
  }),
  waiver: z.boolean().refine(val => val === true, {
    message: "You must agree to the waiver to continue"
  })
});

type SafetyCheckData = z.infer<typeof safetyCheckSchema>;

// Safety concerns options
const safetyConcerns = [
  { id: "DoctorAdvisedNoExercise", label: "A doctor has advised me not to exercise" },
  { id: "ChestPainOrDizziness", label: "I have chest pain or dizziness during activity" },
  { id: "BalanceIssues", label: "I have balance issues or a history of falls" },
  { id: "RecentSurgery", label: "I'm recovering from surgery and haven't been cleared to exercise yet" },
  { id: "MovementRestrictions", label: "I've been told to avoid specific movements" },
  { id: "Lymphoedema", label: "I experience swelling or lymphoedema" },
  { id: "UnsureSafety", label: "I'm unsure if exercise is safe for me right now" },
];

// Treatment stage options
const treatmentStages = [
  { value: "inTreatment", label: "In treatment" },
  { value: "postTreatment", label: "Recently finished treatment" },
  { value: "livingWith", label: "Living with cancer long-term" },
  { value: "remission", label: "In remission" },
  { value: "preferNot", label: "Prefer not to say" },
];

// Confidence options
const confidenceLevels = [
  { value: "notConfident", label: "Not confident" },
  { value: "unsure", label: "A little unsure" },
  { value: "prettyConfident", label: "Pretty confident" },
  { value: "veryConfident", label: "Very confident" },
];

interface SafetyCheckProps {
  onComplete: (isSafe: boolean) => void;
}

export function SafetyCheck({ onComplete }: SafetyCheckProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user has already completed a safety check
  const { data: existingCheck, isLoading: checkLoading } = useQuery({
    queryKey: [addDemoParam('/api/patient/safety-check')],
    onSuccess: (data) => {
      setIsLoading(false);
      // If user has already completed a safety check and it's found
      if (data && data.completed) {
        // Skip the form and proceed with the existing status
        onComplete(!data.needsConsultation);
      }
    },
    onError: () => {
      setIsLoading(false);
    }
  });
  
  const [formData, setFormData] = useState<SafetyCheckData>({
    name: "",
    dateOfBirth: "",
    email: "",
    safetyConcerns: [],
    cancerType: "",
    treatmentStage: "inTreatment",
    sideEffects: "",
    energyLevel: "",
    confidence: "unsure",
    movementPreferences: "",
    consent: false,
    waiver: false
  });
  
  // Initialize the form
  const form = useForm<SafetyCheckData>({
    resolver: zodResolver(safetyCheckSchema),
    defaultValues: formData,
  });

  // Submit handler
  const submitSafetyCheck = useMutation({
    mutationFn: (data: SafetyCheckData) => {
      return apiRequest('POST', addDemoParam('/api/patient/safety-check'), data);
    },
    onSuccess: (response: any) => {
      setIsSubmitting(false);
      
      // Get consultation status from server response
      const needsConsultation = response.needsConsultation;
      
      if (needsConsultation) {
        toast({
          title: "Medical consultation recommended",
          description: "Based on your responses, we recommend consulting with your healthcare provider before proceeding.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Safety check completed",
          description: "You can now proceed with your detailed assessment.",
        });
      }
      
      // Store safety check ID for future reference
      if (response.id) {
        // Could store in local storage or context if needed
        console.log("Safety check ID:", response.id);
      }
      
      // Notify parent component of completion and safety status
      onComplete(!needsConsultation);
    },
    onError: (error) => {
      console.error("Safety check submission error:", error);
      setIsSubmitting(false);
      toast({
        title: "Submission error",
        description: "There was a problem submitting your safety check. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: SafetyCheckData) => {
    setIsSubmitting(true);
    setFormData(data);
    submitSafetyCheck.mutate(data);
  };

  // Show loading state while checking for existing safety check
  if (isLoading || checkLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Nowercise Club Safety Check-In</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground">
            Checking your safety status...
          </p>
          <Progress value={70} className="w-[60%]" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Nowercise Club Safety Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
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
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Safety concerns */}
            <FormField
              control={form.control}
              name="safetyConcerns"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">General Safety Check (tick any that apply)</FormLabel>
                    <FormDescription>
                      These help us understand if there are any precautions needed before you start exercising
                    </FormDescription>
                  </div>
                  
                  <div className="grid gap-2">
                    {safetyConcerns.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="safetyConcerns"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, item.id]
                                      : field.value?.filter((value) => value !== item.id);
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
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
            
            {/* Cancer information */}
            <FormField
              control={form.control}
              name="cancerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Cancer</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Breast, Colon, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="treatmentStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {treatmentStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
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
              name="sideEffects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Side effects or limitations (e.g. fatigue, swelling, pain)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe any side effects or limitations you experience"
                      className="min-h-[80px]"
                      {...field}
                    />
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
                  <FormLabel>Current Energy Level (1–10)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a number from 1 to 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence in Movement</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your confidence level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {confidenceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
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
              name="movementPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any movement types to avoid?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. overhead movements, running, etc."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Consent checkbox */}
            <FormField
              control={form.control}
              name="consent"
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
                      I confirm the above is accurate and I may be asked to check with my GP before starting.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            {/* Waiver checkbox */}
            <FormField
              control={form.control}
              name="waiver"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Waiver of Liability</FormLabel>
                    <div className="text-sm text-muted-foreground mt-2 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
                      <p className="mb-2">
                        I understand that the activities and recommendations provided by Nowercise are designed to 
                        support general wellbeing and recovery after cancer, but they do not replace medical advice.
                      </p>
                      <p className="mb-2">
                        I confirm that I have answered the safety questions honestly and to the best of my knowledge. 
                        I take part in any physical activity voluntarily and accept full responsibility for monitoring my 
                        own condition throughout.
                      </p>
                      <p className="mb-2">
                        I agree to stop immediately if I experience pain, discomfort, or feel unwell, and I will consult my 
                        GP or healthcare provider if I have any concerns.
                      </p>
                      <p>
                        I release Nowercise, its instructors, and partners from any liability related to injury or harm 
                        resulting from participation in any activity provided, unless due to negligence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      I have read and agree to the waiver of liability.
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}