
import { DashboardLayout } from "./DashboardLayout";
import LazyManagerGoalsDashboard from "./LazyManagerGoalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

const GoalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Track and manage performance goals
            </p>
          </div>
          {permissions.canManageGoals && (
            <Button onClick={() => navigate("/goals/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          )}
        </div>
        <LazyManagerGoalsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default GoalsPage;
