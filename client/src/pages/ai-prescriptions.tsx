import { PrescriptionGenerator } from '@/components/ai-prescription/prescription-generator';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Target, Shield } from 'lucide-react';

export default function AIPrescriptionsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">AI Exercise Prescriptions</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized, scientifically-validated exercise programs powered by artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">AI-Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Advanced algorithms analyze your cancer type, treatment stage, and physical assessment
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-8 w-8 mx-auto mb-2 text-action-blue" />
              <CardTitle className="text-lg">Evidence-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Based on ACSM guidelines and latest research in cancer exercise medicine
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Personalized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tailored to your specific needs, limitations, and fitness goals
              </p>
            </CardContent>
          </Card>
        </div>

        <PrescriptionGenerator />

        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Assessment</h3>
              <p className="text-sm text-gray-600">Complete your cancer and physical assessment</p>
            </div>
            <div className="text-center">
              <div className="bg-info-panel rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-action-blue font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Analysis</h3>
              <p className="text-sm text-gray-600">AI analyzes your data against medical guidelines</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Generation</h3>
              <p className="text-sm text-gray-600">Custom exercise prescription is created</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Adaptation</h3>
              <p className="text-sm text-gray-600">Program adapts based on your progress</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Safety First</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• All prescriptions follow evidence-based medical guidelines</li>
            <li>• Programs are automatically adjusted based on your treatment stage</li>
            <li>• Safety checks ensure exercises are appropriate for your condition</li>
            <li>• Regular assessments help adapt the program as you progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}