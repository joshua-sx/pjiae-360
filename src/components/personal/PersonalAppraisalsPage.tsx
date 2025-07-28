import AppraisalsContent from "../Appraisals";
import { PageHeader } from "@/components/ui/page-header";

const PersonalAppraisalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appraisals"
        description="View your personal performance appraisals"
      />
      <AppraisalsContent />
    </div>
  );
};

export default PersonalAppraisalsPage;