import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ExerciseGuidelinesPage = () => {
  return (
    <div className="container max-w-3xl mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">Exercise Guidelines</h1>
        <div className="flex items-center text-gray-500 mb-4">
          <span className="inline-block mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          <span>Last Reviewed: May 2025</span>
        </div>
        <p className="text-gray-700 mb-4">
          Evidence-based recommendations to help you safely exercise during and after cancer treatment.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-medium text-gray-700 mb-2">Quick links:</h2>
        <div className="flex space-x-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((num) => (
            <a 
              key={num} 
              href={`#section-${num}`} 
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition mb-2"
            >
              {num}
            </a>
          ))}
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="pr-4">
          <section id="section-1" className="mb-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3">1. Goals of Exercise During Cancer Care</h2>
                <p className="mb-3">
                  Exercise during and after cancer treatment aims to:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li>Maintain or improve physical function</li>
                  <li>Reduce symptom severity</li>
                  <li>Improve quality of life</li>
                  <li>Potentially improve treatment efficacy</li>
                  <li>Reduce risk of recurrence (for some cancers)</li>
                </ul>
                <p>
                  Research shows that appropriate exercise is safe and beneficial for most cancer patients, even during active treatment.
                </p>
              </CardContent>
            </Card>
          </section>

          <section id="section-2" className="mb-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3">2. FITT Framework for Cancer Exercise</h2>
                <p className="mb-3">
                  The FITT principles outline how to structure your exercise:
                </p>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h3 className="font-bold text-blue-800">Frequency</h3>
                    <p>Aim for 3-5 days per week, depending on your current fitness level and treatment status.</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <h3 className="font-bold text-green-800">Intensity</h3>
                    <p>Start low (30-45% of capacity) and gradually progress based on your tolerance and treatment phase.</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <h3 className="font-bold text-purple-800">Time</h3>
                    <p>Begin with 10-15 minutes and build to 20-30 minutes per session as tolerated.</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md">
                    <h3 className="font-bold text-amber-800">Type</h3>
                    <p>Combine aerobic, resistance, and flexibility exercises, adjusted for your specific cancer and treatment.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="section-3" className="mb-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3">3. Safety Considerations</h2>
                <div className="bg-red-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> Always consult with your healthcare provider before starting or changing your exercise program.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="border-l-4 border-orange-400 pl-3">
                    <h3 className="font-medium">Avoid Exercise When:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You have a fever above 100.4°F (38°C)</li>
                      <li>You're experiencing unusual pain or discomfort</li>
                      <li>You have severe fatigue that doesn't improve with rest</li>
                      <li>Your blood counts are critically low (follow medical advice)</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-3">
                    <h3 className="font-medium">Monitor For:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Unusual shortness of breath</li>
                      <li>Chest pain or pressure</li>
                      <li>Sudden onset of nausea</li>
                      <li>Dizziness or lightheadedness</li>
                      <li>Unusual or increased swelling</li>
                    </ul>
                  </div>
                  <p className="text-sm mt-3">
                    Stop exercise and seek medical attention if you experience any concerning symptoms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="section-4" className="mb-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3">4. Cancer-Specific Recommendations</h2>
                
                <div className="mb-4">
                  <h3 className="font-bold text-pink-700 mb-2">Breast Cancer</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Begin with low-resistance upper body exercises after surgery</li>
                      <li>Be cautious with exercises involving affected arm if lymphedema risk</li>
                      <li>Progressive resistance training is generally safe and beneficial</li>
                      <li>Consider compression garments if recommended</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-bold text-blue-700 mb-2">Prostate Cancer</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Focus on pelvic floor exercises before and after treatment</li>
                      <li>Resistance training may help counter effects of hormone therapy</li>
                      <li>Weight-bearing exercise to maintain bone density</li>
                      <li>Moderate aerobic exercise shown to reduce fatigue</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-bold text-purple-700 mb-2">Colorectal Cancer</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Avoid heavy lifting for 6-8 weeks after abdominal surgery</li>
                      <li>Start with gentle walking as soon as approved</li>
                      <li>Gradually increase intensity as recovery progresses</li>
                      <li>Core strengthening may help with post-surgical stability</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-green-700 mb-2">Lung Cancer</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Breathing exercises and respiratory muscle training</li>
                      <li>Short, frequent exercise sessions to manage fatigue</li>
                      <li>Monitor oxygen levels if prescribed</li>
                      <li>Supervised exercise may be preferable initially</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="section-5" className="mb-8">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3">5. Exercise Progression</h2>
                <p className="mb-3">
                  Your Nowercise program follows a tier-based approach to safely progress your exercise:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-md overflow-hidden">
                    <div className="bg-blue-600 text-white p-2">
                      <h3 className="font-bold">Tier 1: Early Recovery / Low Intensity</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-sm mb-2">For those just starting exercise or during active treatment with significant limitations.</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Very light intensity (RPE 1-3/10)</li>
                        <li>Shorter sessions (10-15 minutes)</li>
                        <li>Focus on movement quality and body awareness</li>
                        <li>Emphasis on breathing and relaxation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-md overflow-hidden">
                    <div className="bg-green-600 text-white p-2">
                      <h3 className="font-bold">Tier 2: Building Foundation</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-sm mb-2">For those with improved capacity or fewer treatment side effects.</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Light intensity (RPE 3-5/10)</li>
                        <li>Gradual increase in duration (15-20 minutes)</li>
                        <li>Introduction of light resistance with bands or small weights</li>
                        <li>Functional movement patterns</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-md overflow-hidden">
                    <div className="bg-amber-600 text-white p-2">
                      <h3 className="font-bold">Tier 3: Moderate Activity</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-sm mb-2">For those with good exercise tolerance or further along in recovery.</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Moderate intensity (RPE 5-7/10)</li>
                        <li>Regular sessions of 20-30 minutes</li>
                        <li>Progressive resistance training</li>
                        <li>More varied exercise selection</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-md overflow-hidden">
                    <div className="bg-purple-600 text-white p-2">
                      <h3 className="font-bold">Tier 4: Higher Capacity</h3>
                    </div>
                    <div className="p-3">
                      <p className="text-sm mb-2">For those post-treatment with minimal limitations.</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Moderate to vigorous intensity (RPE 6-8/10)</li>
                        <li>30+ minute sessions</li>
                        <li>More challenging strength exercises</li>
                        <li>Potential for interval training when appropriate</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm mt-4">
                  Your exercise specialist will determine your appropriate tier and guide progression based on your individual needs, preferences, and clinical status.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExerciseGuidelinesPage;