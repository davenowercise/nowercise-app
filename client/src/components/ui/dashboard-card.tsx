import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function DashboardCard({ title, children, className = "", headerAction }: DashboardCardProps) {
  return (
    <Card className={`shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <CardHeader className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="font-heading font-semibold text-gray-800 text-base">{title}</CardTitle>
        {headerAction && <div>{headerAction}</div>}
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

export function ViewAllAction({ href }: { href: string }) {
  return (
    <a href={href} className="text-primary text-sm font-medium flex items-center">
      View All
      <span className="h-4 w-4 ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </span>
    </a>
  );
}
