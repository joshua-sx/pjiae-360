import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Lazy load the heavy ManagerAppraisalsDashboard component
const ManagerAppraisalsDashboard = () => <div>Manager Appraisals Dashboard Coming Soon</div>;

interface LazyManagerAppraisalsDashboardProps {
  className?: string;
}

// Loading skeleton that matches the appraisals dashboard layout
const AppraisalsDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Controls */}
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Appraisals table */}
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

export default function LazyManagerAppraisalsDashboard({ className }: LazyManagerAppraisalsDashboardProps) {
  return (
    <Suspense fallback={<AppraisalsDashboardSkeleton />}>
      <ManagerAppraisalsDashboard />
    </Suspense>
  );
}