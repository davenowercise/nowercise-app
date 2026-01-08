import { useLocation, Link } from "wouter";
import { Home, Users, Dumbbell, Calendar, MessageSquare, LineChart, Activity, BookOpen, ActivitySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user
  });
  
  if (!user) return null;
  
  const isSpecialist = user.role === "specialist";

  if (!isSpecialist) {
    return (
      <nav className="mobile-nav fixed bottom-0 w-full bg-white border-t border-gray-200 grid grid-cols-2 py-2 shadow-lg md:hidden z-10">
        <Link href="/">
          <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/" ? "text-primary" : "text-gray-600"}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Today</span>
          </div>
        </Link>
        
        <Link href="/messages">
          <div className={`flex flex-col items-center p-1 relative cursor-pointer ${location === "/messages" ? "text-primary" : "text-gray-600"}`}>
            <MessageSquare className="h-5 w-5" />
            {unreadCount && unreadCount.count && unreadCount.count > 0 && (
              <Badge className="absolute top-0 right-0 bg-accent" variant="default">
                {unreadCount.count > 9 ? '9+' : unreadCount.count}
              </Badge>
            )}
            <span className="text-xs mt-1">Messages</span>
          </div>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="mobile-nav fixed bottom-0 w-full bg-white border-t border-gray-200 grid grid-cols-6 py-2 shadow-lg md:hidden z-10">
      <Link href="/">
        <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/" ? "text-primary" : "text-gray-600"}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </div>
      </Link>
      
      <Link href="/calendar">
        <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/calendar" ? "text-primary" : "text-gray-600"}`}>
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Calendar</span>
        </div>
      </Link>
      
      <Link href="/full-body-workout">
        <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/full-body-workout" ? "text-primary" : "text-gray-600"}`}>
          <ActivitySquare className="h-5 w-5" />
          <span className="text-xs mt-1">Workout</span>
        </div>
      </Link>
      
      <Link href="/tracking">
        <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/tracking" ? "text-primary" : "text-gray-600"}`}>
          <LineChart className="h-5 w-5" />
          <span className="text-xs mt-1">Tracking</span>
        </div>
      </Link>
      
      <Link href="/guidelines">
        <div className={`flex flex-col items-center p-1 cursor-pointer ${location === "/guidelines" ? "text-primary" : "text-gray-600"}`}>
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Guidelines</span>
        </div>
      </Link>
      
      <Link href="/messages">
        <div className={`flex flex-col items-center p-1 relative cursor-pointer ${location === "/messages" ? "text-primary" : "text-gray-600"}`}>
          <MessageSquare className="h-5 w-5" />
          {unreadCount && unreadCount.count && unreadCount.count > 0 && (
            <Badge className="absolute top-0 right-0 bg-accent" variant="default">
              {unreadCount.count > 9 ? '9+' : unreadCount.count}
            </Badge>
          )}
          <span className="text-xs mt-1">Messages</span>
        </div>
      </Link>
    </nav>
  );
}
