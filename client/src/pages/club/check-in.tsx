import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Sparkles,
  CheckCircle,
  Clock,
  BatteryMedium,
  Moon,
  Sun,
  Calendar,
  ThumbsUp,
  BarChart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema for check-in
const checkInSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  moodLevel: z.number().min(1).max(10),
  sleepQuality: z.number().min(1).max(10),
  painLevel: z.number().min(0).max(10),
  movementConfidence: z.number().min(1).max(10),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  notes: z.string().max(500, {
    message: "Notes must be 500 characters or less"
  }).optional(),
  symptoms: z.array(z.string()).optional(),
});

type CheckInFormValues = z.infer<typeof checkInSchema>;

export default function CheckIn() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = React.useState(false);
  const [lastCheckIn, setLastCheckIn] = React.useState<Date | null>(null);

  // Initial default values
  const defaultValues: Partial<CheckInFormValues> = {
    energyLevel: 5,
    moodLevel: 5,
    sleepQuality: 5,
    painLevel: 0,
    movementConfidence: 5,
    timeOfDay: 'morning',
    notes: '',
    symptoms: [],
  };

  // Initialize form with schema validation
  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues,
  });

  // Common symptoms for cancer patients
  const commonSymptoms = [
    'Fatigue',
    'Nausea',
    'Pain',
    'Numbness',
    'Shortness of breath',
    'Swelling',
    'Anxiety',
    'Loss of appetite',
    'Headache',
    'Dizziness',
    'Hot flashes'
  ];

  // Handle form submission
  function onSubmit(values: CheckInFormValues) {
    console.log('Check-in data:', values);
    
    // Show success message
    setSubmitted(true);
    
    // Update last check-in time
    setLastCheckIn(new Date());
    
    // In a real app, we'd save this data to the database
  }

  // Get time of day automatically
  React.useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
    
    if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon';
    } else if (hour >= 18) {
      timeOfDay = 'evening';
    }
    
    form.setValue('timeOfDay', timeOfDay);
  }, [form]);

  // Get icon for time of day
  const getTimeIcon = (time: string) => {
    switch(time) {
      case 'morning': return <Sun className="h-5 w-5 text-amber-500" />;
      case 'afternoon': return <Sun className="h-5 w-5 text-orange-500" />;
      case 'evening': return <Moon className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Welcome Club Banner */}
      <div className="bg-orange-50 text-orange-800 text-sm px-4 py-3 rounded-lg border border-orange-100 flex items-center mb-4">
        <span className="bg-orange-100 p-1 rounded-full mr-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
        </span>
        <span className="font-medium">Nowercise Club — exclusive member space for guided recovery</span>
      </div>
      
      {/* Navigation Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/club">
            <ArrowLeft size={16} className="mr-1" /> Back to Club
          </Link>
        </Button>
      </div>
        
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <CheckCircle className="mr-2 h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-orange-600">Daily Check-In</h1>
        </div>
        <p className="text-sm italic text-slate-500 mb-2">
          Included with your Nowercise membership – track how you're feeling to personalize your experience.
        </p>
        <p className="text-slate-600 mb-4">
          Your daily check-in helps us provide recommendations tailored to your energy levels and symptoms. This only takes a minute and helps you monitor patterns over time.
        </p>
      </div>

      {lastCheckIn && !submitted && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700">You've already checked in today</p>
              <p className="text-sm text-blue-600">
                Last check-in: {lastCheckIn.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                You can update your check-in if your energy levels or symptoms have changed.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitted ? (
        <Card className="border-[#D6E3EE] bg-[#EDF3F8]">
          <CardHeader>
            <CardTitle className="text-[#4E6F99] flex items-center">
              <ThumbsUp className="mr-2 h-5 w-5 text-green-600" />
              Check-in Recorded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#5F7FA8]">
              Your check-in has been recorded. This information will help personalize your Nowercise experience.
            </p>
            
            <div className="mt-4 p-3 bg-white rounded-lg border border-[#D6E3EE]">
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                <BarChart className="h-4 w-4 mr-1 text-primary" />
                Weekly Patterns
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Track how your energy, mood, and symptoms change over time to identify patterns.
              </p>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({length: 7}).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6-i));
                  return (
                    <div key={i} className="text-center">
                      <div className="text-xs text-slate-500">{date.toLocaleDateString('en-US', {weekday: 'short'})}</div>
                      <div className={`text-xs ${i === 6 ? 'font-medium text-[#4E6F99]' : 'text-slate-400'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <span className="w-16 text-slate-500">Energy</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="flex">
                      {[4, 3, 5, 4, 6, 3, 5].map((v, i) => (
                        <div 
                          key={i} 
                          className={`h-2 flex-1 ${i === 6 ? 'bg-[#4E6F99]' : 'bg-[#D6E3EE]'}`} 
                          style={{opacity: v/10}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-xs">
                  <span className="w-16 text-slate-500">Mood</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="flex">
                      {[5, 4, 6, 5, 7, 5, 5].map((v, i) => (
                        <div 
                          key={i} 
                          className={`h-2 flex-1 ${i === 6 ? 'bg-[#4E6F99]' : 'bg-[#D6E3EE]'}`} 
                          style={{opacity: v/10}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-xs">
                  <span className="w-16 text-slate-500">Sleep</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="flex">
                      {[6, 4, 5, 6, 7, 4, form.watch('sleepQuality')].map((v, i) => (
                        <div 
                          key={i} 
                          className={`h-2 flex-1 ${i === 6 ? 'bg-[#4E6F99]' : 'bg-[#D6E3EE]'}`} 
                          style={{opacity: v/10}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
                View Full Health Tracking Report
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#D6E3EE] pt-4">
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Update Check-in
            </Button>
            <Button asChild>
              <Link href="/club">
                Return to Club
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getTimeIcon(form.watch('timeOfDay'))}
              <span className="ml-2">
                {form.watch('timeOfDay') === 'morning' && 'Morning Check-in'}
                {form.watch('timeOfDay') === 'afternoon' && 'Afternoon Check-in'}
                {form.watch('timeOfDay') === 'evening' && 'Evening Check-in'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Time of Day */}
                <FormField
                  control={form.control}
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Time of Day</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="morning" id="morning" />
                            <Label htmlFor="morning" className="flex items-center">
                              <Sun className="h-4 w-4 mr-1 text-amber-500" />
                              Morning
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="afternoon" id="afternoon" />
                            <Label htmlFor="afternoon" className="flex items-center">
                              <Sun className="h-4 w-4 mr-1 text-orange-500" />
                              Afternoon
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="evening" id="evening" />
                            <Label htmlFor="evening" className="flex items-center">
                              <Moon className="h-4 w-4 mr-1 text-blue-500" />
                              Evening
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Energy Level Slider */}
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy Level (1-10)</FormLabel>
                      <div className="flex items-center gap-4">
                        <BatteryMedium className="h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="w-8 text-center font-medium">{field.value}</span>
                      </div>
                      <FormDescription>
                        How is your energy level today? (1 = Very low, 10 = Excellent)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mood Level Slider */}
                <FormField
                  control={form.control}
                  name="moodLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood (1-10)</FormLabel>
                      <div className="flex items-center gap-4">
                        <BarChart className="h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="w-8 text-center font-medium">{field.value}</span>
                      </div>
                      <FormDescription>
                        How would you rate your mood today? (1 = Very low, 10 = Excellent)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sleep Quality Slider */}
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How restful was your sleep last night?</FormLabel>
                      <div className="flex items-center gap-4">
                        <Moon className="h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="w-8 text-center font-medium">{field.value}</span>
                      </div>
                      <FormDescription>
                        (1 = Very poor/disrupted, 10 = Deeply restful)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pain Level Slider */}
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain Level (0-10)</FormLabel>
                      <div className="flex items-center gap-4">
                        <BarChart className="h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="w-8 text-center font-medium">{field.value}</span>
                      </div>
                      <FormDescription>
                        How would you rate your pain today? (0 = No pain, 10 = Worst pain)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Movement Confidence Slider */}
                <FormField
                  control={form.control}
                  name="movementConfidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement Confidence (1-10)</FormLabel>
                      <div className="flex items-center gap-4">
                        <Activity className="h-5 w-5 text-slate-400" />
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                            className="flex-1"
                          />
                        </FormControl>
                        <span className="w-8 text-center font-medium">{field.value}</span>
                      </div>
                      <FormDescription>
                        How confident did you feel moving today? (1 = Very hesitant, 10 = Very confident)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Symptoms Checklist */}
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={() => (
                    <FormItem>
                      <FormLabel>Symptoms (select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {commonSymptoms.map((symptom) => (
                          <div key={symptom} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={symptom}
                              value={symptom}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                              onChange={(e) => {
                                const currentSymptoms = form.getValues('symptoms') || [];
                                if (e.target.checked) {
                                  form.setValue('symptoms', [...currentSymptoms, symptom]);
                                } else {
                                  form.setValue(
                                    'symptoms',
                                    currentSymptoms.filter((s) => s !== symptom)
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={symptom} className="text-sm">
                              {symptom}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormDescription>
                        This helps us track symptom patterns and provide appropriate recommendations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes Textarea */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anything else you'd like to share about how you're feeling today?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This information is only visible to you and your healthcare provider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Submit Check-in
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 text-xs text-slate-500 text-center">
        <p>
          Your check-in data is private and only visible to you and your healthcare providers. 
          This information helps personalize your Nowercise experience.
        </p>
      </div>
    </div>
  );
}