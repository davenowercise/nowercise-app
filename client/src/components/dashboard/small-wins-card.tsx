import { DashboardCard } from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function SmallWinsCard() {
  const { data: weeklyWins, isLoading } = useQuery<{ count: number }>({
    queryKey: ["/api/small-wins/count/week"],
  });

  const winCount = weeklyWins?.count || 0;
  
  // Calculate percentage progress towards weekly goal (arbitrary 100 wins per week goal)
  const weeklyGoal = 100;
  const progressPercentage = Math.min(Math.round((winCount / weeklyGoal) * 100), 100);
  
  // Fake distribution data - in a real app these would come from the API
  const exercisesCompleted = Math.round(winCount * 0.65);
  const painReduced = Math.round(winCount * 0.30);
  const other = winCount - exercisesCompleted - painReduced;

  return (
    <DashboardCard 
      title="Weekly Small Wins"
      className="mt-6"
      headerAction={
        <div className="flex items-center">
          <Award className="text-accent mr-2 h-5 w-5" />
        </div>
      }
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">Total small wins this week</p>
        {isLoading ? (
          <Skeleton className="h-7 w-10" />
        ) : (
          <p className="text-xl font-bold text-accent">{winCount}</p>
        )}
      </div>
      
      {isLoading ? (
        <Skeleton className="h-3 w-full rounded-full mb-4" />
      ) : (
        <div className="bg-gray-100 rounded-full h-3 mb-4">
          <div 
            className="bg-accent h-3 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {isLoading ? (
          <>
            <Skeleton className="h-20 rounded" />
            <Skeleton className="h-20 rounded" />
          </>
        ) : (
          <>
            <div className="bg-accent-light/10 rounded p-2 text-center">
              <p className="text-sm text-gray-600">Exercises Completed</p>
              <p className="text-xl font-bold text-accent">{exercisesCompleted}</p>
            </div>
            <div className="bg-primary-light/10 rounded p-2 text-center">
              <p className="text-sm text-gray-600">Pain Reduced</p>
              <p className="text-xl font-bold text-primary">{painReduced}</p>
            </div>
          </>
        )}
      </div>
      
      <Button 
        className="w-full bg-accent text-white py-2 rounded-md font-medium flex items-center justify-center"
        disabled={isLoading}
      >
        <CustomPartyPopper className="mr-2 h-5 w-5" />
        Send Group Encouragement
      </Button>
    </DashboardCard>
  );
}

// Add the CustomPartyPopper icon since Lucide might not have it
function CustomPartyPopper(props: React.SVGProps<SVGSVGElement>) {
  // Add displayName for React DevTools
  CustomPartyPopper.displayName = "CustomPartyPopper";
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5.8 11.3 2 22l10.7-3.79"></path>
      <path d="M4 3h.01"></path>
      <path d="M22 8h.01"></path>
      <path d="M15 2h.01"></path>
      <path d="M22 20h.01"></path>
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"></path>
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"></path>
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"></path>
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"></path>
    </svg>
  );
}
