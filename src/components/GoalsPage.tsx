import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layouts/AppLayout";
const LazyManagerGoalsDashboard = lazy(() => import("./LazyManagerGoalsDashboard"));
const DirectorGoalsDashboard = lazy(() => import("./goals/DirectorGoalsDashboard").then(module => ({
  default: module.DirectorGoalsDashboard
})));
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
  return <AppLayout width="wide">
      <Suspense fallback={<GoalsDashboardSkeleton />}>
        {permissions.isDirector ? <DirectorGoalsDashboard /> : <LazyManagerGoalsDashboard />}
      </Suspense>
    </AppLayout>;
};
export default GoalsPage;