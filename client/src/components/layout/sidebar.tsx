import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Calendar, MessageSquare, Users, Dumbbell, Home, BookOpen } from "lucide-react";
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
    <Link href={href}>
      <a
        className={`sidebar-item flex items-center px-4 py-3 hover:bg-gray-100 transition-colors ${
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
      </a>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: unreadCount } = useQuery({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user
  });
  
  const { data: smallWinsCount } = useQuery({
    queryKey: ["/api/small-wins/count/week"],
    enabled: !!user
  });
  
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
            <div>
              <p className="font-medium text-gray-800">
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
          href="/programs"
          icon={<Calendar className="h-5 w-5" />}
          label={isSpecialist ? "Program Builder" : "My Programs"}
          isActive={location === "/programs"}
        />

        <NavItem
          href="/messages"
          icon={<MessageSquare className="h-5 w-5" />}
          label="Messages"
          isActive={location === "/messages"}
          badge={unreadCount?.count || 0}
        />

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
        </div>
      </nav>
    </aside>
  );
}
