import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  FileText, 
  Mail, 
  Phone,
  Heart,
  Activity,
  Users,
  Clock,
  Info
} from 'lucide-react';

export default function MedicalClearancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Medical Clearance Guide</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your safety is our priority. This guide helps you get proper medical clearance for exercise.
          </p>
        </div>

        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-amber-800">Medical Clearance Required</p>
              <p className="text-amber-700">
                Based on your assessment responses, we recommend consulting with your healthcare provider before starting any exercise program. This is a safety measure to ensure the program is appropriate for your specific health condition.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                When Is Clearance Needed?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">PAR-Q+ assessment with any "Yes" answers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Modified or restricted exercise clearance</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">High-risk conditions (heart disease, diabetes, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">High pain levels (7+ out of 10)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Very low energy during active treatment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Who Can Provide Clearance?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Your oncologist or cancer care team</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">General practitioner (GP)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Specialist physician</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Exercise physiologist</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Physiotherapist</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Step-by-Step Process
            </CardTitle>
            <CardDescription>
              Follow these steps to get your medical clearance efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complete PAR-Q+ Assessment</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Take the comprehensive Physical Activity Readiness Questionnaire to identify any health concerns.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/parq-demo'}>
                    Take PAR-Q+ Assessment
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Contact Your Healthcare Provider</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Reach out to your oncologist, GP, or cancer care team to discuss exercise clearance.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Script
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Download Clearance Letter</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Use our pre-filled letter to make the process easier for your healthcare provider.
                  </p>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Medical Letter (PDF)
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Return to Nowercise</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Once you have medical clearance, return to complete your onboarding and start your personalized program.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => window.location.href = '/enhanced-onboarding'}>
                    <Activity className="h-4 w-4 mr-2" />
                    Continue Onboarding
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              Need Personal Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">Direct Support Available</p>
              <p className="text-sm text-blue-700 mb-4">
                I can personally guide you through the medical clearance process and provide a customized letter for your healthcare provider.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Email: davenowercise@gmail.com
                </Button>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Personal response within 24 hours
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-green-800">Important Reminder</p>
              <p className="text-green-700">
                You'll be able to restart your Nowercise plan as soon as you have medical clearance. This process ensures your exercise program is both safe and effective for your specific health condition.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}