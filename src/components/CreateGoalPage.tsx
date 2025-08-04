import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import MagicPathGoalCreator from "./magicpath/MagicPathGoalCreator";
import { MagicPathGoalData } from "./magicpath/types";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const handleGoalComplete = (goalData: MagicPathGoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return (
    <DashboardLayout>
      <MagicPathGoalCreator onComplete={handleGoalComplete} />
    </DashboardLayout>
  );
};

export default CreateGoalPage;