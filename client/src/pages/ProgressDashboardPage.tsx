import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProgressDashboard from '@/components/workout/ProgressDashboard';

const ProgressDashboardPage = () => {
  return (
    <div className="p-4 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Progress Tracking</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <ProgressDashboard />
      </div>
    </div>
  );
};

export default ProgressDashboardPage;