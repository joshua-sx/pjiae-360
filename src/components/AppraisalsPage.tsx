
import AppraisalsContent from "./Appraisals";
import { PageHeader } from "@/components/ui/page-header";

const AppraisalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Appraisals"
        description="Manage and track employee performance appraisals"
      />
      <AppraisalsContent />
    </div>
  );
};

export default AppraisalsPage;
