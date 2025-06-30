
import { DashboardLayout } from "@/components/DashboardLayout";
import AppraisalsContent from "./Appraisals";

const AppraisalsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto">
        <AppraisalsContent />
      </div>
    </DashboardLayout>
  );
};

export default AppraisalsPage;
