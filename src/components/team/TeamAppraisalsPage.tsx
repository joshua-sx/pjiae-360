
import LazyManagerAppraisalsDashboard from "../LazyManagerAppraisalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";

const TeamAppraisalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();

  return (
    <div className="space-y-4 sm:space-y-6">
      {isDemoMode && <DemoModeBanner />}
      <PageHeader 
        title="Team Appraisals" 
        description="Manage and track appraisals for your team members"
      >
        {permissions.canCreateAppraisals && (
          <Button onClick={() => navigate("new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Appraisal
          </Button>
        )}
      </PageHeader>
      <LazyManagerAppraisalsDashboard />
    </div>
  );
};

export default TeamAppraisalsPage;
