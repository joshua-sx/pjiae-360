
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
    <LazyEmployeeAppraisalFlow
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
    />
  );
};

export default NewAppraisalPage;
