
import LazyManagerAppraisalsDashboard from "../LazyManagerAppraisalsDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { PageContent } from "@/components/ui/page-content";

const TeamAppraisalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();

  return (
    <PageContent>
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
    </PageContent>
  );
};

export default TeamAppraisalsPage;
