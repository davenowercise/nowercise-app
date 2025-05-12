import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { PatientActivityFeed } from "@/components/dashboard/patient-activity-feed";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";
import { PatientPrograms } from "@/components/dashboard/patient-programs";
import { SmallWinsCard } from "@/components/dashboard/small-wins-card";
import { DashboardStats, PatientActivity, SessionAppointment, User } from "@/lib/types";

export default function Dashboard() {
  const [today] = useState(new Date());

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/specialist/dashboard-stats"],
  });

  // Fetch patient activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<PatientActivity[]>({
    queryKey: ["/api/specialist/patient-activities", { limit: 10 }],
  });

  // Fetch sessions for today
  const { data: todaySessions, isLoading: sessionsLoading } = useQuery<SessionAppointment[]>({
    queryKey: ["/api/specialist/today-sessions"],
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: upcomingSessionsLoading } = useQuery<SessionAppointment[]>({
    queryKey: ["/api/specialist/upcoming-sessions", { days: 2 }],
  });

  // Fetch patients for the specialist
  const { data: patients, isLoading: patientsLoading } = useQuery<User[]>({
    queryKey: ["/api/specialist/patients"],
  });

  // Count tomorrow's sessions from upcoming sessions
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(today.getDate() + 1);
  const tomorrowDateStr = format(tomorrowDate, "yyyy-MM-dd");
  
  const tomorrowSessionsCount = upcomingSessions?.filter(
    (session) => session.date === tomorrowDateStr
  ).length || 0;

  // Prepare program assignments with patient info
  const { data: programAssignments, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/specialist/program-assignments"],
    // In a real application, this would be implemented as a proper endpoint
    // Here we're using empty data since we don't have the actual endpoint
    enabled: false,
  });

  // Default values if data is not loaded yet
  const defaultStats: DashboardStats = {
    totalPatients: 0,
    activePrograms: 0,
    smallWins: 0,
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Specialist Dashboard</h1>
        <p className="text-gray-500">{format(today, "EEEE, MMMM d, yyyy")}</p>
      </div>

      <StatsOverview stats={stats || defaultStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PatientActivityFeed 
          activities={activities || []} 
          isLoading={activitiesLoading} 
        />

        <div>
          <UpcomingSessions
            todaySessions={todaySessions || []}
            tomorrowSessionsCount={tomorrowSessionsCount}
            patients={patients || []}
            isLoading={sessionsLoading || patientsLoading || upcomingSessionsLoading}
            isSpecialist={true}
          />
          
          <SmallWinsCard />
        </div>
      </div>

      <div className="mt-6">
        <PatientPrograms
          programAssignments={programAssignments || []}
          isLoading={programsLoading || patientsLoading}
        />
      </div>
    </>
  );
}
