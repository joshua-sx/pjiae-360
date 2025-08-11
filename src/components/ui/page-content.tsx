import React from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("space-y-4 sm:space-y-6 overflow-x-hidden", className)}>
      {children}
    </div>
  );
}
