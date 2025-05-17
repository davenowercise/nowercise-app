import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronRight, PlusCircle, BarChart, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

// Common cancer treatment symptoms
const symptomOptions = [
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'pain', label: 'Pain' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'vomiting', label: 'Vomiting' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'appetite_loss', label: 'Loss of appetite' },
  { id: 'numbness', label: 'Numbness or tingling' },
  { id: 'mouth_sores', label: 'Mouth sores' },
  { id: 'hair_loss', label: 'Hair loss' },
  { id: 'skin_changes', label: 'Skin changes' },
  { id: 'insomnia', label: 'Sleep difficulties' },
  { id: 'fever', label: 'Fever' },
  { id: 'chills', label: 'Chills' },
  { id: 'swelling', label: 'Swelling' },
  { id: 'shortness_of_breath', label: 'Shortness of breath' },
  { id: 'dizziness', label: 'Dizziness or lightheadedness' },
  { id: 'headache', label: 'Headache' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'depression', label: 'Low mood' },
  { id: 'confusion', label: 'Confusion or brain fog' },
  { id: 'hot_flashes', label: 'Hot flashes' }
];

const SymptomTrackerPage = () => {
  const [location, setLocation] = useLocation();
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [mood, setMood] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>('moderate');
  const [notes, setNotes] = useState<string>('');
  const [exerciseImpact, setExerciseImpact] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood) {
      toast({
        title: "Mood is required",
        description: "Please select how you're feeling today",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would save the data to the user's profile
    toast({
      title: "Symptoms logged",
      description: "Your symptom log has been saved"
    });
    
    // Redirect to calendar view after successful submission
    setLocation('/symptom-calendar');
  };
  
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };
  
  return (
    <div className="p-4 pb-16 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Symptom Tracker</h1>
        
        <Link href="/symptom-calendar">
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar View
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Mood</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                <div 
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                    ${mood === 'great' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setMood('great')}
                >
                  <span className="text-2xl">😊</span>
                  <span className="text-xs mt-1">Great</span>
                </div>
                <div 
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                    ${mood === 'good' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setMood('good')}
                >
                  <span className="text-2xl">🙂</span>
                  <span className="text-xs mt-1">Good</span>
                </div>
                <div 
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                    ${mood === 'okay' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setMood('okay')}
                >
                  <span className="text-2xl">😐</span>
                  <span className="text-xs mt-1">Okay</span>
                </div>
                <div 
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                    ${mood === 'low' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setMood('low')}
                >
                  <span className="text-2xl">😕</span>
                  <span className="text-xs mt-1">Low</span>
                </div>
                <div 
                  className={`flex flex-col items-center cursor-pointer p-2 rounded-lg transition-all 
                    ${mood === 'poor' ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setMood('poor')}
                >
                  <span className="text-2xl">😞</span>
                  <span className="text-xs mt-1">Poor</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Symptoms</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {symptomOptions.map((symptom) => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={symptom.id} 
                      checked={selectedSymptoms.includes(symptom.id)}
                      onCheckedChange={() => toggleSymptom(symptom.id)}
                    />
                    <label
                      htmlFor={symptom.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {symptom.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedSymptoms.length > 0 && (
              <div>
                <Label htmlFor="intensity">Overall Symptom Intensity</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild - Noticeable but not limiting activities</SelectItem>
                    <SelectItem value="moderate">Moderate - Somewhat limiting normal activities</SelectItem>
                    <SelectItem value="severe">Severe - Significantly limiting normal activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="exercise-impact">Exercise Impact</Label>
              <Select value={exerciseImpact} onValueChange={setExerciseImpact}>
                <SelectTrigger>
                  <SelectValue placeholder="How did exercise affect you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improved">Improved my symptoms</SelectItem>
                  <SelectItem value="no_change">No noticeable change in symptoms</SelectItem>
                  <SelectItem value="worsened">Worsened my symptoms</SelectItem>
                  <SelectItem value="not_applicable">Did not exercise today</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about how you're feeling today..."
                className="min-h-[100px]"
              />
            </div>
            
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              Save Symptom Log
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-4 mb-4">
        <Link href="/symptom-calendar">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 mr-3 text-blue-500" />
                <div>
                  <h3 className="font-medium">View Symptom History</h3>
                  <p className="text-sm text-gray-500">Track patterns over time</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
        
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-700 mb-1">Tracking Tip</h3>
                <p className="text-sm text-blue-600">Regular tracking helps your healthcare team understand how treatment is affecting you. Consider sharing your symptom history at your next appointment.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SymptomTrackerPage;