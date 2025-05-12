import { useLocation, Link } from "wouter";
import { Home, Users, Dumbbell, Calendar, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: unreadCount } = useQuery({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user
  });
  
  if (!user) return null;
  
  const isSpecialist = user.role === "specialist";

  return (
    <nav className="mobile-nav fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 shadow-lg md:hidden z-10">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : "text-gray-600"}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
      </Link>
      
      {isSpecialist && (
        <Link href="/patients">
          <a className={`flex flex-col items-center p-2 ${location === "/patients" ? "text-primary" : "text-gray-600"}`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Patients</span>
          </a>
        </Link>
      )}
      
      <Link href="/exercises">
        <a className={`flex flex-col items-center p-2 ${location === "/exercises" ? "text-primary" : "text-gray-600"}`}>
          <Dumbbell className="h-5 w-5" />
          <span className="text-xs mt-1">Exercises</span>
        </a>
      </Link>
      
      <Link href="/programs">
        <a className={`flex flex-col items-center p-2 ${location === "/programs" ? "text-primary" : "text-gray-600"}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Programs</span>
        </a>
      </Link>
      
      <Link href="/messages">
        <a className={`flex flex-col items-center p-2 relative ${location === "/messages" ? "text-primary" : "text-gray-600"}`}>
          <MessageSquare className="h-5 w-5" />
          {unreadCount?.count > 0 && (
            <Badge className="absolute top-1 right-1 bg-accent" variant="default">
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </Badge>
          )}
          <span className="text-xs mt-1">Messages</span>
        </a>
      </Link>
    </nav>
  );
}
