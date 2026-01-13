import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  BedDouble, 
  Check, 
  Dumbbell,
  Heart,
  Pause,
  Wind,
  Leaf,
  Clock
} from "lucide-react";

interface SessionLog {
  id: number;
  date: string;
  sessionType: string;
  templateCode: string | null;
  durationMinutes: number | null;
  energyLevel: number | null;
  painLevel: number | null;
  painQuality: string | null;
  averageRPE: number | null;
  restReason: string | null;
  wasPlannedRest: boolean | null;
  exercisesCompleted: number | null;
  exercisesTotal: number | null;
  isEasyMode: boolean | null;
  completed: boolean;
  patientNote: string | null;
  coachReviewed: boolean | null;
  coachNotes: string | null;
  createdAt: string;
}

interface CoachFlag {
  id: number;
  userId: string;
  flagType: string;
  severity: string;
  title: string;
  description: string;
  context: any;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
}

interface ProgressionPause {
  id: number;
  reason: string;
  startedAt: string;
  endedAt: string | null;
}

function EnergyIndicator({ level }: { level: number | null }) {
  if (level === null) return <span className="text-gray-400">-</span>;
  const colors = ["", "text-red-600", "text-orange-500", "text-yellow-500", "text-green-500", "text-emerald-600"];
  const labels = ["", "Very Low", "Low", "Moderate", "Good", "Great"];
  return (
    <span className={`font-medium ${colors[level]}`}>
      {level}/5 ({labels[level]})
    </span>
  );
}

function SessionTypeIcon({ type }: { type: string }) {
  const icons: Record<string, any> = {
    rest: BedDouble,
    strength: Dumbbell,
    walk: Wind,
    mobility: Leaf,
    skipped: AlertTriangle
  };
  const Icon = icons[type] || Activity;
  const colors: Record<string, string> = {
    rest: "text-blue-500",
    strength: "text-purple-500",
    walk: "text-green-500",
    mobility: "text-teal-500",
    skipped: "text-gray-400"
  };
  return <Icon className={`w-5 h-5 ${colors[type] || "text-gray-500"}`} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    low: "bg-yellow-100 text-yellow-800 border-yellow-300",
    medium: "bg-orange-100 text-orange-800 border-orange-300",
    high: "bg-red-100 text-red-800 border-red-300"
  };
  return (
    <Badge className={`${styles[severity]} border`}>
      {severity.toUpperCase()}
    </Badge>
  );
}

export default function DevPatientLog() {
  const patientId = "demo-user";
  
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<{ sessions: SessionLog[] }>({
    queryKey: ["/api/coach/patient", patientId, "sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/patient/${patientId}/sessions?demo=true&demo-role=specialist&limit=50`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    }
  });
  
  const { data: flagsData, isLoading: flagsLoading } = useQuery<{ flags: CoachFlag[] }>({
    queryKey: ["/api/coach/flags/all"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/patient/${patientId}/flags?demo=true&demo-role=specialist`);
      if (!res.ok) {
        const allFlags = await fetch("/api/coach/flags?demo=true&demo-role=specialist");
        return allFlags.json();
      }
      return res.json();
    }
  });
  
  const { data: pausesData } = useQuery<{ pauses: ProgressionPause[] }>({
    queryKey: ["/api/coach/patient", patientId, "pauses"],
    queryFn: async () => {
      const res = await fetch(`/api/pathway/progression-pauses?demo=true`);
      if (!res.ok) return { pauses: [] };
      return res.json();
    }
  });
  
  const sessions = sessionsData?.sessions || [];
  const flags = flagsData?.flags || [];
  const pauses = pausesData?.pauses || [];
  
  const stats = {
    total: sessions.length,
    strength: sessions.filter(s => s.sessionType === 'strength').length,
    walk: sessions.filter(s => s.sessionType === 'walk').length,
    rest: sessions.filter(s => s.sessionType === 'rest').length,
    completed: sessions.filter(s => s.completed).length,
    openFlags: flags.filter(f => !f.resolved).length
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center gap-2 text-orange-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-medium">DEV ONLY - Patient Activity Log</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Demo Patient Session History</h1>
        <p className="text-gray-500">Complete telemetry view for supervised dry run</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.strength}</div>
            <div className="text-xs text-gray-500">Strength</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.walk}</div>
            <div className="text-xs text-gray-500">Walks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.rest}</div>
            <div className="text-xs text-gray-500">Rest</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card className={stats.openFlags > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-3 text-center">
            <div className={`text-2xl font-bold ${stats.openFlags > 0 ? "text-red-600" : "text-gray-400"}`}>
              {stats.openFlags}
            </div>
            <div className="text-xs text-gray-500">Open Flags</div>
          </CardContent>
        </Card>
      </div>

      {flags.filter(f => !f.resolved).length > 0 && (
        <Card className="mb-6 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Active Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flags.filter(f => !f.resolved).map(flag => (
                <div key={flag.id} className="flex items-start gap-3 p-3 bg-white rounded border">
                  <SeverityBadge severity={flag.severity} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{flag.title}</p>
                    <p className="text-sm text-gray-600">{flag.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(flag.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {pauses.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
              <Pause className="w-5 h-5" />
              Progression Pauses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pauses.map(pause => (
                <div key={pause.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                  <span className="text-sm font-medium">{pause.reason}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(pause.startedAt), "MMM d")}
                    {pause.endedAt ? ` - ${format(new Date(pause.endedAt), "MMM d")}` : " (active)"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Session Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sessions recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Choice</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Energy</th>
                    <th className="py-2 px-2">Pain</th>
                    <th className="py-2 px-2">RPE</th>
                    <th className="py-2 px-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="font-medium">{format(new Date(session.date), "MMM d")}</div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(session.date), "EEE")}
                          {session.createdAt && (
                            <span className="ml-1 text-gray-300">
                              @ {format(new Date(session.createdAt), "h:mm a")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <SessionTypeIcon type={session.sessionType} />
                          <div>
                            <div className="font-medium capitalize">{session.sessionType}</div>
                            {session.templateCode && (
                              <div className="text-xs text-gray-400">{session.templateCode}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {session.sessionType === 'skipped' ? (
                          <Badge className="bg-gray-100 text-gray-600">
                            Skipped
                          </Badge>
                        ) : session.completed ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" /> Done
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-200">
                            Stopped early
                          </Badge>
                        )}
                        {session.isEasyMode && (
                          <Badge variant="secondary" className="ml-1 text-xs">Easy</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <EnergyIndicator level={session.energyLevel} />
                      </td>
                      <td className="py-3 px-2">
                        {session.painLevel ? (
                          <span className={session.painLevel > 5 ? "text-red-600 font-medium" : ""}>
                            {session.painLevel}/10
                            {session.painQuality && session.painQuality !== 'normal' && (
                              <span className="text-red-500 text-xs ml-1">({session.painQuality})</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {session.averageRPE ? (
                          <span className={session.averageRPE >= 8 ? "text-orange-600 font-medium" : ""}>
                            {session.averageRPE}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 max-w-xs space-y-1">
                        {session.patientNote && (
                          <p className="text-xs text-gray-600 italic">"{session.patientNote}"</p>
                        )}
                        {session.restReason && (
                          <Badge variant="outline" className="text-blue-600 text-xs">
                            Rest: {session.restReason}
                          </Badge>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          {session.durationMinutes && session.durationMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {session.durationMinutes}m
                            </span>
                          )}
                          {session.exercisesCompleted !== null && session.exercisesTotal && session.exercisesTotal > 0 && (
                            <span>
                              {session.exercisesCompleted}/{session.exercisesTotal} ex
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {flags.filter(f => f.resolved).length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-500">Resolved Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flags.filter(f => f.resolved).map(flag => (
                <div key={flag.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded border text-gray-500">
                  <SeverityBadge severity={flag.severity} />
                  <div className="flex-1">
                    <p className="font-medium">{flag.title}</p>
                    <p className="text-xs">
                      Resolved {flag.resolvedAt ? format(new Date(flag.resolvedAt), "MMM d") : ""}
                      {flag.resolutionNotes && ` - ${flag.resolutionNotes}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
