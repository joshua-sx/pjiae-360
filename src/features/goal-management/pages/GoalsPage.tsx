import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/access-control";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

import { Skeleton } from "@/components/ui/skeleton";
const LazyManagerGoalsDashboard = lazy(() => import("@/components/LazyManagerGoalsDashboard"));
const DirectorGoalsDashboard = () => <div>Director Goals Dashboard Coming Soon</div>;
const GoalsDashboardSkeleton = () => <div className="space-y-6">
    <div className="space-y-4">
      {Array.from({
      length: 5
    }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  </div>;
const GoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const {
    getRolePageUrl
  } = useRoleBasedNavigation();
  return <div className="space-y-4 sm:space-y-6">
      <Suspense fallback={<GoalsDashboardSkeleton />}>
        {permissions.isDirector ? <DirectorGoalsDashboard /> : <LazyManagerGoalsDashboard />}
      </Suspense>
    </div>;
};
export default GoalsPage;