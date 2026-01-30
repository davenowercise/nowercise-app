import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Heart, 
  PlayCircle, 
  ArrowLeft, 
  Clock, 
  ChevronUp, 
  ChevronDown, 
  ThumbsUp,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Session {
  id: string;
  title: string;
  description: string;
  difficulty: 'Very Gentle' | 'Gentle' | 'Moderate';
  duration: string;
  instructor: string;
  category: 'seated' | 'standing' | 'bed' | 'mixed';
  focusAreas: string[];
  videoUrl?: string;
  benefitsFor: string[];
  adaptations: string[];
}

export default function GentleSessions() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = React.useState('all');
  const [expandedSession, setExpandedSession] = React.useState<string | null>(null);
  
  // Check if URL has a hash to auto-navigate to a specific session
  React.useEffect(() => {
    if (window.location.hash) {
      const sessionId = window.location.hash.substring(1);
      setExpandedSession(sessionId);
      
      // Scroll to the session
      setTimeout(() => {
        const element = document.getElementById(sessionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Toggle session details expand/collapse
  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id);
  };

  // Mock sessions data
  const sessions: Session[] = [
    {
      id: 'gentle-1',
      title: 'Chair-Based Movement',
      description: 'A gentle seated routine focusing on mobility and circulation without standing. Perfect for days when energy is low or during treatment.',
      difficulty: 'Very Gentle',
      duration: '15 min',
      instructor: 'Sarah Johnson',
      category: 'seated',
      focusAreas: ['Upper body mobility', 'Gentle stretching', 'Circulation'],
      benefitsFor: [
        'Fatigue management',
        'Joint stiffness',
        'PICC line accommodation',
        'Post-surgery recovery'
      ],
      adaptations: [
        'All movements can be modified to match your range of motion',
        'Use just one arm if needed for PICC line accommodation',
        'Rest between movements as needed'
      ]
    },
    {
      id: 'gentle-2',
      title: 'Morning Energy Flow',
      description: 'Wake up your body with this gentle standing routine designed to boost circulation and energy. Includes balance support options.',
      difficulty: 'Gentle',
      duration: '20 min',
      instructor: 'Michael Chen',
      category: 'standing',
      focusAreas: ['Balance', 'Gentle strengthening', 'Energy'],
      benefitsFor: [
        'Morning stiffness',
        'Energy levels',
        'Mood improvement',
        'Circulation'
      ],
      adaptations: [
        'All standing exercises can be done near a chair or wall for support',
        'Option to remain seated for any movement that feels challenging',
        'Take breaks whenever needed'
      ]
    },
    {
      id: 'gentle-3',
      title: 'Bedtime Relaxation',
      description: 'Prepare for sleep with these calming stretches and guided relaxation techniques to improve sleep quality.',
      difficulty: 'Very Gentle',
      duration: '12 min',
      instructor: 'Emma Roberts',
      category: 'bed',
      focusAreas: ['Relaxation', 'Gentle stretching', 'Sleep preparation'],
      benefitsFor: [
        'Sleep difficulties',
        'Anxiety reduction',
        'Comfort improvement',
        'Stress management'
      ],
      adaptations: [
        'Can be done entirely in bed',
        'Includes options for side-lying positions',
        'All movements are slow and gentle'
      ]
    },
    {
      id: 'gentle-4',
      title: 'Gentle Range of Motion',
      description: 'A session focused on maintaining and improving joint mobility through gentle, controlled movements.',
      difficulty: 'Gentle',
      duration: '18 min',
      instructor: 'Sarah Johnson',
      category: 'mixed',
      focusAreas: ['Joint mobility', 'Flexibility', 'Functional movement'],
      benefitsFor: [
        'Joint stiffness',
        'Functional movement',
        'Surgery recovery',
        'Maintaining mobility'
      ],
      adaptations: [
        'Includes both seated and standing options',
        'Use supports as needed',
        'Adjust range of motion to your comfort level'
      ]
    },
    {
      id: 'gentle-5',
      title: 'Lymphatic Flow',
      description: 'Gentle movements specifically designed to support lymphatic circulation with special attention to safety for those with lymphoedema concerns.',
      difficulty: 'Very Gentle',
      duration: '15 min',
      instructor: 'Emma Roberts',
      category: 'seated',
      focusAreas: ['Lymphatic flow', 'Gentle arm movement', 'Circulation'],
      benefitsFor: [
        'Lymphoedema risk',
        'Post-surgery recovery',
        'Circulation issues',
        'Arm/hand swelling'
      ],
      adaptations: [
        'Always wear compression garments if prescribed',
        'Monitor for any sensations of heaviness or fullness',
        'Progress very gradually with movements'
      ]
    },
    {
      id: 'gentle-6',
      title: 'Balance Foundations',
      description: 'Build confidence in your balance with this progressive routine that includes plenty of support options.',
      difficulty: 'Gentle',
      duration: '22 min',
      instructor: 'Michael Chen',
      category: 'standing',
      focusAreas: ['Balance', 'Core stability', 'Confidence'],
      benefitsFor: [
        'Fall prevention',
        'Confidence building',
        'Functional independence',
        'Core strength'
      ],
      adaptations: [
        'Always stand near a sturdy support',
        'Progress at your own pace',
        'Seated versions of all exercises included'
      ]
    }
  ];

  // Filter sessions based on selected tab
  const filteredSessions = selectedTab === 'all' 
    ? sessions 
    : sessions.filter(session => session.category === selectedTab);

  // Helper for difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Very Gentle': return 'bg-action-blue';
      case 'Gentle': return 'bg-sky-400';
      case 'Moderate': return 'bg-amber-400';
      default: return 'bg-action-blue';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Club Banner */}
      <div className="bg-orange-50 text-orange-800 text-sm px-4 py-3 rounded-lg border border-orange-100 flex items-center mb-4">
        <span className="bg-orange-100 p-1 rounded-full mr-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
        </span>
        <span className="font-medium">Nowercise Club — exclusive member space for guided recovery</span>
      </div>
      
      {/* Navigation Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/club">
            <ArrowLeft size={16} className="mr-1" /> Back to Club
          </Link>
        </Button>
      </div>
        
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <CheckCircle className="mr-2 h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-orange-600">Gentle Sessions</h1>
        </div>
        <p className="text-sm italic text-slate-500 mb-2">
          Included with your Nowercise membership – gentle sessions based on evidence-backed exercise guidelines.
        </p>
        <p className="text-slate-600">
          Movement sessions designed specifically for cancer patients at any stage of treatment or recovery.
          All sessions focus on safe, adaptable exercises appropriate for your current energy level.
        </p>
      </div>

      {/* Tabs for filtering session types */}
      <Tabs 
        defaultValue="all" 
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mb-8"
      >
        <div className="border-b pb-2 mb-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="seated">Chair-Based</TabsTrigger>
            <TabsTrigger value="standing">Standing</TabsTrigger>
            <TabsTrigger value="bed">Bed/Lying</TabsTrigger>
            <TabsTrigger value="mixed">Mixed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <p className="text-sm text-slate-500 mb-4">
            Showing all {sessions.length} gentle sessions. Select a category to filter.
          </p>
        </TabsContent>
        
        <TabsContent value="seated" className="mt-0">
          <p className="text-sm text-slate-500 mb-4">
            Chair-based sessions are perfect for low-energy days, during treatment, or when balance is a concern.
          </p>
        </TabsContent>
        
        <TabsContent value="standing" className="mt-0">
          <p className="text-sm text-slate-500 mb-4">
            Standing sessions help improve balance and functional strength with options for support.
          </p>
        </TabsContent>
        
        <TabsContent value="bed" className="mt-0">
          <p className="text-sm text-slate-500 mb-4">
            Bed or lying sessions can be done in bed or on a mat for days when you need to rest.
          </p>
        </TabsContent>
        
        <TabsContent value="mixed" className="mt-0">
          <p className="text-sm text-slate-500 mb-4">
            Mixed sessions combine seated and standing elements with options for all energy levels.
          </p>
        </TabsContent>
      </Tabs>

      {/* Session Cards */}
      <div className="space-y-6">
        {filteredSessions.map((session) => (
          <Card 
            key={session.id} 
            id={session.id}
            className={`overflow-hidden hover:shadow-sm transition-shadow border-l-4 ${
              expandedSession === session.id 
                ? 'border-l-primary shadow-sm' 
                : 'border-l-transparent'
            }`}
          >
            <CardHeader className="pb-3 relative">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <CardDescription className="flex items-center flex-wrap gap-2 mt-1">
                    <span className="inline-flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${getDifficultyColor(session.difficulty)} mr-1`} />
                      {session.difficulty}
                    </span>
                    <span className="inline-flex items-center text-slate-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {session.duration}
                    </span>
                    <span className="text-slate-500">with {session.instructor}</span>
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 absolute top-3 right-3"
                  onClick={() => toggleSession(session.id)}
                >
                  {expandedSession === session.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-sm text-slate-600 mb-2">
                {session.description}
              </p>
              
              {expandedSession === session.id && (
                <div className="mt-4 text-sm border-t pt-4">
                  <div className="mb-3">
                    <h4 className="font-medium text-primary mb-1">Focus Areas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {session.focusAreas.map((area, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-primary mb-1">Especially Beneficial For:</h4>
                    <ul className="list-disc ml-5 text-slate-600 space-y-1">
                      {session.benefitsFor.map((benefit, i) => (
                        <li key={i}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-primary mb-1">Adaptations Available:</h4>
                    <ul className="list-disc ml-5 text-slate-600 space-y-1">
                      {session.adaptations.map((adaptation, i) => (
                        <li key={i}>{adaptation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className={expandedSession === session.id ? "border-t pt-4" : ""}>
              <div className="w-full">
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
                
                {expandedSession === session.id && (
                  <div className="flex justify-between mt-3 gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ThumbsUp className="mr-2 h-3.5 w-3.5" />
                      Add to Favorites
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Schedule for Later
                    </Button>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No sessions found for the selected filter.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setSelectedTab('all')}
          >
            Show All Sessions
          </Button>
        </div>
      )}
    </div>
  );
}