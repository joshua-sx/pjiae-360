
import { DashboardLayout } from "@/components/DashboardLayout";
import LazyEmployeeAppraisalFlow from "./LazyEmployeeAppraisalFlow";
import { useNavigate } from "react-router-dom";

const NewAppraisalPage = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Appraisals", href: "/manager/team/appraisals" },
    { label: "Create Appraisal" }
  ];

  const handleComplete = () => {
    navigate("/manager/team/appraisals");
  };

  const handleSaveDraft = () => {
    // Draft saved automatically - no navigation needed
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <LazyEmployeeAppraisalFlow
        onComplete={handleComplete}
        onSaveDraft={handleSaveDraft}
      />
    </DashboardLayout>
  );
};

export default NewAppraisalPage;
