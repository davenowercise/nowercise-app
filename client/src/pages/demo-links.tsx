import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, Activity, ClipboardCheck } from 'lucide-react';

export default function DemoLinksPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Nowercise Demo Features</h1>
      <p className="text-muted-foreground mb-8">
        Access the new features being developed for Nowercise
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Workout Plan Demo
            </CardTitle>
            <CardDescription>
              Try out the personalized workout plan generator with cancer-specific adaptations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate exercise plans tailored to your cancer type, treatment phase, and preferences.
            </p>
            <Link href="/workout-plan">
              <Button className="w-full">
                Open Workout Planner
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              PAR-Q+ Screening
            </CardTitle>
            <CardDescription>
              Complete the Physical Activity Readiness Questionnaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Screen for potential exercise contraindications and receive personalized safety recommendations.
            </p>
            <Link href="/parq-demo">
              <Button className="w-full">
                Take PAR-Q+ Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Medical Clearance Info
            </CardTitle>
            <CardDescription>
              Learn about the medical clearance process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Information about when and how to get medical clearance for exercise.
            </p>
            <Link href="/medical-clearance">
              <Button className="w-full" variant="outline">
                Medical Clearance Guide
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}