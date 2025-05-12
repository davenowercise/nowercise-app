import { PatientActivity } from "@/lib/types";
import { DashboardCard, ViewAllAction } from "@/components/ui/dashboard-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDistanceToNow } from "@/lib/utils";
import { Award, AlertTriangle, MessageSquare, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

interface ActivityItemProps {
  activity: PatientActivity;
  onAction: (action: string, activityId: number) => void;
  isLoading?: boolean;
}

function ActivityItem({ activity, onAction, isLoading = false }: ActivityItemProps) {
  const getStatusBadge = () => {
    if (activity.type === "workout_log" && activity.data.completed) {
      return (
        <Badge className="bg-accent-light/20 text-accent text-xs font-medium rounded-full px-2 py-1 flex items-center mr-2">
          <Award className="h-3 w-3 mr-1" />
          Small Win
        </Badge>
      );
    } else if (activity.type === "workout_log" && !activity.data.completed) {
      return (
        <Badge className="bg-error/10 text-error text-xs font-medium rounded-full px-2 py-1 flex items-center mr-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs attention
        </Badge>
      );
    } else if (activity.type === "milestone") {
      return (
        <Badge className="bg-success/10 text-success text-xs font-medium rounded-full px-2 py-1 flex items-center mr-2">
          <Trophy className="h-3 w-3 mr-1" />
          Milestone
        </Badge>
      );
    } else if (activity.type === "message") {
      return null;
    }
  };

  const getActionButton = () => {
    if (activity.type === "workout_log" && activity.data.completed) {
      return (
        <Button
          variant="link"
          size="sm"
          className="text-primary text-xs p-0 h-auto"
          onClick={() => onAction("encourage", activity.data.id)}
          disabled={isLoading}
        >
          Send encouragement
        </Button>
      );
    } else if (activity.type === "workout_log" && !activity.data.completed) {
      return (
        <Button
          variant="link"
          size="sm"
          className="text-primary text-xs p-0 h-auto"
          onClick={() => onAction("adjust", activity.data.id)}
          disabled={isLoading}
        >
          Adjust plan
        </Button>
      );
    } else if (activity.type === "milestone") {
      return (
        <Button
          variant="link"
          size="sm"
          className="text-primary text-xs p-0 h-auto"
          onClick={() => onAction("congratulate", activity.data.id)}
          disabled={isLoading}
        >
          Send congratulations
        </Button>
      );
    } else if (activity.type === "message") {
      return (
        <Button
          variant="link"
          size="sm"
          className="text-primary text-xs p-0 h-auto flex items-center"
          onClick={() => onAction("reply", activity.data.id)}
          disabled={isLoading}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Reply to message
        </Button>
      );
    }
  };

  const getActivityContent = () => {
    if (activity.type === "workout_log" && activity.data.completed) {
      return (
        <span>
          Completed <span className="font-medium">Exercise Session</span> and logged{" "}
          {activity.data.fatigueLevel ? `${getFatigueText(activity.data.fatigueLevel)} fatigue (${activity.data.fatigueLevel}/5)` : "their progress"}.
        </span>
      );
    } else if (activity.type === "workout_log" && !activity.data.completed) {
      return (
        <span>
          Missed scheduled <span className="font-medium">Exercise Session</span>
          {activity.data.notes ? ` due to ${activity.data.notes}` : ""}.
        </span>
      );
    } else if (activity.type === "milestone") {
      return <span>{activity.data.description}</span>;
    } else if (activity.type === "message") {
      return (
        <span>
          Sent you a message about <span className="font-medium">{activity.data.content.substring(0, 30)}...</span>
        </span>
      );
    }
    
    return <span>Interacted with the platform</span>;
  };
  
  const getFatigueText = (level: number) => {
    const levels = ["none", "minimal", "mild", "moderate", "severe", "extreme"];
    return levels[level] || "moderate";
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <Avatar className="w-10 h-10 mr-3 flex-shrink-0">
          <AvatarImage src={activity.patient.profileImageUrl} alt={activity.patient.firstName || ""} />
          <AvatarFallback className="bg-primary-light text-white">
            {getInitials(activity.patient.firstName, activity.patient.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <p className="font-medium text-gray-800">
              {activity.patient.firstName
                ? `${activity.patient.firstName} ${activity.patient.lastName || ""}`
                : activity.patient.email || "Patient"}
            </p>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.createdAt))}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1">{getActivityContent()}</p>
          <div className="mt-2 flex items-center">
            {getStatusBadge()}
            {getActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PatientActivityFeedProps {
  activities: PatientActivity[];
  isLoading: boolean;
}

export function PatientActivityFeed({ activities, isLoading }: PatientActivityFeedProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleAction = async (action: string, activityId: number) => {
    setActionLoading(activityId);
    
    try {
      if (action === "encourage" || action === "congratulate") {
        // For simplicity, both are handled as celebrating a small win
        await apiRequest("POST", `/api/small-wins/${activityId}/celebrate`, {});
        
        toast({
          title: "Success!",
          description: action === "encourage" ? "Encouragement sent successfully" : "Congratulations sent successfully",
        });
      } else if (action === "adjust") {
        // In a real app, this would open a modal to adjust the plan
        toast({
          title: "Plan adjustment",
          description: "This would open a modal to adjust the workout plan",
        });
      } else if (action === "reply") {
        // In a real app, this would navigate to the messaging interface
        toast({
          title: "Messaging",
          description: "This would navigate to the messaging interface",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/specialist/patient-activities"] });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "There was a problem processing your request.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardCard
      title="Recent Patient Activity"
      headerAction={<ViewAllAction href="/patients" />}
      className="lg:col-span-2"
    >
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start">
                <Skeleton className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="mt-2 flex">
                    <Skeleton className="h-6 w-24 mr-2 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity, index) => (
            <ActivityItem
              key={`${activity.type}-${activity.createdAt}-${index}`}
              activity={activity}
              onAction={handleAction}
              isLoading={actionLoading === activity.data.id}
            />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No recent patient activity to display.</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
