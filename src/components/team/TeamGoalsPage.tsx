
import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Goals</h1>
          <p className="text-muted-foreground">Manage and track goals for your team members</p>
        </div>
        {permissions.canManageGoals && (
          <Button onClick={() => navigate("new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        )}
      </div>
      <LazyManagerGoalsDashboard />
    </DashboardLayout>
  );
};

export default TeamGoalsPage;
