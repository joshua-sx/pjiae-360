import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/access-control";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContent } from "@/components/ui/page-content";
import { DirectorGoalsDashboard } from "@/features/goal-management/components/DirectorGoalsDashboard";
const LazyManagerGoalsDashboard = lazy(() => import("@/components/LazyManagerGoalsDashboard"));
const GoalsDashboardSkeleton = () => {
  const { usePermissions } = require("@/features/access-control");
  const permissions = usePermissions();
  
  return (
    <div className="space-y-6">
      {/* Division goal skeleton for directors */}
      {permissions?.isDirector && (
        <div className="p-6 space-y-4 border border-border rounded-lg bg-card">
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
          </div>
        </div>
      )}
      
      {/* Goals table skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        
        {/* Filter skeletons */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
const GoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const {
    getRolePageUrl
  } = useRoleBasedNavigation();
  return <PageContent>
      <Suspense fallback={<GoalsDashboardSkeleton />}>
        {permissions.isDirector ? <DirectorGoalsDashboard /> : <LazyManagerGoalsDashboard />}
      </Suspense>
    </PageContent>;
};
export default GoalsPage;