import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Dumbbell, Clock, Target, Award, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutProgress {
  date: string;
  exerciseName: string;
  sets: number;
  totalReps: number;
  maxWeight: number;
  avgWeight: number;
  duration: number;
  notes: string;
}

interface ProgressMetrics {
  totalWorkouts: number;
  totalMinutes: number;
  totalSets: number;
  totalReps: number;
  averageWeight: number;
  maxWeight: number;
  consistencyStreak: number;
  improvementPercentage: number;
}

export default function ProgressPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [selectedExercise, setSelectedExercise] = useState("all");

  // Fetch progress data
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/progress", selectedTimeframe, selectedExercise],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        demo: "true"
      });
      if (selectedExercise !== "all") {
        params.append("exerciseId", selectedExercise);
      }
      const response = await fetch(`/api/progress?${params}`);
      if (!response.ok) throw new Error("Failed to fetch progress data");
      return response.json();
    }
  });

  // Fetch workout history
  const { data: workoutHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/workout-history", selectedTimeframe],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe: selectedTimeframe,
        demo: "true"
      });
      const response = await fetch(`/api/workout-history?${params}`);
      if (!response.ok) throw new Error("Failed to fetch workout history");
      return response.json();
    }
  });

  // Fetch exercise progress
  const { data: exerciseProgress, isLoading: exerciseLoading } = useQuery({
    queryKey: ["/api/exercise-progress"],
    queryFn: async () => {
      const response = await fetch("/api/exercise-progress?demo=true");
      if (!response.ok) throw new Error("Failed to fetch exercise progress");
      return response.json();
    }
  });

  // Fetch available exercises for filter
  const { data: exercises } = useQuery({
    queryKey: ["/api/exercises"],
    queryFn: async () => {
      const response = await fetch("/api/exercises?demo=true");
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    }
  });

  if (progressLoading || historyLoading || exerciseLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Analytics</h1>
          <p className="text-gray-600 mt-1">Track your fitness journey and celebrate your improvements</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Exercises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exercises</SelectItem>
              {exercises?.map((exercise: any) => (
                <SelectItem key={exercise.id} value={exercise.id.toString()}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.totalWorkouts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {progressData?.totalWorkouts ? 'workouts completed' : 'Start tracking workouts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Minutes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.totalMinutes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {progressData?.totalWorkouts ? 
                `Average ${Math.round((progressData.totalMinutes || 0) / progressData.totalWorkouts)} min/workout` :
                'Track your workout time'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{progressData?.consistencyStreak || 0}</div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {progressData?.improvementPercentage ? `+${progressData.improvementPercentage}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              vs. first week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Strength Progress
            </CardTitle>
            <CardDescription>
              Maximum weight lifted over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutHistory && workoutHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workoutHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No workout data available yet. Start logging workouts to see progress charts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Volume Progress
            </CardTitle>
            <CardDescription>
              Total repetitions completed weekly
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workoutHistory && workoutHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalReps" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No workout data available yet. Start logging workouts to see volume trends.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise-Specific Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Exercise Improvements
          </CardTitle>
          <CardDescription>
            Track progress for individual exercises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exerciseProgress && exerciseProgress.length > 0 ? (
              exerciseProgress.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{exercise.exercise}</h4>
                    <p className="text-sm text-gray-600">Current best: {exercise.currentBest}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={`${exercise.improvement > 0 ? 'text-green-600 border-green-200' : 'text-gray-600 border-gray-200'}`}>
                      {exercise.improvement > 0 ? '+' : ''}{exercise.improvement}%
                    </Badge>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium ${exercise.improvement > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {exercise.improvement > 0 ? 'Improved' : 'Stable'}
                      </p>
                      <p className="text-xs text-gray-500">{exercise.lastImprovement}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No exercise progress data available yet. Complete more workouts to see exercise-specific improvements.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workout Duration Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Workout Duration Trends
          </CardTitle>
          <CardDescription>
            How your workout length has changed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workoutHistory && workoutHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workoutHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No duration data available yet. Time your workouts to see duration trends.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Celebrate your milestones and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800">Week Warrior</h4>
                  <p className="text-sm text-yellow-600">7 day streak!</p>
                </div>
              </div>
            </div>
            
            <div className="bg-info-panel border border-info-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-action-blue rounded-full flex items-center justify-center">
                  💪
                </div>
                <div>
                  <h4 className="font-medium text-action-blue">Strength Boost</h4>
                  <p className="text-sm text-accent-blue">+25% improvement</p>
                </div>
              </div>
            </div>
            
            <div className="bg-info-panel border border-info-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-action-blue rounded-full flex items-center justify-center">
                  ⏱️
                </div>
                <div>
                  <h4 className="font-medium text-action-blue">Endurance Master</h4>
                  <p className="text-sm text-accent-blue">38 min workout</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}