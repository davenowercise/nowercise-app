import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Award, ChevronRight, Clock, AlertTriangle, Dumbbell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramAssignment, Program, WorkoutLog, SessionAppointment, SmallWin } from "@/lib/types";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [today] = useState(new Date());

  // Fetch patient's program assignments
  const { data: programAssignments, isLoading: programsLoading } = useQuery<(ProgramAssignment & { program: Program })[]>({
    queryKey: ["/api/patient/programs"],
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<SessionAppointment[]>({
    queryKey: ["/api/patient/sessions"],
  });

  // Fetch workout logs
  const { data: workoutLogs, isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs"],
  });

  // Fetch small wins
  const { data: smallWins, isLoading: winsLoading } = useQuery<SmallWin[]>({
    queryKey: ["/api/small-wins"],
  });

  // Get today's session if any
  const todayDateStr = format(today, "yyyy-MM-dd");
  const todaySession = upcomingSessions?.find(session => session.date === todayDateStr);

  return (
    <>
      {/* Warm, encouraging welcome section */}
      <div className="mb-8 text-center">
        <div className="card-comfort p-8 mb-6">
          <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName || "Champion"}! 🌟
          </h1>
          <p className="text-xl text-gray-600 mb-4">Every step you take is a victory</p>
          <p className="text-lg text-gray-500">{format(today, "EEEE, MMMM d, yyyy")}</p>
          
          {/* Quick encouragement based on activity */}
          <div className="mt-4 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl inline-block">
            <p className="text-green-700 font-medium">✨ You're doing amazing - small wins matter!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Activity Card */}
          <DashboardCard 
            title="Today's Activity"
            headerAction={
              todaySession && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {todaySession.time}
                </Badge>
              )
            }
          >
            {sessionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ) : todaySession ? (
              <div>
                <div className="encouragement-card p-6 rounded-2xl mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-green-800">Today's Session Ready!</h3>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-light/30 p-2 rounded-full mr-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{todaySession.type.replace("_", " ")}</h3>
                      <p className="text-gray-600 mt-1">
                        Scheduled for {todaySession.time} ({todaySession.duration} minutes)
                      </p>
                      {todaySession.notes && (
                        <p className="text-gray-600 mt-2 text-sm">{todaySession.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Button className="btn-gentle bg-green-600 hover:bg-green-700 text-white px-8 py-4">
                    🚀 Let's Do This Together!
                  </Button>
                </div>
              </div>
            ) : workoutLogs && workoutLogs.length > 0 && workoutLogs[0].date === todayDateStr ? (
              <div>
                <div className="progress-card p-6 rounded-2xl mb-4 celebrate">
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-green-800 mb-2">🎉 Amazing Work Today!</h3>
                      <p className="text-green-700 text-lg mb-2">
                        You've completed your workout - that's a huge victory!
                      </p>
                      <div className="bg-white/50 p-3 rounded-lg mb-3">
                        <p className="text-green-600 font-medium">💪 Strength gained, one rep at a time</p>
                      </div>
                      {workoutLogs[0].notes && (
                        <div className="bg-white/30 p-3 rounded-lg">
                          <p className="text-green-700 text-sm">📝 Your notes: {workoutLogs[0].notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    📊 View Your Progress
                  </Button>
                  <Button variant="outline" className="flex-1">
                    🌟 Share Your Win
                  </Button>
                </div>
              </div>
            ) : programAssignments && programAssignments.length > 0 ? (
              <div>
                <div className="bg-accent-light/10 p-4 rounded-lg mb-4">
                  <div className="flex items-start">
                    <div className="bg-accent-light/30 p-2 rounded-full mr-4">
                      <Dumbbell className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Your Workout for Today</h3>
                      <p className="text-gray-600 mt-1">
                        {programAssignments[0].program.name} - Day {Math.floor(Math.random() * 7) + 1}
                      </p>
                      <p className="text-gray-600 mt-2 text-sm">
                        This workout includes gentle stretching and light resistance exercises.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    Start Workout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="card-comfort p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Dumbbell className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Today is Your Rest Day</h3>
                  <p className="text-gray-600 mb-4">Rest is just as important as exercise in your recovery journey</p>
                  <div className="text-sm text-gray-500 mb-6 italic">
                    "Healing happens in the quiet moments" ✨
                  </div>
                  <div className="space-y-3">
                    <Button className="btn-gentle w-full" variant="outline">
                      🧘‍♀️ Explore Gentle Movement
                    </Button>
                    <Button className="btn-gentle w-full" variant="ghost">
                      📞 Connect with Your Care Team
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Current Program Card */}
          <DashboardCard 
            title="My Current Program"
            headerAction={programAssignments && programAssignments.length > 0 && (
              <Badge className="bg-primary-light/20 text-primary">
                Active
              </Badge>
            )}
          >
            {programsLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full rounded-full mt-4" />
                <div className="flex justify-end mt-4">
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ) : programAssignments && programAssignments.length > 0 ? (
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-lg">{programAssignments[0].program.name}</h3>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {programAssignments[0].program.duration} weeks
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {programAssignments[0].program.description || 
                    "A customized exercise program designed for your specific needs and energy level."}
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Week 2 of {programAssignments[0].program.duration}</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    View Program Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-3 opacity-70" />
                <h3 className="text-lg font-medium mb-2">No active program</h3>
                <p className="text-gray-500 mb-3">
                  You don't have any active exercise programs assigned yet. Complete the assessment to get personalized recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="default" asChild>
                    <a href="/assessment">Complete Assessment</a>
                  </Button>
                  <Button variant="outline">
                    Contact Your Specialist
                  </Button>
                </div>
              </div>
            )}
          </DashboardCard>

          {/* Recent Workout Logs */}
          <DashboardCard title="Recent Workout Logs">
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center p-3 border border-gray-200 rounded-md">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            ) : workoutLogs && workoutLogs.length > 0 ? (
              <div className="space-y-3">
                {workoutLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                      log.completed 
                        ? "bg-success-light/20 text-success" 
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {log.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {format(new Date(log.date), "MMMM d, yyyy")}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {log.completed 
                          ? `Completed workout with ${log.fatigueLevel ? `fatigue level ${log.fatigueLevel}` : "effort"}` 
                          : "Missed workout"}
                        {log.notes && ` - ${log.notes}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Button variant="link" className="text-primary">
                    View All Logs
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No workout logs found</p>
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          {/* My Small Wins Card */}
          <DashboardCard 
            title="My Small Wins"
            headerAction={
              <div className="flex items-center">
                <Award className="text-accent mr-2 h-5 w-5" />
              </div>
            }
          >
            {winsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-3 w-full rounded-full mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Skeleton className="h-20 rounded" />
                  <Skeleton className="h-20 rounded" />
                </div>
                <Skeleton className="h-9 w-full" />
              </div>
            ) : smallWins && smallWins.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">Total small wins</p>
                  <p className="text-xl font-bold text-accent">{smallWins.length}</p>
                </div>
                
                <div className="bg-gray-100 rounded-full h-3 mb-4">
                  <div 
                    className="bg-accent h-3 rounded-full" 
                    style={{ width: `${Math.min(smallWins.length * 5, 100)}%` }}
                  ></div>
                </div>
                
                <div className="space-y-3 mb-4">
                  {smallWins.slice(0, 3).map((win) => (
                    <div key={win.id} className="bg-accent-light/10 rounded p-3">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-accent mr-2" />
                        <p className="text-sm font-medium text-gray-800">{win.description}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(win.createdAt), "MMMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  View All Wins
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-3 opacity-70" />
                <h3 className="font-medium mb-2">No small wins yet</h3>
                <p className="text-gray-500 mb-4 text-sm">
                  Complete your workouts to start earning small wins!
                </p>
                <Button variant="outline" className="w-full">
                  Track Your First Win
                </Button>
              </div>
            )}
          </DashboardCard>

          {/* Upcoming Sessions */}
          <DashboardCard title="Upcoming Sessions">
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Skeleton className="w-8 h-8 rounded-full mr-2" />
                        <div>
                          <Skeleton className="h-5 w-28 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 rounded-full mr-1" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                          <AvatarFallback className="bg-primary-light text-white">
                            SP
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-800">
                            {session.type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(session.date), "MMM d")} at {session.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="link" className="w-full text-primary">
                  View All Sessions
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No upcoming sessions scheduled</p>
              </div>
            )}
          </DashboardCard>

          {/* Energy & Symptom Tracker */}
          <DashboardCard title="Energy & Symptom Tracker">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Track your energy levels and symptoms to help your specialist adapt your program.
              </p>
              
              <div className="space-y-4 mb-4">
                <div>
                  <Label className="text-sm font-medium mb-1 block">Energy Level Today</Label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button 
                        key={level}
                        variant="outline"
                        className={`flex-1 h-10 ${level === 2 ? 'bg-primary text-white' : ''}`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Level 2 - Low Energy
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Pain Level</Label>
                  <div className="bg-gray-100 rounded-full h-4 mb-1">
                    <div 
                      className="bg-warning h-4 rounded-full" 
                      style={{ width: `30%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Moderate (3/10)
                  </p>
                </div>
              </div>
              
              <Button className="w-full">
                Update Today's Status
              </Button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}

// Helper Label component
function Label(props: React.HTMLAttributes<HTMLLabelElement>) {
  return <label {...props} />;
}
