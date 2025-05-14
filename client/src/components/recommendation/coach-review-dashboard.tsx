import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';

type Assessment = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: string;
  hasRiskFlags: boolean;
  tier: string;
};

export function CoachReviewDashboard() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending');
  
  // Fetch pending assessments that need review
  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/coach/recommendations/pending', filter],
    refetchInterval: 300000, // Refetch every 5 minutes
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Error Loading Assessments</h2>
        <p className="mb-4">There was a problem fetching assessments for review.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  const getTierBadge = (tier: string) => {
    const tierMap = {
      'low': { color: 'bg-green-100 text-green-800', label: 'Low Intensity' },
      'moderate': { color: 'bg-blue-100 text-blue-800', label: 'Moderate' },
      'high': { color: 'bg-purple-100 text-purple-800', label: 'High Intensity' },
    };
    
    const tierInfo = tierMap[tier as keyof typeof tierMap] || { color: 'bg-gray-100 text-gray-800', label: tier };
    
    return (
      <Badge variant="outline" className={`${tierInfo.color} border-none`}>
        {tierInfo.label}
      </Badge>
    );
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Patient Recommendations Pending Review</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter: {filter === 'pending' ? 'Pending Review' : filter === 'approved' ? 'Approved' : filter === 'rejected' ? 'Rejected' : 'All'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setFilter('pending')}>
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                <span>Pending Review</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('approved')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Approved</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('rejected')}>
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                <span>Rejected</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                <span className="ml-6">All Recommendations</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {assessments?.length === 0 ? (
        <div className="text-center p-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-2">No recommendations {filter !== 'all' ? `with status: ${filter}` : ''} to review at this time.</p>
          <Button 
            variant="outline" 
            onClick={() => setFilter('all')}
            className="mt-2"
          >
            View All Recommendations
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments?.map((assessment: Assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {getStatusIcon(assessment.status)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{assessment.status === 'pending' ? 'Pending Review' : 
                             assessment.status === 'approved' ? 'Approved' : 'Rejected'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="font-medium">{assessment.patientName}</TableCell>
                  <TableCell>{formatDate(assessment.date)}</TableCell>
                  <TableCell>{getTierBadge(assessment.tier)}</TableCell>
                  <TableCell>
                    {assessment.hasRiskFlags && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Has risk flags that need review</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/coach/recommendations/${assessment.id}`}>
                        Review <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}