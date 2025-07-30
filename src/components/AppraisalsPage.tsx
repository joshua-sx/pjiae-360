
import AppraisalsContent from "./Appraisals";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

const AppraisalsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Appraisals"
        description="Manage and track employee performance appraisals"
      >
        {permissions.canCreateAppraisals && (
          <Button onClick={() => navigate("/appraisals/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Appraisal
          </Button>
        )}
      </PageHeader>
      <AppraisalsContent />
    </div>
  );
};

export default AppraisalsPage;
