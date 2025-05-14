import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, BookOpen, Info, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GuidelineSection {
  id: string;
  title: string;
  lastUpdated: string;
  content: string;
}

export default function PatientGuidelinesPage() {
  // Guidelines data
  const guidelineSections: GuidelineSection[] = [
    {
      id: 'movement-after-cancer',
      title: 'Movement After Cancer',
      lastUpdated: 'May 1, 2025',
      content: `
        <p class="mb-3">Moving your body after cancer treatment is an important part of recovery. Here are some key points to remember:</p>
        
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Start slow and build up gradually</li>
          <li>Listen to your body - rest when you need to</li>
          <li>Gentle walking is often a good starting point</li>
          <li>Aim for small, consistent movement rather than intense sessions</li>
          <li>Celebrate every achievement, no matter how small</li>
        </ul>
        
        <p class="mb-3">Most cancer survivors benefit from:</p>
        
        <ul class="list-disc pl-5 space-y-2">
          <li>150 minutes of moderate activity spread throughout the week</li>
          <li>Gentle strength exercises 2-3 times per week</li>
          <li>Flexibility exercises to maintain mobility</li>
          <li>Balance exercises to reduce fall risk</li>
        </ul>
      `
    },
    {
      id: 'managing-fatigue',
      title: 'Managing Fatigue',
      lastUpdated: 'April 20, 2025',
      content: `
        <p class="mb-3">Cancer-related fatigue is different from normal tiredness. It may not improve with rest alone, and can persist for months or years after treatment.</p>
        
        <h4 class="font-medium mt-3 mb-2">Evidence-based approaches:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Light exercise can actually <strong>reduce</strong> fatigue</li>
          <li>Activity pacing - balance activity with rest periods</li>
          <li>Energy conservation - prioritize important tasks</li>
          <li>Sleep hygiene practices</li>
          <li>Adequate hydration and nutrition</li>
        </ul>
        
        <div class="bg-blue-50 p-3 rounded-md border border-blue-100 mb-3">
          <h4 class="font-medium text-blue-800 mb-1">Exercise Tip:</h4>
          <p class="text-blue-700">Try exercising when your energy level is highest during the day.</p>
        </div>
      `
    },
    {
      id: 'lymphoedema-safety',
      title: 'Lymphoedema Safety',
      lastUpdated: 'April 15, 2025',
      content: `
        <p class="mb-3">Lymphoedema is swelling that can develop after cancer treatment affecting the lymph nodes. Safe exercise is important if you have or are at risk of lymphoedema.</p>
        
        <h4 class="font-medium mt-3 mb-2">Safety guidelines:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Start with low resistance and build gradually</li>
          <li>Wear any prescribed compression garments during exercise</li>
          <li>Stop if you experience increased swelling, pain, or heaviness</li>
          <li>Gentle range of motion exercises are generally safe</li>
          <li>Swimming and water exercises can be beneficial</li>
        </ul>
        
        <div class="bg-amber-50 p-3 rounded-md border border-amber-100">
          <h4 class="font-medium text-amber-800 mb-1">Important:</h4>
          <p class="text-amber-700">If you notice any changes in swelling, skin color, or experience new pain, contact your healthcare provider.</p>
        </div>
      `
    },
    {
      id: 'returning-to-strength',
      title: 'Returning to Strength Work',
      lastUpdated: 'May 5, 2025',
      content: `
        <p class="mb-3">Rebuilding strength is important for daily function and quality of life after cancer. Strength training has been shown to be safe and beneficial for most cancer survivors.</p>
        
        <h4 class="font-medium mt-3 mb-2">Guidelines for returning to strength training:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Get clearance from your healthcare provider</li>
          <li>Begin with no weights or very light weights</li>
          <li>Focus on proper form rather than weight amount</li>
          <li>Start with 1 set of 8-12 repetitions</li>
          <li>Rest at least 48 hours between strength sessions for the same muscle groups</li>
          <li>Progress gradually - add repetitions before increasing weight</li>
          <li>Include all major muscle groups</li>
        </ul>
        
        <p class="italic mb-3">Remember, strength includes everyday activities like climbing stairs, carrying groceries, and getting up from chairs. These functional movements are important to practice.</p>
      `
    },
    {
      id: 'when-to-speak-to-gp',
      title: 'When to Speak to Your GP',
      lastUpdated: 'April 30, 2025',
      content: `
        <p class="mb-3">While exercise is generally safe for cancer survivors, there are times when you should consult your GP or cancer care team before continuing exercise.</p>
        
        <h4 class="font-medium mt-3 mb-2">Seek medical advice if you experience:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Unusual or increased pain</li>
          <li>Dizziness or lightheadedness</li>
          <li>Irregular heartbeat or chest pain</li>
          <li>Unexplained shortness of breath</li>
          <li>Nausea during exercise</li>
          <li>New swelling or lymphoedema symptoms</li>
          <li>Extreme fatigue that doesn't improve with rest</li>
          <li>Unusual weakness on one side of the body</li>
        </ul>
        
        <div class="bg-red-50 p-3 rounded-md border border-red-100">
          <h4 class="font-medium text-red-800 mb-1">Stop exercising immediately if you experience:</h4>
          <p class="text-red-700">Chest pain, severe shortness of breath, or feeling like you might faint.</p>
        </div>
      `
    }
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
            <Link href="/dashboard">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Cancer Recovery Exercise Guidelines
          </h1>
          <p className="text-muted-foreground text-lg">
            Evidence-based information to help you safely return to exercise after cancer treatment.
          </p>
        </div>

        {/* Guidelines content with collapsible sections */}
        <div className="space-y-6 mb-8">
          {guidelineSections.map((section) => (
            <Card key={section.id} className="bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-slate-800">
                  {section.title}
                  <Badge variant="outline" className="flex items-center text-xs gap-1">
                    <Calendar size={12} />
                    Last updated: {section.lastUpdated}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="content" className="border-none">
                    <AccordionTrigger className="text-primary py-1">
                      View Guidelines
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-slate max-w-none mt-2" 
                           dangerouslySetInnerHTML={{ __html: section.content }} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Medical disclaimer */}
        <Alert className="bg-blue-50 border-blue-200 mb-8">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">Medical Disclaimer</AlertTitle>
          <AlertDescription className="text-blue-700">
            This information is not a substitute for medical advice. Always consult your GP or care team before starting exercise.
          </AlertDescription>
        </Alert>

        {/* More information section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Want personalized guidance?</h2>
          <p className="text-muted-foreground mb-4">
            Our exercise specialists can create a custom program tailored to your specific needs and recovery journey.
          </p>
          <Button className="w-full sm:w-auto">Schedule a Consultation</Button>
        </div>
      </div>
    </MainLayout>
  );
}