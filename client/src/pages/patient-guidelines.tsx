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
import { ArrowLeft, BookOpen, Info, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface GuidelineSection {
  id: string;
  title: string;
  lastUpdated: string;
  sourceInfo: string;
  content: string;
}

export default function PatientGuidelinesPage() {
  // Guidelines data based on ACSM-ACS Cancer Specialist Exercise Course
  const guidelineSections: GuidelineSection[] = [
    {
      id: 'movement-after-cancer',
      title: 'Movement After Cancer',
      lastUpdated: 'May 1, 2025',
      sourceInfo: 'Based on ACSM & ACS Guidelines for Cancer Survivors',
      content: `
        <p class="mb-3">Moving your body after cancer treatment is an important part of recovery. Exercise is safe during and after most types of cancer treatment when individual limitations are considered.</p>
        
        <div class="bg-green-50 p-4 rounded-md border border-green-100 mb-4">
          <h4 class="font-medium text-green-800 mb-1 flex items-center">
            <span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>
            Current Recommendations:
          </h4>
          <p class="text-green-700 mb-2">Most cancer survivors benefit from:</p>
          <ul class="list-disc pl-5 space-y-1 text-green-700">
            <li>At least 150 minutes of moderate aerobic activity per week</li>
            <li>Strength training exercises 2-3 times per week</li>
            <li>Flexibility exercises most days of the week</li>
            <li>Balance exercises (especially important if at risk of falls)</li>
          </ul>
        </div>
        
        <h4 class="font-medium mt-4 mb-2">FITT Guidelines for Aerobic Exercise:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Frequency:</strong> 3-5 days per week</li>
          <li><strong>Intensity:</strong> Moderate intensity (you can talk but not sing)</li>
          <li><strong>Time:</strong> 20-60 minutes per session (can be broken into shorter 10-minute sessions)</li>
          <li><strong>Type:</strong> Walking, cycling, swimming, or other activities you enjoy</li>
        </ul>
        
        <p class="mb-3">Always remember these important principles:</p>
        
        <ul class="list-disc pl-5 space-y-2">
          <li>Start slow and build up gradually</li>
          <li>Listen to your body - rest when you need to</li>
          <li>Exercise should leave you feeling energized, not completely exhausted</li>
          <li>Celebrate every achievement, no matter how small</li>
          <li>Some days will be better than others - that's normal</li>
        </ul>
      `
    },
    {
      id: 'managing-fatigue',
      title: 'Managing Fatigue',
      lastUpdated: 'April 20, 2025',
      sourceInfo: 'Based on ACSM & ACS Guidelines for Cancer Survivors',
      content: `
        <p class="mb-3">Cancer-related fatigue is different from normal tiredness. It may not improve with rest alone and can persist for months or years after treatment. Surprisingly, regular physical activity is one of the most effective ways to reduce cancer-related fatigue.</p>
        
        <h4 class="font-medium mt-3 mb-2">Evidence-based approaches to manage fatigue:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Regular, moderate exercise can <strong>reduce</strong> fatigue by 40-50%</li>
          <li>Activity pacing - balance activity with planned rest periods</li>
          <li>Energy conservation - prioritize important tasks</li>
          <li>Exercise when your energy level is highest during the day</li>
          <li>Start with short sessions (5-10 minutes) and gradually build up</li>
          <li>Adequate hydration and nutrition support energy levels</li>
        </ul>
        
        <div class="bg-blue-50 p-3 rounded-md border border-blue-100 mb-3">
          <h4 class="font-medium text-blue-800 mb-1 flex items-center">
            <span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
            Tips for Managing Exercise with Fatigue:
          </h4>
          <ul class="list-disc pl-5 space-y-1 text-blue-700">
            <li>Break exercise into shorter 5-10 minute sessions throughout the day</li>
            <li>Schedule physical activity when you typically feel most energetic</li>
            <li>Some fatigue during exercise is normal, but you should recover within an hour</li>
            <li>Track your fatigue levels before and after exercise to find your optimal amount</li>
          </ul>
        </div>
      `
    },
    {
      id: 'lymphoedema-safety',
      title: 'Lymphoedema Safety',
      lastUpdated: 'April 15, 2025',
      sourceInfo: 'Based on ACSM & ACS Guidelines for Cancer Survivors',
      content: `
        <p class="mb-3">Lymphoedema is swelling that can develop after cancer treatment affecting the lymph nodes. Current research shows that carefully prescribed exercise is safe and can actually help manage lymphoedema symptoms.</p>
        
        <div class="bg-amber-50 p-3 rounded-md border border-amber-100 mb-4">
          <h4 class="font-medium text-amber-800 mb-1 flex items-center">
            <span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></span>
            Important Safety Guidelines:
          </h4>
          <ul class="list-disc pl-5 space-y-1 text-amber-800">
            <li>Always wear prescribed compression garments during exercise</li>
            <li>Start with very light resistance and progress gradually</li>
            <li>Monitor for changes in symptoms during and after exercise</li>
            <li>Stop if you experience increased swelling, pain, or heaviness</li>
            <li>Work with a lymphoedema-trained specialist when possible</li>
          </ul>
        </div>
        
        <h4 class="font-medium mt-3 mb-2">Recommended exercise approach:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Strength training:</strong> Begin with no or very light weights (1-2 lbs/0.5-1 kg)</li>
          <li><strong>Repetitions:</strong> Start with 1 set of 10 repetitions and gradually progress</li>
          <li><strong>Rest:</strong> Take 1-2 minute breaks between exercises</li>
          <li><strong>Range of motion:</strong> Gentle stretching helps maintain mobility</li>
          <li><strong>Progression:</strong> Increase repetitions before increasing weight</li>
        </ul>
        
        <div class="bg-blue-50 p-3 rounded-md border border-blue-100">
          <h4 class="font-medium text-blue-800 mb-1">Beneficial Activities:</h4>
          <p class="text-blue-700">Swimming, water exercises, and walking are generally well-tolerated activities for people with lymphoedema.</p>
        </div>
      `
    },
    {
      id: 'returning-to-strength',
      title: 'Returning to Strength Work',
      lastUpdated: 'May 5, 2025',
      sourceInfo: 'Based on ACSM & ACS Guidelines for Cancer Survivors',
      content: `
        <p class="mb-3">Rebuilding strength is important for daily function and quality of life after cancer. Strength training has been shown to be safe and beneficial for most cancer survivors, helping to rebuild muscle that may have been lost during treatment.</p>
        
        <h4 class="font-medium mt-3 mb-2">FITT Guidelines for Strength Training:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Frequency:</strong> 2-3 non-consecutive days per week</li>
          <li><strong>Intensity:</strong> Start light (30-50% of maximum) and gradually progress</li>
          <li><strong>Time:</strong> Begin with 1 set of 8-12 repetitions for each exercise</li>
          <li><strong>Type:</strong> Target all major muscle groups (legs, hips, back, chest, abdomen, shoulders, and arms)</li>
        </ul>
        
        <h4 class="font-medium mt-3 mb-2">Progression Guidelines:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Begin with body weight or very light weights</li>
          <li>Focus on proper form rather than weight amount</li>
          <li>Progress from 1 set to 2-3 sets before increasing weight</li>
          <li>Aim to gradually increase to moderate intensity (60-70% of maximum)</li>
          <li>Rest at least 48 hours between strength sessions for the same muscle groups</li>
          <li>If you feel pain (not normal muscle fatigue), reduce the weight or stop</li>
        </ul>
        
        <div class="bg-green-50 p-3 rounded-md border border-green-100 mb-3">
          <h4 class="font-medium text-green-800 mb-1 flex items-center">
            <span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg></span>
            Strength in Daily Life:
          </h4>
          <p class="text-green-700">Remember that strength includes everyday activities like climbing stairs, carrying groceries, and getting up from chairs. These functional movements are important to practice and also count as physical activity.</p>
        </div>
      `
    },
    {
      id: 'when-to-speak-to-gp',
      title: 'When to Speak to Your GP',
      lastUpdated: 'April 30, 2025',
      sourceInfo: 'Based on ACSM & ACS Guidelines for Cancer Survivors',
      content: `
        <p class="mb-3">While exercise is generally safe for cancer survivors, there are times when you should consult your GP or cancer care team before continuing exercise.</p>
        
        <div class="bg-red-50 p-4 rounded-md border border-red-100 mb-4">
          <h4 class="font-medium text-red-800 mb-2 flex items-center">
            <span class="mr-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg></span>
            Stop exercising immediately and seek medical help if you experience:
          </h4>
          <ul class="list-disc pl-5 space-y-1 text-red-800">
            <li>Chest pain or pressure</li>
            <li>Severe shortness of breath</li>
            <li>Dizziness or feeling like you might faint</li>
            <li>Unusual or rapid heartbeat</li>
          </ul>
        </div>
        
        <h4 class="font-medium mt-4 mb-2">Consult your healthcare provider before continuing exercise if you experience:</h4>
        <ul class="list-disc pl-5 space-y-2 mb-4">
          <li>Unusual or increased pain</li>
          <li>Unexplained shortness of breath with light activity</li>
          <li>New swelling or lymphoedema symptoms</li>
          <li>Extreme fatigue that doesn't improve with rest</li>
          <li>Unusual weakness, particularly on one side of the body</li>
          <li>Persistent headaches or changes in vision</li>
          <li>Bone pain that is new or worsening</li>
          <li>Nausea or vomiting during exercise</li>
        </ul>
        
        <h4 class="font-medium mt-4 mb-2">Special precautions may be needed if you have:</h4>
        <ul class="list-disc pl-5 space-y-2">
          <li>Recent surgery (usually wait until cleared by your surgeon)</li>
          <li>Low red blood cell count (anemia)</li>
          <li>Low white blood cell count (neutropenia)</li>
          <li>Low platelet count (thrombocytopenia)</li>
          <li>Fever or active infection</li>
          <li>Bone metastases or osteoporosis</li>
          <li>Peripheral neuropathy (numbness in hands/feet)</li>
          <li>Indwelling catheters or feeding tubes</li>
        </ul>
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

        {/* Introduction section */}
        <Card className="mb-8 bg-primary-light/10">
          <CardContent className="pt-6">
            <p className="mb-3">
              Exercise is safe both during and after most types of cancer treatment when individual limitations are considered. 
              These guidelines are based on the latest recommendations from the American College of Sports Medicine (ACSM) 
              and the American Cancer Society (ACS).
            </p>
            <p>
              All cancer survivors, including those undergoing treatment, should avoid being sedentary and aim to return
              to normal daily activities as quickly as possible.
            </p>
          </CardContent>
        </Card>

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
                <CardDescription className="text-xs text-muted-foreground">
                  {section.sourceInfo}
                </CardDescription>
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

        {/* References */}
        <div className="mb-8 text-sm text-muted-foreground">
          <h3 className="text-base font-medium mb-2 text-slate-700">References</h3>
          <p className="mb-1">Campbell, K. L., et al. (2019). Exercise Guidelines for Cancer Survivors: Consensus Statement from International Multidisciplinary Roundtable. <em>Medicine and Science in Sports and Exercise, 51</em>, 2375-90.</p>
          <p className="mb-1">Hayes, S. C., et al. (2019). The Exercise and Sports Science Australia position statement: Exercise medicine in cancer management. <em>Journal of Science and Medicine in Sport, 22</em>, 1175-99.</p>
          <p className="mb-1">American College of Sports Medicine & American Cancer Society Guidelines for Cancer Survivors (2022).</p>
        </div>

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