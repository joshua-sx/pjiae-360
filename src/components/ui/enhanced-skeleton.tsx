import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedSkeletonProps {
  className?: string;
}

// Card skeleton with multiple lines
export function CardSkeleton({ className }: EnhancedSkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4 border border-border rounded-lg bg-card", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
}

// Table skeleton with headers and rows
export function TableSkeleton({ className, rows = 5 }: EnhancedSkeletonProps & { rows?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Table header */}
      <div className="flex space-x-4 p-4 bg-muted/50 rounded-lg">
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[25%]" />
        <Skeleton className="h-4 w-[15%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[10%]" />
        <Skeleton className="h-4 w-[10%]" />
      </div>
      
      {/* Table rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 p-4 border border-border rounded-lg">
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[25%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[10%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard card skeleton with stats
export function DashboardCardSkeleton({ className }: EnhancedSkeletonProps) {
  return (
    <div className={cn("p-6 border border-border rounded-lg bg-card space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    </div>
  );
}

// Form skeleton with labels and inputs
export function FormSkeleton({ className }: EnhancedSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-10 w-full" />
          {i === 1 && <Skeleton className="h-3 w-[200px]" />}
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}

// Goal card skeleton specifically for goals dashboard
export function GoalCardSkeleton({ className }: EnhancedSkeletonProps) {
  return (
    <div className={cn("p-4 border border-border rounded-lg bg-card space-y-3", className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="w-1 h-6 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-[70%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4" />
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-4 w-[8px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

// List skeleton for mobile views
export function ListSkeleton({ className, items = 5 }: EnhancedSkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-4 border border-border rounded-lg bg-card">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-3 w-[40%]" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ className }: EnhancedSkeletonProps) {
  return (
    <div className={cn("p-6 border border-border rounded-lg bg-card", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
        <div className="space-y-2">
          <div className="flex items-end justify-between h-32">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8" 
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}