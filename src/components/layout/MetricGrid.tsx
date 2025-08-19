import React from "react";
import { cn } from "@/lib/utils";

interface MetricGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MetricGrid({ children, className }: MetricGridProps) {
  return (
    <div className={cn("grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6", className)}>
      {children}
    </div>
  );
}