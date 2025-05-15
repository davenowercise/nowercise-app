import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import WorkoutPlanDisplay from '@/components/WorkoutPlanDisplay';
import { WorkoutPlanOptions } from '@/utils/generateWorkoutPlan';

export default function WorkoutPlanDemoPage() {
  // Tier selection (1-4)
  const [tier, setTier] = useState<number>(2);
  
  // Preferences
  const [preferences, setPreferences] = useState<WorkoutPlanOptions>({
    equipment: [],
    bodyParts: [],
    duration: 'medium',
    cancerType: 'breast'
  });
  
  // Equipment options
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const equipmentOptions = [
    { id: 'dumbbells', label: 'Dumbbells' },
    { id: 'resistance-bands', label: 'Resistance Bands' },
    { id: 'chair', label: 'Chair' },
    { id: 'yoga-mat', label: 'Yoga Mat' },
    { id: 'stability-ball', label: 'Stability Ball' }
  ];
  
  // Apply preferences
  const handleApplyPreferences = () => {
    setPreferences({
      ...preferences,
      equipment: selectedEquipment
    });
  };
  
  return (
    <div className="container py-8 px-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Personalized Workout Plan Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Tier</CardTitle>
              <CardDescription>Select the exercise intensity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Tier {tier}</span>
                    <span className="text-muted-foreground">
                      {tier === 1 ? 'Very gentle' : 
                       tier === 2 ? 'Moderate' : 
                       tier === 3 ? 'Challenging' : 'Advanced'}
                    </span>
                  </div>
                  <Slider 
                    min={1} 
                    max={4} 
                    step={1} 
                    value={[tier]} 
                    onValueChange={(value) => setTier(value[0])}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cancer-type">Cancer Type</Label>
                  <Select 
                    value={preferences.cancerType || ''} 
                    onValueChange={(value) => 
                      setPreferences({...preferences, cancerType: value})
                    }
                  >
                    <SelectTrigger id="cancer-type" className="mt-1">
                      <SelectValue placeholder="Select cancer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Common Types</SelectLabel>
                        <SelectItem value="breast">Breast Cancer</SelectItem>
                        <SelectItem value="colorectal">Colorectal Cancer</SelectItem>
                        <SelectItem value="prostate">Prostate Cancer</SelectItem>
                        <SelectItem value="lung">Lung Cancer</SelectItem>
                        <SelectItem value="lymphoma">Lymphoma</SelectItem>
                        <SelectItem value="melanoma">Melanoma</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Workout Duration</Label>
                  <Select 
                    value={preferences.duration || 'medium'} 
                    onValueChange={(value: any) => 
                      setPreferences({...preferences, duration: value})
                    }
                  >
                    <SelectTrigger id="duration" className="mt-1">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (15-20 min)</SelectItem>
                      <SelectItem value="medium">Medium (25-35 min)</SelectItem>
                      <SelectItem value="long">Long (40-60 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Equipment</CardTitle>
              <CardDescription>Select what you have access to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipmentOptions.map(option => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={option.id} 
                      checked={selectedEquipment.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEquipment([...selectedEquipment, option.id]);
                        } else {
                          setSelectedEquipment(
                            selectedEquipment.filter(item => item !== option.id)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={option.id} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
                
                <Button 
                  className="mt-4 w-full" 
                  variant="secondary"
                  onClick={handleApplyPreferences}
                >
                  Apply Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="workout">
            <TabsList className="mb-4">
              <TabsTrigger value="workout">Workout Plan</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workout">
              <WorkoutPlanDisplay 
                tier={tier} 
                preferences={preferences} 
                cancerType={preferences.cancerType}
              />
            </TabsContent>
            
            <TabsContent value="weekly">
              <WorkoutPlanDisplay 
                tier={tier} 
                preferences={preferences} 
                cancerType={preferences.cancerType}
                showWeeklySchedule={true}
              />
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">How this works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Exercise tiers are based on your PAR-Q+ results and cancer type</li>
              <li>• Lower tiers focus on gentle movements and gradually build intensity</li>
              <li>• Cancer-specific adaptations are applied automatically</li>
              <li>• All plans follow ACSM guidelines for safety and effectiveness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}