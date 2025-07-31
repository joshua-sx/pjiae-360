import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardLayout } from "../DashboardLayout";

const TeamGoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Goals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
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
    </DashboardLayout>
  );
};

export default TeamGoalsPage;