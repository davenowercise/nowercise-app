import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { getQueryFn } from "@/lib/queryClient";
import { useEffect, useState } from "react";

export function useAuth() {
  // Check if we're in demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Check URL params for demo mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('demo') && urlParams.get('demo') === 'true') {
      setIsDemoMode(true);
      
      // Store demo mode in session storage
      sessionStorage.setItem('demoMode', 'true');
    } else if (sessionStorage.getItem('demoMode') === 'true') {
      // If demo mode is in session storage, keep it
      setIsDemoMode(true);
    }
  }, []);
  
  // Construct the query URL with demo parameter if needed
  const authUrl = isDemoMode ? "/api/auth/user?demo=true" : "/api/auth/user";
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: [authUrl],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled now
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isDemoMode,
  };
}
