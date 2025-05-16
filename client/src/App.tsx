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
import Club from "@/pages/club/index";
import GentleSessions from "@/pages/club/gentle-sessions";
import WeeklyMovement from "@/pages/club/weekly-movement";
import SmallWins from "@/pages/club/wins";
import CheckIn from "@/pages/club/check-in";
import CoachRecommendations from "@/pages/coach/recommendations";
import NotFound from "@/pages/not-found";
import OnboardingPage from "./pages/OnboardingPage";
import ParqDemoPage from "./pages/ParqDemoPage";
import MedicalClearancePage from "./pages/MedicalClearancePage";
import WorkoutPlanDemoPage from "./pages/WorkoutPlanDemoPage";
import DemoLinksPage from "./pages/demo-links";
import { WorkoutCalendarPage } from "./pages/WorkoutCalendarPage";
import DayOne from "./pages/workout-days/DayOne";
import RecoveryDay from "./pages/workout-days/RecoveryDay";

import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isDemoMode = window.location.search.includes('demo=true');
  
  // Show a loading indicator while checking authentication
  if (isLoading) {
    return null;
  }
  
  // If no user is logged in and not in demo mode, show login page for all routes
  if (!isAuthenticated && !isDemoMode) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/:rest*" component={Login} />
      </Switch>
    );
  }
  
  // Role-based routing
  // Default to patient view if no role or role is not specialist
  const isSpecialist = user?.role === "specialist" || isDemoMode;
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={isSpecialist ? Dashboard : PatientDashboard} />
        <Route path="/patients" component={isSpecialist ? Patients : NotFound} />
        <Route path="/exercises" component={Exercises} />
        <Route path="/programs" component={Programs} />
        <Route path="/messages" component={Messages} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/patient-guidelines" component={PatientGuidelines} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tracking" component={Tracking} />
        {/* Coach Routes - Only available for specialists */}
        <Route path="/coach/recommendations" component={isSpecialist ? CoachRecommendations : NotFound} />
        
        {/* Nowercise Club Routes - Only available for patients */}
        <Route path="/club" component={!isSpecialist ? Club : NotFound} />
        <Route path="/club/gentle-sessions" component={!isSpecialist ? GentleSessions : NotFound} />
        <Route path="/club/weekly-movement" component={!isSpecialist ? WeeklyMovement : NotFound} />
        <Route path="/club/wins" component={!isSpecialist ? SmallWins : NotFound} />
        <Route path="/club/check-in" component={!isSpecialist ? CheckIn : NotFound} />
        
        {/* Demo/Special Routes - Available to anyone */}
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/parq-demo" component={ParqDemoPage} />
        <Route path="/medical-clearance" component={MedicalClearancePage} />
        <Route path="/workout-plan" component={WorkoutPlanDemoPage} />
        <Route path="/workout-calendar" component={WorkoutCalendarPage} />
        <Route path="/workout-days/day-one" component={DayOne} />
        <Route path="/workout-days/recovery-day" component={RecoveryDay} />
        <Route path="/demo-features" component={DemoLinksPage} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
