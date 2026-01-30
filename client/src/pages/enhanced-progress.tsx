import { EnhancedProgressDashboard } from '@/components/progress/enhanced-progress-dashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Heart, Target, Brain } from 'lucide-react';

export default function EnhancedProgressPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Progress Analytics</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your fitness journey with comprehensive analytics and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Workout Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitor exercise frequency, duration, and intensity over time
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <CardTitle className="text-lg">Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track energy, pain levels, and overall wellbeing trends
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-8 w-8 mx-auto mb-2 text-action-blue" />
              <CardTitle className="text-lg">Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitor progress towards weekly and monthly fitness goals
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AI-powered analysis of your exercise patterns and outcomes
              </p>
            </CardContent>
          </Card>
        </div>

        <EnhancedProgressDashboard />

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            Key Progress Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Physical Improvements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Strength gains over time</li>
                <li>• Cardiovascular fitness improvements</li>
                <li>• Flexibility and mobility progress</li>
                <li>• Exercise tolerance increases</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Consistency Metrics</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Workout frequency tracking</li>
                <li>• Exercise streak monitoring</li>
                <li>• Goal achievement rates</li>
                <li>• Program adherence scores</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Health Correlations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Energy level improvements</li>
                <li>• Pain reduction trends</li>
                <li>• Sleep quality correlation</li>
                <li>• Mood and wellbeing impact</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-purple-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Progress Tracking Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">For You</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Visual motivation through progress charts</li>
                <li>• Identify patterns in your recovery</li>
                <li>• Celebrate achievements and milestones</li>
                <li>• Adjust goals based on real data</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Your Care Team</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Share progress reports with doctors</li>
                <li>• Evidence-based treatment adjustments</li>
                <li>• Monitor exercise compliance</li>
                <li>• Track recovery milestones</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}