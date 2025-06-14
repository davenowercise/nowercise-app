import { ProgramAssignment, Program, User } from "@/lib/types";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { EnergyLevel } from "@/components/ui/energy-level";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface PatientProgramsProps {
  programAssignments: (ProgramAssignment & { 
    patient: User;
    program: Program;
  })[];
  isLoading: boolean;
}

export function PatientPrograms({ programAssignments, isLoading }: PatientProgramsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [, setLocation] = useLocation();
  const itemsPerPage = 4;

  const filteredPrograms = programAssignments.filter(
    (assignment) =>
      assignment.patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.program.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getProgressPercentage = (assignment: ProgramAssignment) => {
    const totalDays = assignment.program.duration * 7; // assuming duration is in weeks
    const startDate = new Date(assignment.startDate);
    const currentDate = new Date();
    const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.round((daysPassed / totalDays) * 100), 100);
  };

  const getWeekProgress = (assignment: ProgramAssignment) => {
    const totalWeeks = assignment.program.duration;
    const startDate = new Date(assignment.startDate);
    const currentDate = new Date();
    const weeksPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    return {
      current: Math.min(weeksPassed + 1, totalWeeks),
      total: totalWeeks
    };
  };

  const formatNextSession = (assignment: ProgramAssignment) => {
    // This is just a placeholder; in a real app, you'd get this from the sessions data
    return {
      date: "Today",
      time: "10:30 AM",
      status: "Confirmed"
    };
  };

  return (
    <DashboardCard 
      title="Current Patient Exercise Programs"
      headerAction={
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search programs..."
              className="pl-8 text-sm h-9 border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
          </div>
          <Button 
            size="sm" 
            className="bg-primary text-white flex items-center"
            onClick={() => setLocation("/programs?demo=true")}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Program
          </Button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Energy Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Session
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-full mr-2" />
                      <div>
                        <Skeleton className="h-5 w-28 mb-1" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-2 w-32 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                </tr>
              ))
            ) : currentPrograms.length > 0 ? (
              currentPrograms.map((assignment) => {
                const progressPercentage = getProgressPercentage(assignment);
                const weekProgress = getWeekProgress(assignment);
                const nextSession = formatNextSession(assignment);
                const cancerType = assignment.patient.cancerType || "Cancer";
                const treatmentStage = assignment.patient.treatmentStage || "Treatment";
                
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                          <AvatarImage src={assignment.patient.profileImageUrl} alt={assignment.patient.firstName || ""} />
                          <AvatarFallback className="bg-primary-light text-white">
                            {getInitials(assignment.patient.firstName, assignment.patient.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-800">
                            {assignment.patient.firstName
                              ? `${assignment.patient.firstName} ${assignment.patient.lastName || ""}`
                              : "Patient"}
                          </p>
                          <p className="text-xs text-gray-500">{cancerType}, {treatmentStage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-800">{assignment.program.name}</p>
                      <p className="text-xs text-gray-500">{assignment.program.duration} weeks program</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EnergyLevel level={assignment.energyLevel} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Week {weekProgress.current} of {weekProgress.total}</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${progressPercentage >= 50 ? "bg-success" : "bg-warning"} rounded-full h-2`} 
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-gray-800">{nextSession.date}, {nextSession.time}</p>
                      <p className={`text-xs ${nextSession.status === "Confirmed" ? "text-success" : "text-warning"}`}>
                        {nextSession.status}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button variant="link" className="text-primary p-0 h-auto">View</Button>
                        <Button variant="link" className="text-gray-600 p-0 h-auto">Edit</Button>
                        <Button variant="link" className="text-gray-600 p-0 h-auto">Message</Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  {searchTerm 
                    ? "No programs match your search criteria" 
                    : "No active programs found. Create a new program to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && filteredPrograms.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <span>
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredPrograms.length)}
              </span>{" "}
              of <span className="font-medium">{filteredPrograms.length}</span> results
            </span>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => {
              const pageNum = currentPage <= 2 
                ? i + 1 
                : currentPage >= totalPages - 1 
                  ? totalPages - 2 + i 
                  : currentPage - 1 + i;
              
              if (pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    className={pageNum === currentPage ? "bg-primary border-primary" : ""}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
