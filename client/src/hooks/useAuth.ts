import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { isDemoMode } from "@/lib/queryClient";
import { useMemo } from "react";

export function useAuth() {
  const isDemo = useMemo(() => isDemoMode(), []);

  // Demo user object
  const demoUser = useMemo(() => ({
    id: "demo-user",
    email: "demo@nowercise.com",
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: undefined,
    role: "specialist",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as User), []);

  // Regular auth flow using React Query (only when not in demo mode)
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isDemo, // Only run query when not in demo mode
  });

  return {
    user: isDemo ? demoUser : user,
    isLoading: isDemo ? false : isLoading,
    isAuthenticated: isDemo ? true : !!user,
    logout: () => {
      if (isDemo) {
        localStorage.removeItem('demoMode');
        window.location.href = "/";
      } else {
        window.location.href = "/api/logout";
      }
    }
  };
}
