import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, PatientProfile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Calendar, 
  FilePieChart,
  ArrowUpRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Patients() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patients
  const { data: patients, isLoading, refetch } = useQuery<(User & { profile?: PatientProfile })[]>({
    queryKey: ["/api/specialist/patients"],
  });

  // Filter patients based on search term
  const filteredPatients = patients?.filter(
    (patient) =>
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.profile?.cancerType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPatient = async () => {
    if (!patientEmail) {
      toast({
        title: "Email required",
        description: "Please enter the patient's email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/specialist/assign-patient", {
        patientEmail,
      });

      toast({
        title: "Patient added",
        description: "Patient has been successfully added to your list",
      });

      setPatientEmail("");
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Failed to add patient",
        description: "Please check the email and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-800">My Patients</h1>
          <p className="text-gray-500">Manage and view all your patient profiles</p>
        </div>

        <div className="flex mt-4 md:mt-0 w-full md:w-auto space-x-2">
          <div className="relative flex-grow md:flex-grow-0">
            <Input
              type="text"
              placeholder="Search patients..."
              className="pl-8 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>
                  Enter the email address of the patient you want to add to your list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Patient Email</Label>
                  <Input
                    id="patient-email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPatient} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Patient"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPatients && filteredPatients.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.profileImageUrl} alt={patient.firstName || ""} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(patient.firstName, patient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {patient.firstName ? `${patient.firstName} ${patient.lastName || ""}` : patient.email}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {patient.profile?.cancerType ? (
                        <>
                          {patient.profile.cancerType}
                          {patient.profile.treatmentStage && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {patient.profile.treatmentStage}
                            </Badge>
                          )}
                        </>
                      ) : (
                        "Profile not completed"
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm mb-4">
                  <p className="flex items-center text-gray-500 mb-1">
                    <span className="font-medium mr-2">Email:</span> {patient.email || "Not provided"}
                  </p>
                  {patient.profile?.treatmentNotes && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium block mb-1">Notes:</span>
                      {patient.profile.treatmentNotes}
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-3">
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-1" /> Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" /> Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600">
                    <FilePieChart className="h-4 w-4 mr-1" /> Programs
                  </Button>
                  <Button variant="outline" size="sm" className="text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No patients found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `No patients matching "${searchTerm}"`
                : "You haven't added any patients yet. Add a patient to get started."}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Patient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add the Users icon since we're using it
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
