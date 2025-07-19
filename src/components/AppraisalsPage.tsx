
import { DashboardLayout } from "@/components/DashboardLayout";
import AppraisalsContent from "./Appraisals";
import { PageHeader } from "@/components/ui/page-header";

const AppraisalsPage = () => {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Appraisals" }
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Appraisals"
          description="Manage and track employee performance appraisals"
        />
        <AppraisalsContent />
      </div>
    </DashboardLayout>
  );
};

export default AppraisalsPage;
