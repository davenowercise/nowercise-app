import { useQuery } from "@tanstack/react-query";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      // Get user from sessionStorage
      const storedUser = sessionStorage.getItem('demoUser');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as User);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  // Function to log out the user
  const logout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('demoUser');
    sessionStorage.removeItem('userRole');
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
