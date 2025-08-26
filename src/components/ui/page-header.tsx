import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode; // Backward compatibility
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions,
  children, // Support legacy API
  className 
}: PageHeaderProps) {
  // Use children as actions for backward compatibility
  const headerActions = actions || children;

  return (
    <div className={cn(
      "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-display-sm font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-body text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {headerActions && (
        <div className="flex items-center gap-2">
          {headerActions}
        </div>
      )}
    </div>
  );
}