import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, PlayCircle, Calendar, ArrowRight, ArrowLeft, BookOpen, Trophy, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function Club() {
  const { user } = useAuth();
  const firstName = user?.firstName || 'Friend';
  
  // Mock data for member stats
  const memberStats = {
    daysActive: 14,
    sessionsCompleted: 9,
    streakDays: 3,
    nextMilestone: 'Complete 10 sessions'
  };

  // Featured content
  const featuredSessions = [
    {
      id: 'gentle-1',
      title: 'Chair-Based Movement',
      description: 'A 15-minute gentle session focusing on mobility that can be done entirely seated.',
      difficulty: 'Very Gentle',
      duration: '15 min',
      image: 'chair-session.jpg',
      link: '/club/gentle-sessions#gentle-1'
    },
    {
      id: 'gentle-2',
      title: 'Morning Energy Flow',
      description: 'Wake up your body with this gentle standing routine to boost circulation.',
      difficulty: 'Gentle',
      duration: '20 min',
      image: 'morning-flow.jpg',
      link: '/club/gentle-sessions#gentle-2'
    },
    {
      id: 'gentle-3',
      title: 'Bedtime Relaxation',
      description: 'Prepare for sleep with these calming stretches and guided relaxation.',
      difficulty: 'Very Gentle',
      duration: '12 min',
      image: 'relaxation.jpg',
      link: '/club/gentle-sessions#gentle-3'
    }
  ];

  // Weekly theme
  const weeklyTheme = {
    title: 'Building Balance',
    description: 'This week we focus on gentle balance exercises to improve stability and confidence.'
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Club Banner */}
      <div className="bg-orange-50 text-orange-800 text-sm px-4 py-3 rounded-lg border border-orange-100 flex items-center mb-4">
        <span className="bg-orange-100 p-1 rounded-full mr-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
        </span>
        <span className="font-medium">You're in Nowercise Club — exclusive member space for guided recovery</span>
      </div>
      
      {/* Back to Dashboard Button */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-orange-600">
            <span className="flex items-center">
              <CheckCircle className="mr-2 h-7 w-7 text-orange-500" />
              Nowercise Club
            </span>
          </h1>
        </div>
        <p className="text-xl text-slate-600 mb-1">
          Welcome back, {firstName}! Small wins matter.
        </p>
        <p className="text-sm italic text-slate-500">
          Included with your Nowercise membership – gentle sessions, weekly wins, and expert support.
        </p>
      </div>

      {/* Member Stats Card */}
      <div className="mb-10 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Days Active</h3>
            <p className="text-3xl font-bold text-primary">{memberStats.daysActive}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Sessions Done</h3>
            <p className="text-3xl font-bold text-primary">{memberStats.sessionsCompleted}</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Current Streak</h3>
            <p className="text-3xl font-bold text-primary">{memberStats.streakDays} days</p>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Next Milestone</h3>
            <div className="mt-2">
              <Progress value={90} className="h-2" />
              <p className="mt-1 text-sm text-gray-600">{memberStats.nextMilestone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Theme Section */}
      <div className="mb-10">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-800">This Week's Focus</h2>
        </div>
        <div className="bg-primary-light/15 rounded-lg p-6 border border-primary-light/30">
          <h3 className="text-xl font-medium text-primary mb-2">{weeklyTheme.title}</h3>
          <p className="text-slate-700">{weeklyTheme.description}</p>
          <div className="mt-4">
            <Button asChild variant="default" className="bg-primary hover:bg-primary-dark">
              <Link href="/club/weekly-movement">
                View This Week's Sessions <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Getting Started For New Members */}
      <div className="mb-12">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-800">Getting Started</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:grid md:grid-cols-3 gap-0">
            <Card className="border-0 shadow-none md:border-r border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <span className="inline-flex items-center justify-center bg-primary-light/20 text-primary w-7 h-7 rounded-full mr-2">1</span>
                  Check In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Start with a quick check-in to track how you're feeling today.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/club/check-in">Check In Now</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-0 shadow-none md:border-r border-gray-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <span className="inline-flex items-center justify-center bg-primary-light/20 text-primary w-7 h-7 rounded-full mr-2">2</span>
                  Try a Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Choose from our gentle movement sessions based on your energy level.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/club/gentle-sessions">Browse Sessions</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <span className="inline-flex items-center justify-center bg-primary-light/20 text-primary w-7 h-7 rounded-full mr-2">3</span>
                  Celebrate a Win
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Log your small wins to track your progress and build confidence.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/club/wins">Record a Win</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Featured Gentle Sessions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PlayCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-800">Featured Gentle Sessions</h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/club/gentle-sessions">View All</Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {featuredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {/* Placeholder for session image */}
                <PlayCircle className="h-12 w-12 text-primary opacity-60" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <span className="text-xs bg-primary-light/20 text-primary px-2 py-1 rounded-full">
                    {session.duration}
                  </span>
                </div>
                <CardDescription className="text-xs flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />
                  {session.difficulty}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {session.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={session.link}>
                    Start Session <PlayCircle className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-6 text-center">
        <blockquote className="text-lg italic text-slate-700 mb-3">
          "Movement is a medicine for creating change in a person's physical, emotional, and mental states."
        </blockquote>
        <cite className="text-sm text-slate-500">— Carol Welch</cite>
      </div>
    </div>
  );
}