import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [loginMethod, setLoginMethod] = useState<'direct' | 'replit'>('direct');
  const [error, setError] = useState("");

  // Check for error in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setError("There was an error logging in. Please try again or use the direct login method.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleReplitLogin = () => {
    try {
      setLoginMethod('replit');
      window.location.href = "/api/login";
    } catch (error) {
      console.error("Login error:", error);
      setError("There was an error with the login process. Please try the direct login method.");
    }
  };

  const handleDirectLogin = () => {
    // This would normally validate with the server, but for now we'll just redirect
    setLoginMethod('direct');
    
    // Set a session storage flag to indicate demo mode
    sessionStorage.setItem('demoMode', 'true');
    
    // Go directly to home page with demo flag
    window.location.replace("/?demo=true");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <span className="text-primary text-4xl mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dumbbell">
              <path d="m6.5 6.5 11 11"/>
              <path d="m21 21-1-1"/>
              <path d="m3 3 1 1"/>
              <path d="m18 22 4-4"/>
              <path d="m2 6 4-4"/>
              <path d="m3 10 7-7"/>
              <path d="m14 21 7-7"/>
            </svg>
          </span>
          <h1 className="text-3xl font-bold font-heading text-primary">Nowercise</h1>
        </div>
        <p className="text-accent font-semibold italic">"Small Wins Matter"</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Welcome to Nowercise</CardTitle>
          <CardDescription>
            Exercise support for cancer patients and survivors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <p className="mb-2 font-medium">Nowercise helps you:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create personalized exercise plans based on your energy level</li>
              <li>Track and celebrate your small wins in recovery</li>
              <li>Connect with cancer exercise specialists</li>
              <li>Manage symptoms and build strength safely</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleReplitLogin} 
            className="w-full bg-primary hover:bg-primary-dark" 
            disabled={isLoading || loginMethod === 'replit'}
          >
            {isLoading && loginMethod === 'replit' ? "Loading..." : "Log in with Replit Auth"}
          </Button>
          
          <div className="relative w-full py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-500">or</span>
            </div>
          </div>
          
          <Button 
            onClick={handleDirectLogin}
            variant="outline" 
            className="w-full" 
            disabled={isLoading || loginMethod === 'direct'}
          >
            {isLoading && loginMethod === 'direct' ? "Loading..." : "Enter as Demo User"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500 max-w-md">
        <p>
          Nowercise is a specialized platform connecting cancer exercise specialists with patients to create
          adapted workout plans that celebrate small wins on the path to recovery.
        </p>
      </div>
    </div>
  );
}
