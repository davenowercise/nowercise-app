import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Icons
import { 
  LineChart, 
  Camera, 
  Plus, 
  Ruler, 
  Weight, 
  Heart, 
  Target,
  Trophy,
  TrendingUp,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

interface MeasurementData {
  id: number;
  date: Date;
  type: 'weight' | 'bodyFat' | 'chest' | 'waist' | 'hips' | 'arms' | 'thighs';
  value: number;
  unit: string;
}

interface ProgressPhoto {
  id: number;
  date: Date;
  url: string;
  type: 'front' | 'side' | 'back';
}

interface Goal {
  id: number;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  completed: boolean;
}

interface Habit {
  id: number;
  title: string;
  frequency: string;
  streak: number;
  lastCompleted?: Date;
}

const TrackingPage: React.FC = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('measurements');

  // Fetch measurements
  const { data: measurements, isLoading: measurementsLoading } = useQuery({
    queryKey: ['/api/measurements'],
    enabled: isAuthenticated,
  });

  // Fetch progress photos
  const { data: progressPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ['/api/progress-photos'],
    enabled: isAuthenticated,
  });

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/goals'],
    enabled: isAuthenticated,
  });

  // Fetch habits
  const { data: habits, isLoading: habitsLoading } = useQuery({
    queryKey: ['/api/habits'],
    enabled: isAuthenticated,
  });

  // Function to add new measurement
  const handleAddMeasurement = () => {
    toast({
      title: 'Coming Soon',
      description: 'Measurement tracking will be available soon.',
    });
  };

  // Function to add new progress photo
  const handleAddPhoto = () => {
    toast({
      title: 'Coming Soon',
      description: 'Photo upload will be available soon.',
    });
  };

  // Function to add new goal
  const handleAddGoal = () => {
    toast({
      title: 'Coming Soon',
      description: 'Goal tracking will be available soon.',
    });
  };

  // Function to add new habit
  const handleAddHabit = () => {
    toast({
      title: 'Coming Soon',
      description: 'Habit tracking will be available soon.',
    });
  };

  // Function to log habit
  const handleLogHabit = (habitId: number) => {
    toast({
      title: 'Habit Logged',
      description: 'Your progress has been updated.',
    });
  };

  // Function to update goal progress
  const handleUpdateGoal = (goalId: number) => {
    toast({
      title: 'Goal Updated',
      description: 'Your progress has been updated.',
    });
  };

  // Render measurements tab
  const renderMeasurementsTab = () => {
    const measurementTypes = [
      { id: 'weight', label: 'Weight', icon: <Weight className="h-4 w-4" /> },
      { id: 'bodyFat', label: 'Body Fat %', icon: <LineChart className="h-4 w-4" /> },
      { id: 'chest', label: 'Chest', icon: <Ruler className="h-4 w-4" /> },
      { id: 'waist', label: 'Waist', icon: <Ruler className="h-4 w-4" /> },
      { id: 'hips', label: 'Hips', icon: <Ruler className="h-4 w-4" /> },
      { id: 'arms', label: 'Arms', icon: <Ruler className="h-4 w-4" /> },
      { id: 'thighs', label: 'Thighs', icon: <Ruler className="h-4 w-4" /> }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Body Measurements</h3>
          <Button onClick={handleAddMeasurement} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Measurement
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {measurementTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-full">
                    {type.icon}
                  </div>
                  <CardTitle className="text-base">{type.label}</CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-2xl font-bold">
                  {/* Placeholder values */}
                  {type.id === 'weight' ? '165 lbs' : 
                   type.id === 'bodyFat' ? '18%' : 
                   '36 in'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {type.id === 'weight' ? 'Down 2 lbs from last week' : 
                   type.id === 'bodyFat' ? 'Down 0.5% from last month' : 
                   'No change since last measurement'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render progress photos tab
  const renderPhotosTab = () => {
    const photoTypes = [
      { id: 'front', label: 'Front View' },
      { id: 'side', label: 'Side View' },
      { id: 'back', label: 'Back View' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Progress Photos</h3>
          <Button onClick={handleAddPhoto} size="sm">
            <Camera className="h-4 w-4 mr-1" /> Add Photo
          </Button>
        </div>

        <div className="space-y-6">
          {photoTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">{type.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  {/* Placeholder for photos */}
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-muted rounded-md flex items-center justify-center"
                    >
                      <Camera className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render goals tab
  const renderGoalsTab = () => {
    // Example goals
    const demoGoals = [
      { 
        id: 1, 
        title: 'Walk 10,000 steps daily', 
        target: 10000, 
        current: 7500, 
        unit: 'steps',
        deadline: new Date(2023, 5, 30),
        completed: false
      },
      { 
        id: 2, 
        title: 'Exercise 3 times per week', 
        target: 3, 
        current: 2, 
        unit: 'sessions',
        deadline: undefined,
        completed: false
      },
      { 
        id: 3, 
        title: 'Drink 8 glasses of water daily', 
        target: 8, 
        current: 8, 
        unit: 'glasses',
        deadline: undefined,
        completed: true
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Goals</h3>
          <Button onClick={handleAddGoal} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Goal
          </Button>
        </div>

        <div className="space-y-4">
          {demoGoals.map((goal) => (
            <Card key={goal.id} className={`overflow-hidden ${goal.completed ? 'bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-full ${goal.completed ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                        {goal.completed ? 
                          <Trophy className="h-4 w-4 text-green-500" /> : 
                          <Target className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground">
                            By {format(new Date(goal.deadline), 'PPP')}
                          </p>
                        )}
                      </div>
                    </div>
                    {!goal.completed && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUpdateGoal(goal.id)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                  
                  {!goal.completed && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{goal.current} {goal.unit}</span>
                        <span>{goal.target} {goal.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(goal.current / goal.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render habits tab
  const renderHabitsTab = () => {
    // Example habits
    const demoHabits = [
      { id: 1, title: 'Morning stretching', frequency: 'Daily', streak: 5, lastCompleted: new Date() },
      { id: 2, title: 'Take medication', frequency: 'Daily', streak: 12, lastCompleted: new Date() },
      { id: 3, title: 'Meditation', frequency: '3 times per week', streak: 2, lastCompleted: new Date(Date.now() - 86400000 * 2) },
    ];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Habits</h3>
          <Button onClick={handleAddHabit} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Habit
          </Button>
        </div>

        <div className="space-y-4">
          {demoHabits.map((habit) => (
            <Card key={habit.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-10 w-10 rounded-full p-0"
                      onClick={() => handleLogHabit(habit.id)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <div>
                      <h4 className="font-medium">{habit.title}</h4>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <span>{habit.frequency}</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>{habit.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {habit.lastCompleted && habit.lastCompleted.toDateString() === new Date().toDateString() ? (
                      <span className="text-green-500 font-medium">Completed today</span>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLogHabit(habit.id)}
                      >
                        Log
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6 lg:py-10 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Monitor your progress, track measurements, and build healthy habits
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>

          <TabsContent value="measurements" className="space-y-6 mt-0">
            {renderMeasurementsTab()}
          </TabsContent>

          <TabsContent value="photos" className="space-y-6 mt-0">
            {renderPhotosTab()}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-0">
            {renderGoalsTab()}
          </TabsContent>

          <TabsContent value="habits" className="space-y-6 mt-0">
            {renderHabitsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrackingPage;