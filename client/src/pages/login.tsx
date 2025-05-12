import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
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
        <CardFooter>
          <Button 
            onClick={handleLogin} 
            className="w-full bg-primary hover:bg-primary-dark" 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Log in to continue"}
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
