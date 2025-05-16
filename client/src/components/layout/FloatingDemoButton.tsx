import React from 'react';
import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingDemoButton() {
  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      <Link href="/demo-features">
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0 bg-blue-500 hover:bg-blue-600"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Demo Features</span>
        </Button>
      </Link>
    </div>
  );
}