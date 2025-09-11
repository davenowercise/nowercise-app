import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Dumbbell, 
  Home, 
  BookOpen, 
  ClipboardCheck, 
  ActivitySquare,
  LineChart,
  Heart,
  Brain,
  Smile,
  Star,
  Sparkles,
  Compass,
  CheckCircle,
  BarChart,
  ThumbsUp,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}

function NavItem({ href, icon, label, isActive, badge }: NavItemProps) {
  return (
    <div>
      <Link href={href}>
        <div
          className={`sidebar-item flex items-center px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer ${
            isActive
              ? "bg-primary-light/10 border-l-4 border-primary text-primary"
              : "text-gray-700 border-l-4 border-transparent"
          }`}
        >
          <span className="mr-3">{icon}</span>
          <span className="font-medium">{label}</span>
          {badge && badge > 0 && (
            <Badge className="ml-auto bg-accent text-white">{badge}</Badge>
          )}
        </div>
      </Link>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // For the demo, we'll mock these values
  const unreadCount = { count: 3 };
  const smallWinsCount = { count: 5 };
  
  if (!user) return null;
  
  const isSpecialist = user.role === "specialist";

  return (
    <aside className="desktop-sidebar w-64 bg-white shadow-sm flex-shrink-0 border-r border-gray-200 hidden md:block">
      <div className="p-4 border-b border-gray-200">
        <div className="bg-primary-light/10 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profileImageUrl} alt={user.firstName || ""} />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium text-gray-800 truncate max-w-[180px]" title={user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email || "User"}>
                {user.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : user.email || "User"}
              </p>
              <p className="text-sm text-gray-500">
                {isSpecialist ? "Cancer Exercise Specialist" : "Patient"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="pt-2">
        <div className="px-4 py-2">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
            Menu
          </p>
        </div>

        <NavItem
          href="/"
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          isActive={location === "/"}
        />

        {isSpecialist && (
          <NavItem
            href="/specialist-dashboard"
            icon={<Users className="h-5 w-5" />}
            label="Patient Dashboard"
            isActive={location === "/specialist-dashboard"}
          />
        )}

        {isSpecialist && (
          <NavItem
            href="/patients"
            icon={<Users className="h-5 w-5" />}
            label="My Patients"
            isActive={location === "/patients"}
          />
        )}

        <NavItem
          href="/exercises"
          icon={<Dumbbell className="h-5 w-5" />}
          label="Exercise Library"
          isActive={location === "/exercises"}
        />

        <NavItem
          href="/full-body-workout"
          icon={<ActivitySquare className="h-5 w-5" />}
          label="Full Body Workout"
          isActive={location === "/full-body-workout"}
        />

        <NavItem
          href="/programs"
          icon={<Calendar className="h-5 w-5" />}
          label={isSpecialist ? "Program Builder" : "My Programs"}
          isActive={location === "/programs"}
        />

        {isSpecialist && (
          <NavItem
            href="/ai-prescriptions"
            icon={<Brain className="h-5 w-5" />}
            label="AI Exercise Prescriptions"
            isActive={location === "/ai-prescriptions"}
          />
        )}

        {isSpecialist && (
          <NavItem
            href="/video-library-manager"
            icon={<FileText className="h-5 w-5" />}
            label="Video Library Manager"
            isActive={location === "/video-library-manager"}
          />
        )}

        {/* Enhanced Features Section */}
        <div className="mt-6">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center">
              <div className="h-px bg-gray-200 flex-1" />
              <p className="mx-2 text-xs uppercase font-semibold text-blue-500 tracking-wider flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Enhanced Features
              </p>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
          </div>
          
          <div className="bg-blue-50/50 py-2 rounded-md">
            <NavItem
              href="/enhanced-onboarding"
              icon={<Users className="h-5 w-5 text-blue-500" />}
              label="Enhanced Onboarding"
              isActive={location === "/enhanced-onboarding"}
            />
            <NavItem
              href="/ai-prescriptions"
              icon={<Brain className="h-5 w-5 text-blue-500" />}
              label="AI Prescriptions"
              isActive={location === "/ai-prescriptions"}
            />
            <NavItem
              href="/enhanced-progress"
              icon={<LineChart className="h-5 w-5 text-blue-500" />}
              label="Progress Analytics"
              isActive={location === "/enhanced-progress"}
            />

          </div>
        </div>

        {!isSpecialist && (
          <NavItem
            href="/client-programme"
            icon={<Dumbbell className="h-5 w-5" />}
            label="Weekly Programme"
            isActive={location === "/client-programme"}
          />
        )}

        <NavItem
          href="/messages"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Messages"
          isActive={location === "/messages"}
          badge={unreadCount?.count || 0}
        />
        
        {!isSpecialist && (
          <NavItem
            href="/assessment"
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Health Assessment"
            isActive={location === "/assessment"}
          />
        )}
        
        <NavItem
          href="/calendar"
          icon={<Calendar className="h-5 w-5" />}
          label="Calendar"
          isActive={location === "/calendar"}
        />
        
        <NavItem
          href="/tracking"
          icon={<LineChart className="h-5 w-5" />}
          label="Health Tracking"
          isActive={location === "/tracking"}
        />
        
        {/* Show different guideline links for specialists vs patients */}
        {isSpecialist ? (
          <>
            <NavItem
              href="/guidelines"
              icon={<BookOpen className="h-5 w-5" />}
              label="Medical Guidelines"
              isActive={location === "/guidelines"}
            />
            
            <NavItem
              href="/coach/recommendations"
              icon={<ThumbsUp className="h-5 w-5" />}
              label="Exercise Review"
              isActive={location.startsWith("/coach/recommendations")}
            />
          </>
        ) : (
          <>
            <NavItem
              href="/exercise-guidelines"
              icon={<BookOpen className="h-5 w-5" />}
              label="Exercise Guidelines"
              isActive={location === "/exercise-guidelines"}
            />
            
            {/* Nowercise Club Section with improved visual separation */}
            <div className="mt-6">
              <div className="text-center mb-2">
                <div className="flex items-center justify-center">
                  <div className="h-px bg-gray-200 flex-1" />
                  <p className="mx-2 text-xs uppercase font-semibold text-orange-500 tracking-wider flex items-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Nowercise Club
                  </p>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              </div>
              
              {/* Club navigation items with warm background */}
              <div className="bg-orange-50/50 py-2 rounded-md">
                <NavItem
                  href="/club"
                  icon={<Compass className="h-5 w-5 text-orange-500" />}
                  label="Getting Started"
                  isActive={location === "/club"}
                />
                <NavItem
                  href="/club/check-in"
                  icon={<BarChart className="h-5 w-5 text-orange-500" />}
                  label="Daily Check-in"
                  isActive={location === "/club/check-in"}
                />
                <NavItem
                  href="/club/gentle-sessions"
                  icon={<Dumbbell className="h-5 w-5 text-orange-500" />}
                  label="Gentle Sessions"
                  isActive={location === "/club/gentle-sessions"}
                />
                <NavItem
                  href="/club/weekly-movement"
                  icon={<ActivitySquare className="h-5 w-5 text-orange-500" />}
                  label="Weekly Movement"
                  isActive={location === "/club/weekly-movement"}
                />
                <NavItem
                  href="/club/wins"
                  icon={<Star className="h-5 w-5 text-orange-500" />}
                  label="Small Wins"
                  isActive={location === "/club/wins"}
                />
              </div>
            </div>
          </>
        )}

        <div className="border-t border-gray-200 mt-4 pt-4 px-4">
          <div className="bg-gray-100 rounded-lg p-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-accent mr-2 h-4 w-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Today's Wins
            </h3>
            <div className="mt-2 text-sm text-gray-600">
              {smallWinsCount?.count ? (
                <>
                  <p>{smallWinsCount.count} small wins celebrated</p>
                  <p className="mt-1">Keep going, every win matters!</p>
                </>
              ) : (
                <p>No wins recorded today. Let's get started!</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full mt-4 py-2 px-3 text-left flex items-center text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
