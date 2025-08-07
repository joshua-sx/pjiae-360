import AppraisalsContent from "./Appraisals";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { AppLayout } from "@/components/layouts/AppLayout";

const AppraisalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { getRolePageUrl } = useRoleBasedNavigation();

  return (
    <AppLayout width="wide">
      <PageHeader title="Appraisals" description="Manage and track employee performance appraisals">
        {permissions.canCreateAppraisals && (
          <Button onClick={() => navigate(getRolePageUrl("appraisals/new"))}>
            <Plus className="mr-2 h-4 w-4" />
            New Appraisal
          </Button>
        )}
      </PageHeader>
      <AppraisalsContent />
    </AppLayout>
  );
};

export default AppraisalsPage;
