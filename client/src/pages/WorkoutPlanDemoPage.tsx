import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorkoutFromTier } from '@/utils/createWorkoutFromTier';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Demo page to showcase the exercise plan generation
 */
export default function WorkoutPlanDemoPage() {
  const [, navigate] = useLocation();
  
  // Extract tier and cancer type from URL query parameters
  const params = new URLSearchParams(window.location.search);
  const initialTier = params.get('tier') 
    ? Number(params.get('tier')) 
    : undefined;
  const initialCancer = params.get('cancer') || undefined;
  
  // Form state
  const [tier, setTier] = useState<number>(initialTier || 2);
  const [cancerType, setCancerType] = useState<string>(initialCancer || 'breast');
  const [treatmentPhase, setTreatmentPhase] = useState<string>('Post-Treatment');
  const [equipment, setEquipment] = useState<string[]>(['resistance-bands', 'chair']);
  const [duration, setDuration] = useState<string>('medium');
  const [format, setFormat] = useState<'standard' | 'streamlined'>('standard');
  
  // Toggle for equipment selection
  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter(i => i !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };
  
  // Generate workout plan based on selected options
  const workoutResult = createWorkoutFromTier({
    tier,
    treatmentPhase,
    cancerType,
    preferences: {
      equipment,
      duration,
      format
    }
  });
  
  // Update URL when form changes
  useEffect(() => {
    const newUrl = `/workout-plan?tier=${tier}&cancer=${cancerType}`;
    window.history.replaceState({}, '', newUrl);
  }, [tier, cancerType]);
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Personalized Exercise Plan</h1>
      <p className="text-muted-foreground mb-6">
        Generate a personalized exercise plan based on your health profile and preferences
      </p>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left sidebar with controls */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Plan Settings</CardTitle>
              <CardDescription>
                Customize your exercise plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Exercise Tier</Label>
                  <Select 
                    value={tier.toString()} 
                    onValueChange={(value) => setTier(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tier 1 (Conservative)</SelectItem>
                      <SelectItem value="2">Tier 2 (Moderate)</SelectItem>
                      <SelectItem value="3">Tier 3 (Progressive)</SelectItem>
                      <SelectItem value="4">Tier 4 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cancerType">Cancer Type</Label>
                  <Select 
                    value={cancerType} 
                    onValueChange={setCancerType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Cancer Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breast">Breast</SelectItem>
                      <SelectItem value="prostate">Prostate</SelectItem>
                      <SelectItem value="colorectal">Colorectal</SelectItem>
                      <SelectItem value="lung">Lung</SelectItem>
                      <SelectItem value="melanoma">Melanoma</SelectItem>
                      <SelectItem value="lymphoma">Lymphoma</SelectItem>
                      <SelectItem value="leukemia">Leukemia</SelectItem>
                      <SelectItem value="thyroid">Thyroid</SelectItem>
                      <SelectItem value="bladder">Bladder</SelectItem>
                      <SelectItem value="ovarian">Ovarian</SelectItem>
                      <SelectItem value="pancreatic">Pancreatic</SelectItem>
                      <SelectItem value="brain">Brain</SelectItem>
                      <SelectItem value="head_and_neck">Head and Neck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatmentPhase">Treatment Phase</Label>
                  <Select 
                    value={treatmentPhase} 
                    onValueChange={setTreatmentPhase}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Treatment Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-Treatment">Pre-Treatment</SelectItem>
                      <SelectItem value="During-Treatment">During Treatment</SelectItem>
                      <SelectItem value="Post-Surgery">Post-Surgery</SelectItem>
                      <SelectItem value="Post-Treatment">Post-Treatment</SelectItem>
                      <SelectItem value="Long-Term Survivor">Long-Term Survivor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Workout Duration</Label>
                  <Select 
                    value={duration} 
                    onValueChange={setDuration}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (15-20 min)</SelectItem>
                      <SelectItem value="medium">Medium (25-35 min)</SelectItem>
                      <SelectItem value="long">Long (40-60 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="format">Workout Format</Label>
                  <Select 
                    value={format} 
                    onValueChange={(value) => setFormat(value as 'standard' | 'streamlined')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Detailed)</SelectItem>
                      <SelectItem value="streamlined">Streamlined (Simplified)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Streamlined format offers a simpler layout with regular rest periods
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Available Equipment</Label>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <p className="text-sm text-muted-foreground">
                          Select the equipment you have available to get exercises 
                          that use this equipment.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {['resistance-bands', 'dumbbells', 'chair', 'yoga-mat', 'medicine-ball', 'none'].map(item => (
                      <Badge
                        key={item}
                        variant={equipment.includes(item) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer select-none",
                          equipment.includes(item) ? "" : "bg-secondary/50 hover:bg-secondary"
                        )}
                        onClick={() => toggleEquipment(item)}
                      >
                        {equipment.includes(item) && <Check className="mr-1 h-3 w-3" />}
                        {item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
            <h3 className="font-medium text-blue-900 mb-2">About Exercise Tiers</h3>
            <ul className="space-y-1.5 text-blue-800">
              <li><span className="font-medium">Tier 1:</span> Very gentle, seated or supported exercises</li>
              <li><span className="font-medium">Tier 2:</span> Light intensity with longer rest periods</li>
              <li><span className="font-medium">Tier 3:</span> Moderate intensity with some challenging movements</li>
              <li><span className="font-medium">Tier 4:</span> Higher intensity appropriate for well-recovered patients</li>
            </ul>
          </div>
        </div>
        
        {/* Main content area showing the workout */}
        <div className="md:col-span-8">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle>{workoutResult.sessionTitle}</CardTitle>
                  <CardDescription>
                    Generated on {workoutResult.date}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    Tier {workoutResult.tier}
                  </Badge>
                  
                  <Badge variant="outline" className="bg-blue-50">
                    {workoutResult.cancerType} cancer
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutResult.exercises?.map((step, index) => (
                  <div key={index} className={index > 0 ? 'pt-3' : ''}>
                    {index > 0 && <Separator className="mb-3" />}
                    <div className="font-medium">{step.step}</div>
                    <div className="text-sm text-muted-foreground">{step.detail}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">
                    Save Plan
                  </Button>
                  <Button>
                    Start Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
            <h3 className="font-medium text-blue-900 mb-2">Safety Considerations{workoutResult.cancerType ? ` for ${workoutResult.cancerType.charAt(0).toUpperCase() + workoutResult.cancerType.slice(1)} Cancer` : ''}</h3>
            
            {/* General safety considerations for all cancer types */}
            <div className="mb-3">
              <h4 className="text-blue-800 font-medium mb-1">General Guidance:</h4>
              <ul className="space-y-1 pl-5 list-disc text-blue-700">
                <li>Always start slowly and progress gradually</li>
                <li>Focus on proper form rather than intensity</li>
                <li>Stop exercise if you experience pain or severe fatigue</li>
                <li>Stay hydrated and rest when needed</li>
              </ul>
            </div>
            
            {/* Treatment phase-specific considerations */}
            <div className="mb-3">
              <h4 className="text-blue-800 font-medium mb-1">For {workoutResult.treatmentPhase} Phase:</h4>
              <ul className="space-y-1 pl-5 list-disc text-blue-700">
                {workoutResult.treatmentPhase === 'Pre-Treatment' && (
                  <>
                    <li>Focus on building a foundation of strength and endurance</li>
                    <li>Practice proper breathing techniques during exercise</li>
                    <li>Learn to monitor your effort level using RPE (Rate of Perceived Exertion)</li>
                    <li>Establish good movement patterns and habits</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'During-Treatment' && (
                  <>
                    <li>Exercise at a lower intensity on treatment days</li>
                    <li>Listen to your body and adjust exercises as needed</li>
                    <li>Short, frequent sessions may be better than longer ones</li>
                    <li>Focus on maintaining function rather than building fitness</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Post-Surgery' && (
                  <>
                    <li>Follow your surgeon's specific guidelines for movement restrictions</li>
                    <li>Avoid exercises that put stress on the surgical site</li>
                    <li>Focus on gentle movement to prevent stiffness</li>
                    <li>Progress very gradually as healing occurs</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Post-Treatment' && (
                  <>
                    <li>Begin rebuilding strength and endurance systematically</li>
                    <li>Gradually increase exercise duration and intensity</li>
                    <li>Monitor for late effects of treatment during exercise</li>
                    <li>Focus on functional movements that improve daily activities</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Long-Term Survivor' && (
                  <>
                    <li>Aim for the general exercise guidelines for adults when appropriate</li>
                    <li>Include a variety of exercise types for overall health</li>
                    <li>Consider adding more challenging activities as fitness improves</li>
                    <li>Maintain awareness of any persistent treatment effects</li>
                  </>
                )}
              </ul>
            </div>
            
            {/* Cancer-specific considerations */}
            {workoutResult.cancerType && (
              <div className="mb-3">
                <h4 className="text-blue-800 font-medium mb-1">For {workoutResult.cancerType?.charAt(0).toUpperCase() + workoutResult.cancerType?.slice(1)} Cancer:</h4>
                <ul className="space-y-1 pl-5 list-disc text-blue-700">
                  {workoutResult.cancerType === 'breast' && (
                    <>
                      <li>Be cautious with upper body movements if you've had surgery</li>
                      <li>Modify exercises to avoid lymphedema risk if applicable</li>
                      <li>Consider using lighter weights for upper body exercises</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'prostate' && (
                    <>
                      <li>Be mindful of pelvic floor engagement during exercise</li>
                      <li>Avoid heavy lifting if recently post-surgery</li>
                      <li>Focus on maintaining proper posture during all exercises</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'colorectal' && (
                    <>
                      <li>Avoid excessive abdominal pressure with ostomy</li>
                      <li>Consider seated exercises if experiencing fatigue</li>
                      <li>Choose exercises that don't strain the abdominal area</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'lung' && (
                    <>
                      <li>Monitor breathing carefully during exercise</li>
                      <li>Take longer rest periods if experiencing shortness of breath</li>
                      <li>Avoid exercises that restrict chest expansion</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'melanoma' && (
                    <>
                      <li>Exercise in shaded areas or indoors to avoid sun exposure</li>
                      <li>Wear appropriate clothing to protect healing surgical sites</li>
                      <li>Monitor skin sites during and after exercise</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'lymphoma' && (
                    <>
                      <li>Be cautious of lymphedema risk in affected areas</li>
                      <li>Start with very gentle exercise if experiencing fatigue</li>
                      <li>Monitor for signs of swelling during and after exercise</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'leukemia' && (
                    <>
                      <li>Be alert for unusual bruising or bleeding during exercise</li>
                      <li>Exercise only on days when energy levels are adequate</li>
                      <li>Choose low-impact exercises when platelet counts are low</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'thyroid' && (
                    <>
                      <li>Avoid exercises that put excess strain on the neck</li>
                      <li>Be aware of potential fatigue from hormone changes</li>
                      <li>Monitor heart rate if on thyroid medication</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'bladder' && (
                    <>
                      <li>Consider bathroom accessibility during workout planning</li>
                      <li>Practice pelvic floor exercises as recommended</li>
                      <li>Avoid high-impact activities if experiencing incontinence</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'ovarian' && (
                    <>
                      <li>Be cautious with abdominal exercises following surgery</li>
                      <li>Start with gentle core strengthening</li>
                      <li>Monitor for lymphedema in the lower extremities</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'pancreatic' && (
                    <>
                      <li>Focus on maintaining energy and muscle mass</li>
                      <li>Consider timing exercise around meals for optimal energy</li>
                      <li>Choose gentle activities on days with digestive symptoms</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'brain' && (
                    <>
                      <li>Exercise in a supervised setting if balance is affected</li>
                      <li>Choose simpler movements if coordination is challenging</li>
                      <li>Be aware of potential seizure triggers during exercise</li>
                    </>
                  )}
                  {workoutResult.cancerType === 'head_and_neck' && (
                    <>
                      <li>Be mindful of any swallowing issues during exercise</li>
                      <li>Consider seated exercises if experiencing dizziness</li>
                      <li>Protect the neck area during movement</li>
                    </>
                  )}
                </ul>
              </div>
            )}
            
            {/* Treatment phase-specific considerations */}
            <div>
              <h4 className="text-blue-800 font-medium mb-1">During {workoutResult.treatmentPhase} Phase:</h4>
              <ul className="space-y-1 pl-5 list-disc text-blue-700">
                {workoutResult.treatmentPhase === 'Pre-Treatment' && (
                  <>
                    <li>Focus on building baseline fitness before treatment begins</li>
                    <li>Establish proper exercise technique for future sessions</li>
                    <li>Prioritize consistency over intensity</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'During-Treatment' && (
                  <>
                    <li>Adjust workout intensity based on treatment schedule</li>
                    <li>Consider shorter, more frequent sessions on difficult days</li>
                    <li>Listen to your body and scale back as needed</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Post-Surgery' && (
                  <>
                    <li>Respect medical restrictions for specific movements</li>
                    <li>Start with gentle range of motion exercises</li>
                    <li>Progress only after clearance from your healthcare provider</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Post-Treatment' && (
                  <>
                    <li>Gradually increase exercise duration and intensity</li>
                    <li>Pay attention to lingering treatment side effects</li>
                    <li>Focus on rebuilding strength and endurance</li>
                  </>
                )}
                {workoutResult.treatmentPhase === 'Long-Term Survivor' && (
                  <>
                    <li>Focus on long-term health maintenance</li>
                    <li>Incorporate variety to maintain interest and motivation</li>
                    <li>Continue monitoring for late effects of treatment</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={() => navigate('/parq-demo')}
        >
          Return to PAR-Q+ Screening
        </Button>
      </div>
    </div>
  );
}