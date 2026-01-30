import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  BedDouble, 
  Check, 
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Heart,
  MessageSquare
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

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

interface SafetyAlert {
  id: number;
  userId: string;
  alertType: string;
  status: string;
  eventType: string;
  eventDate: string;
  details: any;
  createdAt: string;
  recentCheckins: {
    date: string;
    energy: number;
    pain: number;
    safetyStatus: string;
  }[];
}

function EnergyBadge({ level }: { level: number | null }) {
  if (level === null) return null;
  const colors = {
    1: "bg-red-100 text-red-800",
    2: "bg-orange-100 text-orange-800", 
    3: "bg-yellow-100 text-yellow-800",
    4: "bg-info-panel text-action-blue",
    5: "bg-info-panel text-action-blue"
  };
  const labels = {
    1: "Very Low",
    2: "Low",
    3: "Moderate",
    4: "Good",
    5: "Great"
  };
  return (
    <Badge className={colors[level as keyof typeof colors] || "bg-gray-100"}>
      <Battery className="w-3 h-3 mr-1" />
      {labels[level as keyof typeof labels] || level}
    </Badge>
  );
}

function SessionTypeIcon({ type }: { type: string }) {
  if (type === "rest") {
    return <BedDouble className="w-5 h-5 text-blue-500" />;
  }
  if (type === "strength" || type === "exercise") {
    return <Dumbbell className="w-5 h-5 text-purple-500" />;
  }
  return <Activity className="w-5 h-5 text-gray-500" />;
}

function SafetyAlertCard({ alert, onAcknowledge }: { alert: SafetyAlert; onAcknowledge: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  
  const alertColors = {
    RED_IMMEDIATE: "border-red-400 bg-red-50",
    PATTERN_WARNING: "border-orange-300 bg-orange-50",
  };
  
  const eventLabels: Record<string, string> = {
    RED_FLAG: "Red Flag Detected",
    YELLOW_FLAG: "Pattern: Consecutive Yellow Days",
    REPEATED_LOW_ENERGY: "Pattern: Repeated Low Energy",
    REPEATED_HIGH_PAIN: "Pattern: Repeated High Pain",
  };

  return (
    <Card className={`mb-3 ${alertColors[alert.alertType as keyof typeof alertColors] || "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              alert.alertType === "RED_IMMEDIATE" ? "text-red-500" : "text-orange-500"
            }`} />
            <div>
              <p className="font-medium text-gray-900">
                {eventLabels[alert.eventType] || alert.eventType}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {alert.details?.reason || `User: ${alert.userId}`}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(alert.createdAt), "MMM d, h:mm a")} • Event: {alert.eventDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={alert.status === "PENDING" ? "default" : "secondary"}>
              {alert.status}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Recent Check-ins:</p>
              <div className="space-y-1">
                {alert.recentCheckins.map((c, i) => (
                  <div key={i} className="text-xs flex items-center gap-2 text-gray-600">
                    <span>{c.date}</span>
                    <Badge variant="outline" className="text-xs">
                      Energy: {c.energy}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Pain: {c.pain}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={c.safetyStatus === "RED" ? "text-red-600" : c.safetyStatus === "YELLOW" ? "text-yellow-600" : "text-action-blue"}
                    >
                      {c.safetyStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {alert.status !== "ACKNOWLEDGED" && (
              <Button 
                size="sm" 
                onClick={() => onAcknowledge(alert.id)}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FlagCard({ flag, onResolve }: { flag: CoachFlag; onResolve: (id: number, notes: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  
  const severityColors = {
    low: "border-yellow-300 bg-yellow-50",
    medium: "border-orange-300 bg-orange-50",
    high: "border-red-300 bg-red-50"
  };
  
  return (
    <Card className={`mb-3 ${severityColors[flag.severity as keyof typeof severityColors] || "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              flag.severity === "high" ? "text-red-500" : 
              flag.severity === "medium" ? "text-orange-500" : "text-yellow-500"
            }`} />
            <div>
              <p className="font-medium text-gray-900">{flag.title}</p>
              <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(flag.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <Textarea
              placeholder="Add resolution notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mb-3"
            />
            <Button 
              size="sm" 
              onClick={() => onResolve(flag.id, notes)}
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CoachSessions() {
  const patientId = "demo-user";
  
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery<{ sessions: SessionLog[] }>({
    queryKey: ["/api/coach/patient", patientId, "sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/patient/${patientId}/sessions?demo=true&demo-role=specialist`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    }
  });
  
  const { data: flagsData, isLoading: flagsLoading } = useQuery<{ flags: CoachFlag[] }>({
    queryKey: ["/api/coach/flags"],
    queryFn: async () => {
      const res = await fetch("/api/coach/flags?demo=true&demo-role=specialist");
      if (!res.ok) throw new Error("Failed to fetch flags");
      return res.json();
    }
  });
  
  const { data: alertsData } = useQuery<{ ok: boolean; alerts: SafetyAlert[] }>({
    queryKey: ["/api/coach/alerts"],
    queryFn: async () => {
      const res = await fetch("/api/coach/alerts?demo=true&demo-role=specialist");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest(`/api/coach/alerts/${alertId}/acknowledge?demo=true&demo-role=specialist`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/alerts"] });
    }
  });
  
  const resolveMutation = useMutation({
    mutationFn: async ({ flagId, notes }: { flagId: number; notes: string }) => {
      return apiRequest(`/api/coach/flags/${flagId}/resolve?demo=true&demo-role=specialist`, {
        method: "POST",
        body: JSON.stringify({ notes })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/flags"] });
    }
  });
  
  const sessions = sessionsData?.sessions || [];
  const flags = flagsData?.flags || [];
  const alerts = alertsData?.alerts || [];
  const pendingAlerts = alerts.filter(a => a.status !== "ACKNOWLEDGED");
  
  const restSessions = sessions.filter(s => s.sessionType === "rest");
  const exerciseSessions = sessions.filter(s => s.sessionType !== "rest");
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patient Session Review</h1>
        <p className="text-gray-500">Demo Patient - Session History & Flags</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{sessions.length}</div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{restSessions.length}</div>
            <div className="text-sm text-gray-500">Rest Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{flags.length + pendingAlerts.length}</div>
            <div className="text-sm text-gray-500">Open Alerts</div>
          </CardContent>
        </Card>
      </div>

      {pendingAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Safety Alerts
          </h2>
          {pendingAlerts.map(alert => (
            <SafetyAlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
            />
          ))}
        </div>
      )}
      
      {flags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Flags Requiring Review
          </h2>
          {flags.map(flag => (
            <FlagCard 
              key={flag.id} 
              flag={flag} 
              onResolve={(id, notes) => resolveMutation.mutate({ flagId: id, notes })}
            />
          ))}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-600" />
          Session History
        </h2>
        
        {sessionsLoading ? (
          <div className="text-center py-8 text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No sessions recorded yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SessionTypeIcon type={session.sessionType} />
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.sessionType === "rest" ? "Rest Day" : 
                           session.templateCode || "Exercise Session"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(session.date), "EEEE, MMM d")}
                          {session.durationMinutes ? ` • ${session.durationMinutes} min` : ""}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <EnergyBadge level={session.energyLevel} />
                      
                      {session.sessionType === "rest" && session.restReason && (
                        <Badge variant="outline" className="text-blue-600">
                          {session.restReason}
                        </Badge>
                      )}
                      
                      {session.averageRPE && (
                        <Badge variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          RPE {session.averageRPE}
                        </Badge>
                      )}
                      
                      {session.painLevel && session.painLevel > 3 && (
                        <Badge className="bg-red-100 text-red-800">
                          Pain {session.painLevel}/10
                        </Badge>
                      )}
                      
                      {session.isEasyMode && (
                        <Badge variant="secondary">Easy Mode</Badge>
                      )}
                      
                      {!session.coachReviewed && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Needs Review
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {session.coachNotes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5" />
                      {session.coachNotes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
