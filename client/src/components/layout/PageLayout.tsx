import React from 'react';
import { Link } from 'wouter';
import { Home, Calendar, Activity, User } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-primary">Nowercise</a>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <a className="text-gray-600 hover:text-primary">Home</a>
            </Link>
            <Link href="/workout-plan">
              <a className="text-gray-600 hover:text-primary">Workouts</a>
            </Link>
            <Link href="/workout-calendar">
              <a className="text-gray-600 hover:text-primary">Calendar</a>
            </Link>
            <Link href="/parq">
              <a className="text-gray-600 hover:text-primary">PAR-Q</a>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Nowercise: Small Wins Matter</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Nowercise. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around items-center">
          <Link href="/">
            <a className="p-2 rounded-md flex flex-col items-center text-xs text-gray-600">
              <Home size={24} />
              <span>Home</span>
            </a>
          </Link>
          <Link href="/workout-calendar">
            <a className="p-2 rounded-md flex flex-col items-center text-xs text-gray-600">
              <Calendar size={24} />
              <span>Calendar</span>
            </a>
          </Link>
          <Link href="/workout-plan">
            <a className="p-2 rounded-md flex flex-col items-center text-xs text-gray-600">
              <Activity size={24} />
              <span>Workouts</span>
            </a>
          </Link>
          <Link href="/profile">
            <a className="p-2 rounded-md flex flex-col items-center text-xs text-gray-600">
              <User size={24} />
              <span>Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}