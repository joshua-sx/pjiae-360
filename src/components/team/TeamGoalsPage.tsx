
import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DashboardLayout } from "../DashboardLayout";

const TeamGoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Goals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-4 sm:space-y-6">
        {isDemoMode && <DemoModeBanner />}
        <PageHeader 
          title="Team Goals" 
          description="Manage and track goals for your team members"
        >
          {permissions.canManageGoals && (
            <Button onClick={() => navigate("new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          )}
        </PageHeader>
        <LazyManagerGoalsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default TeamGoalsPage;
