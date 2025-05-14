import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleAlert, CheckCircle, Calendar, User } from 'lucide-react';

export function CoachReviewDashboard() {
  const { toast } = useToast();
  
  // Fetch pending recommendations that need coach review
  const { 
    data: pendingRecommendations = [], 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['/api/coach/recommendations/pending'],
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md my-4">
        <h3 className="font-semibold mb-2">Error Loading Recommendations</h3>
        <p className="text-sm">There was a problem loading the pending recommendations. Please try again later.</p>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          className="mt-2"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  // If no pending recommendations, show message
  if (pendingRecommendations.length === 0) {
    return (
      <Card className="my-4">
        <CardHeader>
          <CardTitle>No Pending Reviews</CardTitle>
          <CardDescription>
            All exercise recommendations have been reviewed. Check back later for new submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <CheckCircle className="h-12 w-12 text-primary/50" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Pending Exercise Recommendations</h2>
        <Badge variant="outline" className="font-normal text-sm flex gap-1">
          <CircleAlert className="h-4 w-4" /> 
          {pendingRecommendations.length} Pending
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pendingRecommendations.map((rec) => (
          <Card key={rec.assessmentId} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {rec.userName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Check-in from {rec.checkInDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Recommendation Tier</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={rec.tier === 1 ? "destructive" : rec.tier === 2 ? "secondary" : rec.tier === 3 ? "default" : "outline"}
                    >
                      Tier {rec.tier} 
                      {rec.tier === 1 && " (Gentle)"}
                      {rec.tier === 2 && " (Moderate)"}
                      {rec.tier === 3 && " (Progressive)"}
                      {rec.tier === 4 && " (Challenging)"}
                    </Badge>
                  </div>
                </div>
                
                {rec.riskFlags && rec.riskFlags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Risk Flags</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.riskFlags.map((flag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default"
                className="w-full"
                asChild
              >
                <Link to={`/coach/recommendations/${rec.assessmentId}`}>
                  Review Recommendations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}