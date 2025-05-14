import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CoachReviewDashboard } from '@/components/recommendation/coach-review-dashboard';
import { RecommendationReview } from '@/components/recommendation/recommendation-review';

export default function CoachRecommendationsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show unauthorized message
  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Exercise Prescription Review</h1>
        <div className="bg-destructive/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="mb-4">Please log in to access the exercise prescription review panel.</p>
          <Button asChild variant="outline">
            <a href="/api/login">Log In</a>
          </Button>
        </div>
      </div>
    );
  }
  
  // If not a specialist/coach, show unauthorized message
  if (user?.role !== 'specialist') {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Exercise Prescription Review</h1>
        <div className="bg-destructive/10 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Unauthorized Access</h2>
          <p className="mb-4">This area is only accessible to exercise specialists and coaches.</p>
          <Button asChild variant="outline">
            <a href="/">Return to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Exercise Prescription Review</h1>
      
      {selectedAssessmentId ? (
        <RecommendationReview 
          assessmentId={selectedAssessmentId}
          onBack={() => setSelectedAssessmentId(null)}
        />
      ) : (
        <CoachReviewDashboard />
      )}
    </div>
  );
}