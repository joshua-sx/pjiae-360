import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

const LazyManagerGoalsDashboard = lazy(() => import("./LazyManagerGoalsDashboard"));
const DirectorGoalsDashboard = lazy(() =>
  import("./goals/DirectorGoalsDashboard").then((module) => ({
    default: module.DirectorGoalsDashboard,
  }))
);

const GoalsDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

const GoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { getRolePageUrl } = useRoleBasedNavigation();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Goals" description="Track and manage performance goals">
        {permissions.canManageGoals && (
          <Button onClick={() => navigate(getRolePageUrl("goals/new"))}>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        )}
      </PageHeader>

      <Suspense fallback={<GoalsDashboardSkeleton />}>
        {permissions.isDirector ? <DirectorGoalsDashboard /> : <LazyManagerGoalsDashboard />}
      </Suspense>
    </div>
  );
};

export default GoalsPage;
