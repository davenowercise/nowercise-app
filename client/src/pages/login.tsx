import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"patient" | "specialist">("patient");

  const handleDemoLogin = () => {
    try {
      setLoading(true);
      
      // Store user type in sessionStorage
      sessionStorage.setItem('userRole', userType);
      
      // Create a demo user with the selected role
      const demoUser = {
        id: "demo-user",
        email: "demo@nowercise.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
        role: userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the demo user in sessionStorage
      sessionStorage.setItem('demoUser', JSON.stringify(demoUser));
      sessionStorage.setItem('isLoggedIn', 'true');
      
      // Redirect to the main application
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("There was an error logging in. Please try again.");
      setLoading(false);
    }
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
        
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid grid-cols-1 mx-6">
            <TabsTrigger value="demo">Demo Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="space-y-4 p-6">
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <p className="mb-2 font-medium">Nowercise helps you:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create personalized exercise plans based on your energy level</li>
                <li>Track and celebrate your small wins in recovery</li>
                <li>Connect with cancer exercise specialists</li>
                <li>Manage symptoms and build strength safely</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="user-type">Choose a role to explore the demo:</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "patient" | "specialist")}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="patient" />
                  <Label htmlFor="patient" className="cursor-pointer">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specialist" id="specialist" />
                  <Label htmlFor="specialist" className="cursor-pointer">Exercise Specialist</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              onClick={handleDemoLogin} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Loading..." : "Enter Demo"}
            </Button>
          </TabsContent>
        </Tabs>
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
