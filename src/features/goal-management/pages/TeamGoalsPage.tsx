
import LazyManagerGoalsDashboard from "@/components/LazyManagerGoalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/access-control";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { PageContainer as Container } from "@/components/ui/page";
import { DashboardLayout } from "@/components/DashboardLayout";

const TeamGoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode, demoRole } = useDemoMode();

  // Center content in demo mode for managers
  if (isDemoMode && demoRole === 'manager') {
    return (
      <Container size="wide">
        <DashboardLayout>
          <div className="space-y-4 sm:space-y-6">
            <DemoModeBanner />
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
            <LazyManagerGoalsDashboard onCreateGoal={() => navigate("new")} />
          </div>
        </DashboardLayout>
      </Container>
    );
  }

  return (
    <DashboardLayout>
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
        <LazyManagerGoalsDashboard onCreateGoal={() => navigate("new")} />
      </div>
    </DashboardLayout>
  );

};

export default TeamGoalsPage;
