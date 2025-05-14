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
import NotFound from "@/pages/not-found";

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
        <Route path="/calendar" component={Calendar} />
        <Route path="/tracking" component={Tracking} />
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
