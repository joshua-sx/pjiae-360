
import { DashboardLayout } from "@/components/DashboardLayout";
import AppraisalsContent from "./Appraisals";

const AppraisalsPage = () => {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Appraisals" }]}>
      <AppraisalsContent />
    </DashboardLayout>
  );
};

export default AppraisalsPage;
