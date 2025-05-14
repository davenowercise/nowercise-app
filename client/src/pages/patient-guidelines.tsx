import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'wouter';
import { ArrowLeft, BookOpen, Info, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GuidelineSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PatientGuidelinesPage() {
  // Guidelines data based on ACSM-ACS Cancer Specialist Exercise Course
  const guidelineSections: GuidelineSection[] = [
    {
      id: 'goals',
      title: '1. Goals of Exercise During and After Cancer',
      content: (
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Reduce treatment side effects like fatigue, joint stiffness, and neuropathy</li>
          <li>Improve energy, confidence, sleep, and independence</li>
          <li>Support bone health, heart health, and mental wellbeing</li>
          <li>Help return to daily activities as quickly as possible</li>
          <li>Maintain muscle mass and strength that may be lost during treatment</li>
        </ul>
      )
    },
    {
      id: 'weekly-recommendations',
      title: '2. Weekly Activity Recommendations',
      content: (
        <>
          <div className="mb-4">
            <p className="font-medium mb-1">Aerobic Activity:</p>
            <p>3-5 times per week, 30-60 mins (as tolerated)</p>
            <p className="text-sm text-slate-500 mt-1">Examples: Walking, swimming, cycling, or dancing</p>
          </div>
          
          <div className="mb-4">
            <p className="font-medium mb-1">Resistance Training:</p>
            <p>2-3 times per week, 1-2 sets of 8-15 reps</p>
            <p className="text-sm text-slate-500 mt-1">Target all major muscle groups</p>
          </div>
          
          <div className="mb-4">
            <p className="font-medium mb-1">Flexibility:</p>
            <p>Daily or most days</p>
            <p className="text-sm text-slate-500 mt-1">Gentle stretching to maintain mobility</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md border border-green-100 mb-3">
            <p className="flex items-center font-medium text-green-800">
              <CheckCircle2 size={16} className="mr-2" />
              Remember:
            </p>
            <p className="text-green-700">Start low and go slow. Gentle band work, walking, and chair-based movement all count!</p>
          </div>
        </>
      )
    },
    {
      id: 'safety',
      title: '3. Safety Considerations',
      content: (
        <>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>It's safe to exercise after cancer with proper adaptation</li>
            <li>Use fatigue and symptoms as your guide — not willpower</li>
            <li>If you have swelling, lymphoedema, or pain, adjust or pause movements</li>
            <li>Stay well hydrated and stop if you feel unwell</li>
            <li>Exercise should leave you feeling energized, not completely exhausted</li>
          </ul>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-3">
            <p className="flex items-center font-medium text-blue-800">
              <Info size={16} className="mr-2" />
              Tips for Managing Exercise with Fatigue:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-blue-700 mt-2">
              <li>Break exercise into shorter 5-10 minute sessions throughout the day</li>
              <li>Schedule physical activity when you typically feel most energetic</li>
              <li>Some fatigue during exercise is normal, but you should recover within an hour</li>
            </ul>
          </div>
        </>
      )
    },
    {
      id: 'lymphoedema',
      title: '4. Lymphoedema and Movement',
      content: (
        <>
          <p className="mb-3">Exercise can be helpful for lymphoedema management when done correctly.</p>
          
          <p className="font-medium mb-2">Important guidelines:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Progress resistance slowly</li>
            <li>Begin with no or very light weights (1-2 lbs/0.5-1 kg)</li>
            <li>Avoid high strain or sudden overload</li>
            <li>Always wear compression garments during exercise if recommended</li>
            <li>Stop and rest if you notice increased swelling</li>
            <li>Swimming, water exercises, and walking are generally well-tolerated</li>
          </ul>
          
          <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
            <p className="flex items-center font-medium text-amber-800">
              <AlertCircle size={16} className="mr-2" />
              Caution:
            </p>
            <p className="text-amber-700">If you notice increased swelling, heaviness, or discomfort during or after exercise, stop and consult your healthcare provider.</p>
          </div>
        </>
      )
    },
    {
      id: 'when-to-speak',
      title: '5. When to Speak to Your GP',
      content: (
        <>
          <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-4">
            <p className="flex items-center font-medium text-red-800 mb-2">
              <AlertCircle size={16} className="mr-2" />
              Stop exercising immediately and seek help if you experience:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-red-800">
              <li>Chest pain or pressure</li>
              <li>Severe shortness of breath</li>
              <li>Dizziness or feeling like you might faint</li>
              <li>Unusual or rapid heartbeat</li>
            </ul>
          </div>
          
          <p className="font-medium mb-2">Also consult your doctor if:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You're unsure about starting exercise</li>
            <li>You've had recent surgery, new symptoms, or a recurrence</li>
            <li>You experience unexplained pain or increasing fatigue</li>
            <li>You have new swelling or lymphoedema symptoms</li>
            <li>You have fever or signs of infection</li>
            <li>You're dealing with severe treatment side effects</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
            <Link href="/dashboard">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Exercise Guidelines
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Last Reviewed: May 2025</span>
          </div>
          <p className="mt-3 text-slate-600">
            Evidence-based recommendations to help you safely exercise during and after cancer treatment.
          </p>
        </div>

        {/* Guidelines content with collapsible sections */}
        <div className="mb-8 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Accordion type="multiple" className="w-full">
            {guidelineSections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="px-4 border-b last:border-b-0">
                <AccordionTrigger className="py-4 text-left font-medium text-slate-800 hover:text-primary hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-4 text-slate-700">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Medical disclaimer */}
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertTitle className="text-blue-800">Medical Disclaimer</AlertTitle>
          <AlertDescription className="text-blue-700">
            This information is for general guidance only and is not a substitute for medical advice. 
            Always consult your GP, cancer nurse, or oncology team before starting or changing your exercise routine.
          </AlertDescription>
        </Alert>

        {/* References - simplified */}
        <div className="mb-6 text-xs text-slate-500">
          <p>Based on guidelines from the American College of Sports Medicine (ACSM) and American Cancer Society (ACS).</p>
        </div>

        {/* Consultation prompt */}
        <div className="mt-8 text-center">
          <p className="mb-3 text-slate-700">
            Need personalized guidance for your specific situation?
          </p>
          <Button className="w-full sm:w-auto">Schedule a Consultation</Button>
        </div>
      </div>
    </MainLayout>
  );
}