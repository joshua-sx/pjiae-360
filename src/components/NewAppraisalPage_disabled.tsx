
import { DashboardLayout } from "@/components/DashboardLayout";
import LazyEmployeeAppraisalFlow from "./LazyEmployeeAppraisalFlow";
import { useNavigate } from "react-router-dom";

const NewAppraisalPage = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/appraisals");
  };

  const handleSaveDraft = () => {
    // Draft saved automatically - no navigation needed
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Appraisals", href: "/appraisals" },
        { label: "New Appraisal" }
      ]}
    >
      <div className="max-w-[1200px] mx-auto">
        <LazyEmployeeAppraisalFlow
          onComplete={handleComplete}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewAppraisalPage;
