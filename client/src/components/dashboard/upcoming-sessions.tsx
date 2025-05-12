import { DashboardCard } from "@/components/ui/dashboard-card";
import { SessionAppointment, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, MoreVertical, Plus, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SessionItemProps {
  session: SessionAppointment;
  patient: User;
  isSpecialist: boolean;
}

function SessionItem({ session, patient, isSpecialist }: SessionItemProps) {
  const getStatusIcon = () => {
    if (session.status === "completed") {
      return <Check className="h-5 w-5 text-success" />;
    } else if (session.status === "scheduled") {
      return <Clock className="h-5 w-5 text-warning" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
            <AvatarImage 
              src={isSpecialist ? patient?.profileImageUrl : undefined} 
              alt={isSpecialist ? (patient?.firstName || "") : ""} 
            />
            <AvatarFallback className="bg-primary-light text-white">
              {isSpecialist ? getInitials(patient?.firstName, patient?.lastName) : "SP"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-800">
              {isSpecialist 
                ? (patient?.firstName ? `${patient.firstName} ${patient.lastName || ""}` : "Patient") 
                : "Specialist"}
            </p>
            <p className="text-xs text-gray-500">
              {session.time} - {session.type.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {getStatusIcon()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

interface UpcomingSessionsProps {
  todaySessions: SessionAppointment[];
  tomorrowSessionsCount: number;
  patients: User[];
  isLoading: boolean;
  isSpecialist?: boolean;
}

export function UpcomingSessions({
  todaySessions,
  tomorrowSessionsCount,
  patients,
  isLoading,
  isSpecialist = true
}: UpcomingSessionsProps) {
  const getPatientById = (patientId: string): User => {
    return patients.find(p => p.id === patientId) || {
      id: patientId,
      role: "patient",
      createdAt: "",
      updatedAt: ""
    };
  };

  const today = new Date();
  const formattedDate = format(today, "MMM d, yyyy");

  return (
    <DashboardCard title="Upcoming Sessions">
      <div className="bg-primary-light/10 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">Today, {formattedDate}</p>
            <p className="font-semibold text-primary">
              {isLoading ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                `${todaySessions.length} patient check-in${todaySessions.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>
          <Button size="sm" className="bg-primary text-white flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-5 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full mr-1" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            </div>
          ))
        ) : todaySessions.length > 0 ? (
          todaySessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              patient={getPatientById(session.patientId)}
              isSpecialist={isSpecialist}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No sessions scheduled for today</p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-500">Tomorrow, {format(new Date(today.getTime() + 86400000), "MMM d, yyyy")}</p>
        <div className="mt-2 flex justify-between items-center text-gray-600 text-sm">
          <span>
            {isLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              `${tomorrowSessionsCount} session${tomorrowSessionsCount !== 1 ? 's' : ''} scheduled`
            )}
          </span>
          <Button variant="link" size="sm" className="text-primary text-xs p-0 h-auto flex items-center">
            View
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}
