
import AppraisalsContent from "../Appraisals";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { DashboardLayout } from "../DashboardLayout";

const TeamAppraisalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Appraisals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team Appraisals</h1>
          <p className="text-muted-foreground">Manage and track appraisals for your team members</p>
        </div>
        {permissions.canCreateAppraisals && (
          <Button onClick={() => navigate("new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Appraisal
          </Button>
        )}
      </div>
      <AppraisalsContent />
    </DashboardLayout>
  );
};

export default TeamAppraisalsPage;
