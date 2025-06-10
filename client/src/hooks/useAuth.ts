import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { isDemoMode, addDemoParam } from "@/lib/queryClient";

export function useAuth() {
  // For demo mode, create a demo user immediately
  if (isDemoMode()) {
    return {
      user: {
        id: "demo-user",
        email: "demo@nowercise.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: undefined,
        role: "specialist",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User,
      isLoading: false,
      isAuthenticated: true,
      logout: () => {
        localStorage.removeItem('demoMode');
        window.location.href = "/";
      }
    };
  }

  // Regular auth flow using React Query
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => {
      window.location.href = "/api/logout";
    }
  };
}
