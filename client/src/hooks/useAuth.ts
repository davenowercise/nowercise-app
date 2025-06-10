import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";

function checkDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('demo=true') || 
         localStorage.getItem('demoMode') === 'true';
}

export function useAuth() {
  // Always call useQuery - but conditionally enable it
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !checkDemoMode(),
  });

  const isDemo = checkDemoMode();

  if (isDemo) {
    // Set demo mode in localStorage if URL param is present
    if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
      localStorage.setItem('demoMode', 'true');
    }

    const demoUser: User = {
      id: "demo-user",
      email: "demo@nowercise.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: undefined,
      role: "specialist",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      user: demoUser,
      isLoading: false,
      isAuthenticated: true,
      logout: () => {
        localStorage.removeItem('demoMode');
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
