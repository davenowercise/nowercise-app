import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";

function checkDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('demo=true') || 
         localStorage.getItem('demoMode') === 'true';
}

export function useAuth() {
  const isDemo = checkDemoMode();
  
  // Set demo mode in localStorage if URL param is present
  if (isDemo && typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
    localStorage.setItem('demoMode', 'true');
  }

  // Always call useQuery - add demo=true to query when in demo mode
  const { data: user, isLoading } = useQuery({
    queryKey: isDemo ? ["/api/auth/user", "demo=true"] : ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch(isDemo ? "/api/auth/user?demo=true" : "/api/auth/user", {
        cache: 'no-cache' // Prevent caching for demo mode
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retry: false,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });

  if (isDemo && user) {
    // Get the selected demo user type from localStorage  
    const demoUserType = localStorage.getItem('demoUserType') || 'patient';
    
    return {
      user: {
        id: user.id || "demo-user",
        email: user.email || "demo@nowercise.com",
        firstName: user.firstName || "Demo",
        lastName: user.lastName || "User",
        profileImageUrl: user.profileImageUrl,
        role: demoUserType, // Use selected demo role instead of defaulting to specialist
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      },
      isLoading: false,
      isAuthenticated: true,
      logout: () => {
        localStorage.removeItem('demoMode');
        localStorage.removeItem('demoUserType');
        window.location.href = "/";
      }
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => {
      window.location.href = "/api/logout";
    }
  };
}
