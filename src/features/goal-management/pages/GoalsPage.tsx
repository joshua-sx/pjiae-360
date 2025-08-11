import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/access-control";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";

import { Skeleton } from "@/components/ui/skeleton";
import { PageContent } from "@/components/ui/page-content";
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
  return <PageContent>
      <Suspense fallback={<GoalsDashboardSkeleton />}>
        {permissions.isDirector ? <DirectorGoalsDashboard /> : <LazyManagerGoalsDashboard />}
      </Suspense>
    </PageContent>;
};
export default GoalsPage;