import { EnhancedOnboarding } from '@/components/onboarding/enhanced-onboarding';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Target, Brain, Heart, Activity } from 'lucide-react';

export default function EnhancedOnboardingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-info-panel via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="card-comfort p-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-info-panel to-info-panel rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome, Brave Warrior! 🌟</h1>
                <p className="text-lg text-gray-600">You've taken the first step - we're here to support you</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-info-panel to-info-panel p-4 rounded-xl mb-4">
              <p className="text-xl text-action-blue font-medium">
                ✨ Every journey begins with a single step - yours starts here
              </p>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We'll ask you some questions to create a safe, personalized exercise program just for you. 
              Take your time - there's no rush. ❤️
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="encouragement-card p-6 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Made for You ❤️</h3>
            <p className="text-gray-700 leading-relaxed">
              Created specifically for cancer patients and survivors by experts who understand your unique needs
            </p>
          </div>

          <div className="encouragement-card p-6 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Your Safety First 🛡️</h3>
            <p className="text-gray-700 leading-relaxed">
              Every exercise is carefully screened and adapted to be safe for your current treatment and health status
            </p>
          </div>

          <div className="encouragement-card p-6 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Small Wins Matter 🎯</h3>
            <p className="text-gray-700 leading-relaxed">
              We'll start gentle and celebrate every step forward. Progress, not perfection, is the goal
            </p>
          </div>
        </div>

        <EnhancedOnboarding />

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-green-500" />
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Assessment Areas</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Personal and medical history</li>
                <li>• Cancer type and treatment details</li>
                <li>• Physical capabilities and limitations</li>
                <li>• Lifestyle preferences and goals</li>
                <li>• PAR-Q+ safety screening</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Your Results</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Exercise tier recommendation (1-4)</li>
                <li>• Personalized safety guidelines</li>
                <li>• Activity recommendations</li>
                <li>• Medical clearance guidance</li>
                <li>• Custom program access</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-info-panel rounded-lg p-6 border border-info-border">
          <h2 className="text-xl font-bold text-action-blue mb-4">Evidence-Based Approach</h2>
          <p className="text-sm text-gray-700 mb-4">
            Our assessment follows guidelines from leading cancer organizations:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge variant="outline" className="justify-center py-2">ACSM</Badge>
            <Badge variant="outline" className="justify-center py-2">ACS</Badge>
            <Badge variant="outline" className="justify-center py-2">NCCN</Badge>
            <Badge variant="outline" className="justify-center py-2">ASCO</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}