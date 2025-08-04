import { useNavigate } from "react-router-dom";
import { MagicPathGoalCreator } from "./MagicPathGoalCreator";
import { GoalData } from "./goals/creation/types";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const handleGoalComplete = (goalData: GoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return <MagicPathGoalCreator onComplete={handleGoalComplete} />;
};

export default CreateGoalPage;