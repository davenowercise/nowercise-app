import { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { FloatingDemoButton } from "./FloatingDemoButton";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-white shadow-sm py-2 px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex flex-grow">
          <div className="hidden md:block w-64 bg-white">
            <Skeleton className="h-full" />
          </div>
          <main className="flex-grow p-4 md:p-6">
            <Skeleton className="h-10 w-72 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 rounded-lg" />
              </div>
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please login to continue</h1>
            <p className="mb-4">You need to login to access Nowercise.</p>
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={() => { window.location.href = "/api/login"; }}
            >
              Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <main className="flex-grow p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          {children}
        </main>
      </div>
      <FloatingDemoButton />
      <MobileNav />
    </div>
  );
}
