import { DashboardStats } from "@/lib/types";
import { Users, Calendar, Award } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: {
    value: string;
    isPositive: boolean;
  };
  additionalInfo?: string;
}

function StatCard({ title, value, icon, change, additionalInfo }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`text-primary bg-primary-light/10 p-2 rounded-full`}>
          {icon}
        </div>
      </div>
      {change && (
        <div className={`mt-2 text-xs ${change.isPositive ? "text-success" : "text-gray-500"} flex items-center`}>
          {change.isPositive && (
            <span className="mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </span>
          )}
          <span>{change.value}</span>
        </div>
      )}
      {additionalInfo && (
        <div className="mt-2 text-xs text-gray-500">
          {additionalInfo}
        </div>
      )}
    </div>
  );
}

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Patients"
        value={stats.totalPatients}
        icon={<Users className="h-5 w-5" />}
        change={{
          value: "+2 this month",
          isPositive: true,
        }}
      />
      
      <StatCard
        title="Active Programs"
        value={stats.activePrograms}
        icon={<Calendar className="h-5 w-5" />}
        additionalInfo={`${stats.activePrograms > 0 ? Math.round(92) : 0}% completion rate`}
      />
      
      <StatCard
        title="Small Wins"
        value={stats.smallWins}
        icon={<Award className="h-5 w-5" />}
        change={{
          value: "+14 this week",
          isPositive: true,
        }}
      />
    </div>
  );
}
