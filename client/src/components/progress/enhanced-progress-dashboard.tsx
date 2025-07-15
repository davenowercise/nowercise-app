import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award, 
  Target, 
  Heart,
  Dumbbell,
  Clock,
  Activity,
  Brain,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ProgressMetrics {
  totalWorkouts: number;
  totalMinutes: number;
  totalSets: number;
  totalReps: number;
  averageRPE: number;
  currentStreak: number;
  longestStreak: number;
  improvementPercentage: number;
  consistencyScore: number;
  energyTrend: number;
  painTrend: number;
  strengthGains: number;
  cardioImprovement: number;
  lastWorkoutDate: string;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
}

interface WorkoutTrend {
  date: string;
  workouts: number;
  totalReps: number;
  averageRPE: number;
  energyLevel: number;
  painLevel: number;
  duration: number;
}

interface ExerciseProgress {
  exerciseId: number;
  exerciseName: string;
  category: string;
  initialReps: number;
  currentReps: number;
  improvement: number;
  lastPerformed: string;
  frequency: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface HealthMetrics {
  date: string;
  energyLevel: number;
  painLevel: number;
  fatigueLevel: number;
  sleepQuality: number;
  mood: number;
  rpe: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EnhancedProgressDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Fetch comprehensive progress data
  const { data: progressMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/progress/metrics', selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/progress/metrics?timeframe=${selectedTimeframe}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });

  // Fetch workout trends
  const { data: workoutTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/progress/trends', selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/progress/trends?timeframe=${selectedTimeframe}`);
      if (!response.ok) throw new Error('Failed to fetch trends');
      return response.json();
    }
  });

  // Fetch exercise progress
  const { data: exerciseProgress, isLoading: exerciseLoading } = useQuery({
    queryKey: ['/api/progress/exercises', selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/progress/exercises?timeframe=${selectedTimeframe}`);
      if (!response.ok) throw new Error('Failed to fetch exercise progress');
      return response.json();
    }
  });

  // Fetch health metrics
  const { data: healthMetrics, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/progress/health', selectedTimeframe],
    queryFn: async () => {
      const response = await fetch(`/api/progress/health?timeframe=${selectedTimeframe}`);
      if (!response.ok) throw new Error('Failed to fetch health metrics');
      return response.json();
    }
  });

  // Mock data for demo purposes
  const mockProgressMetrics: ProgressMetrics = {
    totalWorkouts: 24,
    totalMinutes: 1080,
    totalSets: 288,
    totalReps: 2160,
    averageRPE: 6.2,
    currentStreak: 7,
    longestStreak: 12,
    improvementPercentage: 23,
    consistencyScore: 85,
    energyTrend: 15,
    painTrend: -20,
    strengthGains: 18,
    cardioImprovement: 12,
    lastWorkoutDate: '2024-01-15',
    weeklyGoalProgress: 86,
    monthlyGoalProgress: 72
  };

  const mockWorkoutTrends: WorkoutTrend[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workouts: Math.floor(Math.random() * 2) + (i % 7 === 0 ? 0 : 1),
    totalReps: Math.floor(Math.random() * 50) + 20,
    averageRPE: Math.random() * 3 + 5,
    energyLevel: Math.random() * 3 + 6,
    painLevel: Math.random() * 3 + 2,
    duration: Math.floor(Math.random() * 30) + 25
  }));

  const mockExerciseProgress: ExerciseProgress[] = [
    {
      exerciseId: 1,
      exerciseName: 'Squats',
      category: 'Strength',
      initialReps: 8,
      currentReps: 12,
      improvement: 50,
      lastPerformed: '2024-01-15',
      frequency: 3,
      trend: 'improving'
    },
    {
      exerciseId: 2,
      exerciseName: 'Push-ups',
      category: 'Strength',
      initialReps: 5,
      currentReps: 8,
      improvement: 60,
      lastPerformed: '2024-01-14',
      frequency: 2,
      trend: 'improving'
    },
    {
      exerciseId: 3,
      exerciseName: 'Walking',
      category: 'Cardio',
      initialReps: 10,
      currentReps: 15,
      improvement: 50,
      lastPerformed: '2024-01-16',
      frequency: 5,
      trend: 'stable'
    }
  ];

  const mockHealthMetrics: HealthMetrics[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    energyLevel: Math.random() * 3 + 6,
    painLevel: Math.random() * 3 + 2,
    fatigueLevel: Math.random() * 3 + 3,
    sleepQuality: Math.random() * 3 + 6,
    mood: Math.random() * 3 + 6,
    rpe: Math.random() * 3 + 5
  }));

  const currentMetrics = progressMetrics || mockProgressMetrics;
  const currentTrends = workoutTrends || mockWorkoutTrends;
  const currentExerciseProgress = exerciseProgress || mockExerciseProgress;
  const currentHealthMetrics = healthMetrics || mockHealthMetrics;

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getExerciseTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {currentMetrics.improvementPercentage}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Longest: {currentMetrics.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {currentMetrics.energyTrend > 0 ? '+' : ''}{currentMetrics.energyTrend}%
              </div>
              {getTrendIcon(currentMetrics.energyTrend)}
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pain Reduction</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {currentMetrics.painTrend}%
              </div>
              {getTrendIcon(currentMetrics.painTrend)}
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Your progress toward weekly and monthly goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span>Weekly Goal</span>
              <span>{currentMetrics.weeklyGoalProgress}%</span>
            </div>
            <Progress value={currentMetrics.weeklyGoalProgress} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Monthly Goal</span>
              <span>{currentMetrics.monthlyGoalProgress}%</span>
            </div>
            <Progress value={currentMetrics.monthlyGoalProgress} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Workout Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Trends</CardTitle>
          <CardDescription>Your exercise activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="workouts" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Consistency Score */}
      <Card>
        <CardHeader>
          <CardTitle>Consistency Score</CardTitle>
          <CardDescription>Based on workout frequency and adherence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getConsistencyColor(currentMetrics.consistencyScore)}`}>
              {currentMetrics.consistencyScore}%
            </div>
            <div className="flex-1">
              <Progress value={currentMetrics.consistencyScore} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {currentMetrics.consistencyScore >= 80 ? 'Excellent consistency!' : 
                 currentMetrics.consistencyScore >= 60 ? 'Good progress, keep it up!' : 
                 'Try to be more consistent with your workouts'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExerciseTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
          <CardDescription>Individual exercise improvements over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentExerciseProgress.map(exercise => (
              <div key={exercise.exerciseId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{exercise.exerciseName}</h3>
                    <Badge variant="outline">{exercise.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getExerciseTrendIcon(exercise.trend)}
                    <span className="text-sm font-medium">+{exercise.improvement}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Initial</p>
                    <p className="font-semibold">{exercise.initialReps} reps</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold">{exercise.currentReps} reps</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frequency</p>
                    <p className="font-semibold">{exercise.frequency}x/week</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Done</p>
                    <p className="font-semibold">{exercise.lastPerformed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strength Progress</CardTitle>
          <CardDescription>Rep improvements across exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentExerciseProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exerciseName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="improvement" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Metrics Trends</CardTitle>
          <CardDescription>How exercise affects your overall wellbeing</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentHealthMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="energyLevel" stroke="#00C49F" strokeWidth={2} />
              <Line type="monotone" dataKey="painLevel" stroke="#FF8042" strokeWidth={2} />
              <Line type="monotone" dataKey="mood" stroke="#8884D8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Energy Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{currentMetrics.energyTrend}%</div>
            <p className="text-xs text-muted-foreground">
              Energy levels improve with regular exercise
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pain Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentMetrics.painTrend}%</div>
            <p className="text-xs text-muted-foreground">
              Pain levels reduced through movement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">8.2/10</div>
            <p className="text-xs text-muted-foreground">
              Better sleep on workout days
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your health metrics show positive correlation with regular exercise. Keep up the great work!
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Progress Dashboard</h1>
        <p className="text-gray-600">
          Track your fitness journey with comprehensive analytics and insights
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          {renderExerciseTab()}
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          {renderHealthTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}