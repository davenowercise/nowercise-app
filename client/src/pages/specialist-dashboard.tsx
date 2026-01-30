import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, User, Heart, Activity, FileText, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  cancerType: string;
  cancerStage: string;
  treatmentStage: string;
  energyLevel: number;
  mobilityStatus: number;
  painLevel: number;
  fatigueLevel: number;
  createdAt: string;
  prescriptionGenerated: boolean;
}

export default function SpecialistDashboard() {
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/specialist/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getEnergyBadgeColor = (level: number) => {
    if (level >= 8) return "bg-info-panel text-action-blue";
    if (level >= 6) return "bg-yellow-100 text-yellow-800";
    if (level >= 4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getTreatmentStageBadge = (stage: string) => {
    const colors = {
      "pre-treatment": "bg-blue-100 text-blue-800",
      "during-treatment": "bg-purple-100 text-purple-800",
      "post-treatment": "bg-info-panel text-action-blue",
      "survivorship": "bg-info-panel text-action-blue"
    };
    return colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Specialist Dashboard</h1>
        <p className="text-gray-600">Manage your cancer exercise therapy patients</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active patient profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients?.filter(p => {
                const created = new Date(p.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">New patient registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients?.filter(p => p.prescriptionGenerated).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">AI-generated exercise plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Energy Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients?.length ? Math.round(patients.reduce((sum, p) => sum + p.energyLevel, 0) / patients.length) : 0}/10
            </div>
            <p className="text-xs text-muted-foreground">Patient-reported energy</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Patients ({patients?.length || 0})</TabsTrigger>
          <TabsTrigger value="new">New This Week</TabsTrigger>
          <TabsTrigger value="active">Active Programs</TabsTrigger>
          <TabsTrigger value="needs-attention">Needs Attention</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {patients?.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(patient.firstName, patient.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div>{patient.email}</div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span>Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}</span>
                            <span>•</span>
                            <span>Joined: {format(new Date(patient.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm">View Profile</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Cancer Details</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">{patient.cancerType}</Badge>
                        <div className="text-sm text-gray-600">{patient.cancerStage}</div>
                        {patient.treatmentStage && (
                          <Badge className={getTreatmentStageBadge(patient.treatmentStage)}>
                            {patient.treatmentStage.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Physical Status</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Energy:</span>
                          <Badge className={getEnergyBadgeColor(patient.energyLevel)}>
                            {patient.energyLevel}/10
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Mobility:</span>
                          <span className="font-medium">{patient.mobilityStatus}/10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pain:</span>
                          <span className="font-medium">{patient.painLevel}/10</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Exercise Plan</h4>
                      <div className="space-y-1">
                        {patient.prescriptionGenerated ? (
                          <Badge className="bg-info-panel text-action-blue">
                            ✓ AI Prescription Ready
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            ⏳ Generating Prescription
                          </Badge>
                        )}
                        <div className="text-sm text-gray-600">
                          Tier: Based on assessment
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          View Prescription
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Update Assessment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!patients?.length && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients yet</h3>
                    <p className="text-gray-600 mb-4">
                      Patients will appear here once they complete their intake forms
                    </p>
                    <Button>
                      <a href="/patient-intake?demo=true" className="flex items-center">
                        View Patient Intake Form
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Patients This Week</h3>
            <p className="text-gray-600">
              {patients?.filter(p => {
                const created = new Date(p.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created > weekAgo;
              }).length || 0} new patient registrations
            </p>
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Programs</h3>
            <p className="text-gray-600">Program assignments and tracking coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="needs-attention" className="mt-6">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Patients Needing Attention</h3>
            <p className="text-gray-600">Alert system for patient care coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}