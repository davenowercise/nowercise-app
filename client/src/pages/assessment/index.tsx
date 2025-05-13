import React from 'react';
import { PatientAssessmentForm } from '@/components/assessment/assessment-form';
import { MainLayout } from '@/components/layout/main-layout';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { addDemoParam } from '@/lib/queryClient';

export default function AssessmentPage() {
  const { user, isLoading } = useAuth();
  
  // Check if user has a patient profile
  const { data: patientProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: [addDemoParam('/api/patient/profile')],
    enabled: !!user,
  });
  
  if (isLoading || isLoadingProfile) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto mt-8">
          <Alert>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to complete an assessment. Please log in or sign up to continue.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <a href="/api/login">Log In</a>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        
        <PatientAssessmentForm />
      </div>
    </MainLayout>
  );
}