import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Lazy load the heavy ManagerGoalsDashboard component
const ManagerGoalsDashboard = lazy(() => import("./goals/ManagerGoalsDashboard").then(module => ({ default: module.ManagerGoalsDashboard })));

interface LazyManagerGoalsDashboardProps {
  divisionGoal?: any;
  goals?: any[];
  isLoading?: boolean;
}

// Loading skeleton that matches the goals dashboard layout
const GoalsDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header with stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Division goal card */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>

    {/* Controls */}
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Goals table */}
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function LazyManagerGoalsDashboard({ divisionGoal, goals, isLoading }: LazyManagerGoalsDashboardProps) {
  return (
    <Suspense fallback={<GoalsDashboardSkeleton />}>
      <ManagerGoalsDashboard 
        divisionGoal={divisionGoal}
        goals={goals}
        isLoading={isLoading}
      />
    </Suspense>
  );
}