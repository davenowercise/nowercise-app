import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface GuidelineSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PatientGuidelinesPage() {
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Guidelines data based on ACSM-ACS Cancer Specialist Exercise Course
  const guidelineSections: GuidelineSection[] = [
    {
      id: 'goals',
      title: '1. Goals of Exercise During and After Cancer',
      content: (
        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
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
        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
          <li><strong>Aerobic activity:</strong> 3× per week, 30–60 minutes, at a manageable intensity</li>
          <li><strong>Resistance training:</strong> 2× per week, 1–2 sets of 8–15 reps (bands, light weights)</li>
          <li><strong>Flexibility:</strong> Daily or most days, including stretches or gentle mobility</li>
          <li className="font-medium text-primary mt-2">Remember: Start low and go slow — gentle band work, walking, and chair-based movement all count!</li>
        </ul>
      )
    },
    {
      id: 'safety',
      title: '3. Safety Considerations',
      content: (
        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
          <li>Start low and build slow — progression is gradual</li>
          <li>Use symptoms (not willpower) to guide your pace</li>
          <li>Pause if you feel dizzy, unwell, or if pain increases</li>
          <li>Adapt exercises around fatigue or medical equipment (e.g. PICC lines)</li>
          <li>Break exercise into shorter 5-10 minute sessions if needed</li>
          <li>Schedule physical activity when you typically feel most energetic</li>
        </ul>
      )
    },
    {
      id: 'lymphoedema',
      title: '4. Lymphoedema and Movement',
      content: (
        <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
          <li>Exercise is safe and beneficial with proper monitoring</li>
          <li>Start resistance gradually and monitor for swelling</li>
          <li>Use compression garments if prescribed</li>
          <li>Stop or adapt if you notice increased heaviness, swelling or tightness</li>
          <li>Swimming, water exercises, and walking are generally well-tolerated</li>
          <li className="italic mt-2">Important: If you notice increased swelling during or after exercise, stop and consult your healthcare provider.</li>
        </ul>
      )
    },
    {
      id: 'when-to-speak',
      title: '5. When to Speak to Your GP',
      content: (
        <>
          <div className="mb-3 bg-red-50 p-3 rounded-md border border-red-100">
            <p className="font-medium text-red-800 mb-1">Stop exercising immediately and seek help if you experience:</p>
            <ul className="list-disc pl-5 text-red-700">
              <li>Chest pain or pressure</li>
              <li>Severe shortness of breath</li>
              <li>Dizziness or feeling like you might faint</li>
              <li>Unusual or rapid heartbeat</li>
            </ul>
          </div>
          
          <p className="font-medium text-slate-700 mb-1">Also consult your doctor if:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>You're unsure about starting exercise</li>
            <li>You've had recent surgery, recurrence, or new symptoms</li>
            <li>You experience unexplained pain or increasing fatigue</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="mb-4 flex items-center">
          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
            <Link href="/dashboard">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Exercise Guidelines
          </h1>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="mr-1 h-4 w-4" />
            <span>Last Reviewed: May 2025</span>
          </div>
          <p className="text-slate-600">
            Evidence-based recommendations to help you safely exercise during and after cancer treatment.
          </p>
        </div>

        {/* Guidelines content with collapsible sections */}
        <div className="mb-6 space-y-3">
          {guidelineSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            
            return (
              <div 
                key={section.id} 
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full text-left px-4 py-3.5 font-medium flex justify-between items-center hover:bg-slate-50 focus:outline-none focus:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-800">{section.title}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-4 pb-4">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Medical disclaimer */}
        <Alert className="bg-blue-50 border border-blue-100 mb-6">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium mb-1">Medical Disclaimer</p>
              <AlertDescription className="text-blue-700 text-sm">
                This information is for general guidance only and is not a substitute for medical advice. 
                Always consult your GP, cancer nurse, or oncology team before starting or changing your exercise routine.
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* References - simplified */}
        <div className="mb-8 text-xs text-slate-500">
          <p>Based on guidelines from the American College of Sports Medicine (ACSM) and American Cancer Society (ACS).</p>
        </div>

        {/* Consultation prompt */}
        <div className="text-center">
          <p className="mb-3 text-slate-700">
            Need personalized guidance for your specific situation?
          </p>
          <Button className="bg-primary hover:bg-primary-dark">Schedule a Consultation</Button>
        </div>
      </div>
    </MainLayout>
  );
}