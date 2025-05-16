import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';

export function DemoFeaturesCard() {
  return (
    <Card className="overflow-hidden border-2 border-blue-100">
      <CardHeader className="bg-blue-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Sparkles className="h-5 w-5 text-blue-500" />
          New Features Available
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Try out these new features we're developing for Nowercise:
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <Link href="/workout-plan">
              <Button className="w-full" variant="outline" size="sm">
                Workout Planner
              </Button>
            </Link>
            
            <Link href="/parq-demo">
              <Button className="w-full" variant="outline" size="sm">
                PAR-Q Screening
              </Button>
            </Link>
          </div>
          
          <Link href="/demo-features">
            <Button className="w-full mt-2" size="sm">
              View All Demo Features
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}