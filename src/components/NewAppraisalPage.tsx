
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
        { label: "Create Appraisal" }
      ]}
      pageWidth="wide"
    >
      <LazyEmployeeAppraisalFlow
        onComplete={handleComplete}
        onSaveDraft={handleSaveDraft}
      />
    </DashboardLayout>
  );
};

export default NewAppraisalPage;
