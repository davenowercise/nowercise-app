import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Patients from "@/pages/patients";
import Exercises from "@/pages/exercises";
import Programs from "@/pages/programs";
import Messages from "@/pages/messages";
import PatientDashboard from "@/pages/patient-dashboard";
import Assessment from "@/pages/assessment";
import Recommendations from "@/pages/recommendations";
import Calendar from "@/pages/calendar";
import Tracking from "@/pages/tracking";
import Guidelines from "@/pages/guidelines";
import PatientGuidelines from "@/pages/patient-guidelines";
import Progress from "@/pages/progress";
import ExerciseGuidelinesPage from "./pages/ExerciseGuidelinesPage";
import ClientProgrammePage from "./pages/ClientProgrammePage";
import AIPrescriptionsPage from "./pages/ai-prescriptions";
import Club from "@/pages/club/index";
import GentleSessions from "@/pages/club/gentle-sessions";
import WeeklyMovement from "@/pages/club/weekly-movement";
import SmallWins from "@/pages/club/wins";
import CheckIn from "@/pages/club/check-in";
import CoachRecommendations from "@/pages/coach/recommendations";
import CoachCheckins from "@/pages/coach/checkins";
import CoachAlerts from "@/pages/coach/alerts";
import NotFound from "@/pages/not-found";
import OnboardingPage from "./pages/OnboardingPage";
import EnhancedOnboardingPage from "./pages/enhanced-onboarding";
import ParqDemoPage from "./pages/ParqDemoPage";
import MedicalClearancePage from "./pages/MedicalClearancePage";
import PatientIntakePage from "./pages/patient-intake";
import SpecialistDashboard from "./pages/specialist-dashboard";
import WorkoutPlanDemoPage from "./pages/WorkoutPlanDemoPage";
import DemoLinksPage from "./pages/demo-links";
import WorkoutCalendarPage from "./pages/WorkoutCalendarPage";
import ProgressDashboardPage from "./pages/ProgressDashboardPage";
import EnhancedProgressPage from "./pages/enhanced-progress";
import SymptomTrackerPage from "./pages/SymptomTrackerPage";
import SymptomCalendarPage from "./pages/SymptomCalendarPage";
import DayOne from "./pages/workout-days/DayOne";
import DayTwo from "./pages/workout-days/DayTwo";
import RecoveryDay from "./pages/workout-days/RecoveryDay";
import FullBodyWorkoutPage from "./pages/full-body-workout";
import VideoSyncPage from "./pages/VideoSyncPage";
import FullBodyWorkoutDemo from "./pages/FullBodyWorkoutDemo";
import VideoLibraryManager from "./pages/VideoLibraryManager";
import PathwayOnboarding from "./pages/pathway-onboarding";
import SessionExecution from "./pages/session-execution";
import RestSession from "./pages/rest-session";
import CoachSessions from "./pages/coach-sessions";
import DevPatientLog from "./pages/dev-patient-log";
import DailyCheckinPage from "./pages/checkin";
import TodayPage from "./pages/today";
import SessionCompletePage from "./pages/session-complete";
import VideoTestRoutine from "./pages/video-test-routine";
import WeeklyPlanPage from "./pages/weekly-plan";
import SessionExecutePage from "./pages/session-execute";

import { MainLayout } from "@/components/layout/main-layout";
import { DevRoleToggle } from "@/components/dev-role-toggle";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Show a loading indicator while checking authentication
  if (isLoading) {
    return null;
  }
  
  // If no user is logged in and not in demo mode, show login page for all routes
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/:rest*" component={Login} />
      </Switch>
    );
  }
  
  // Role-based routing
  // Check specifically for specialist role
  const isSpecialist = user?.role === "specialist";
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={isSpecialist ? Dashboard : PatientDashboard} />
        <Route path="/patients" component={isSpecialist ? Patients : NotFound} />
        <Route path="/specialist-dashboard" component={isSpecialist ? SpecialistDashboard : NotFound} />
        <Route path="/exercises" component={isSpecialist ? Exercises : NotFound} />
        <Route path="/programs" component={isSpecialist ? Programs : NotFound} />
        <Route path="/messages" component={Messages} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/patient-guidelines" component={PatientGuidelines} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tracking" component={Tracking} />
        <Route path="/progress" component={Progress} />
        <Route path="/ai-prescriptions" component={AIPrescriptionsPage} />
        {/* Coach Routes - Only available for specialists */}
        <Route path="/coach/recommendations" component={isSpecialist ? CoachRecommendations : NotFound} />
        <Route path="/coach/checkins" component={CoachCheckins} /> {/* Has internal auth check */}
        <Route path="/coach/alerts" component={CoachAlerts} /> {/* Has internal auth check */}
        
        {/* Nowercise Club Routes - Only available for patients */}
        <Route path="/club" component={!isSpecialist ? Club : NotFound} />
        <Route path="/club/gentle-sessions" component={!isSpecialist ? GentleSessions : NotFound} />
        <Route path="/club/weekly-movement" component={!isSpecialist ? WeeklyMovement : NotFound} />
        <Route path="/club/wins" component={!isSpecialist ? SmallWins : NotFound} />
        <Route path="/club/check-in" component={!isSpecialist ? CheckIn : NotFound} />
        
        {/* Demo/Special Routes - Available to anyone */}
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/enhanced-onboarding" component={EnhancedOnboardingPage} />
        <Route path="/patient-intake" component={PatientIntakePage} />
        <Route path="/parq-demo" component={ParqDemoPage} />
        <Route path="/medical-clearance" component={MedicalClearancePage} />
        <Route path="/workout-plan" component={WorkoutPlanDemoPage} />
        <Route path="/workout-calendar" component={WorkoutCalendarPage} />
        <Route path="/progress-dashboard" component={ProgressDashboardPage} />
        <Route path="/enhanced-progress" component={EnhancedProgressPage} />
        <Route path="/symptom-tracker" component={SymptomTrackerPage} />
        <Route path="/symptom-calendar" component={SymptomCalendarPage} />
        <Route path="/exercise-guidelines" component={ExerciseGuidelinesPage} />
        <Route path="/client-programme" component={ClientProgrammePage} />
        <Route path="/workout-days/day-one" component={DayOne} />
        <Route path="/workout-days/day-two" component={DayTwo} />
        <Route path="/workout-days/recovery-day" component={RecoveryDay} />
        <Route path="/full-body-workout" component={FullBodyWorkoutDemo} />
        
        {/* Breast Cancer Pathway Onboarding */}
        <Route path="/pathway-onboarding" component={PathwayOnboarding} />
        <Route path="/session/rest" component={RestSession} />
        <Route path="/session/:templateCode" component={SessionExecution} />

        {/* Admin/Specialist Only Routes */}
        <Route path="/coach-sessions" component={isSpecialist ? CoachSessions : NotFound} />
        <Route path="/video-sync" component={isSpecialist ? VideoSyncPage : NotFound} />
        <Route path="/video-library-manager" component={isSpecialist ? VideoLibraryManager : NotFound} />
        <Route path="/demo-features" component={DemoLinksPage} />
        <Route path="/video-test-routine" component={VideoTestRoutine} />
        <Route path="/dev/patient-log" component={DevPatientLog} />
        <Route path="/checkin" component={DailyCheckinPage} />
        <Route path="/today" component={TodayPage} />
        <Route path="/session-complete" component={SessionCompletePage} />
        <Route path="/weekly-plan" component={WeeklyPlanPage} />
        <Route path="/session/execute" component={SessionExecutePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <DevRoleToggle />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
