import { EnhancedOnboarding } from '@/components/onboarding/enhanced-onboarding';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Target, Brain, Heart, Activity } from 'lucide-react';

export default function EnhancedOnboardingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold">Welcome to Your Journey</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete your comprehensive assessment to get a personalized exercise program
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <CardTitle className="text-lg">Cancer-Specific</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tailored assessment based on your cancer type and treatment stage
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Safety First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                PAR-Q+ screening ensures your exercise program is safe and appropriate
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Comprehensive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Complete physical and lifestyle assessment for personalized results
              </p>
            </CardContent>
          </Card>
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

        <div className="mt-8 bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Evidence-Based Approach</h2>
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