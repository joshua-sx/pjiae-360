import { useNavigate } from "react-router-dom";
import { MagicPathGoalCreator } from "../components/MagicPathGoalCreator";

interface GoalData {
  title: string;
  description: string;
  selectedEmployees: any[];
  dueDate?: Date;
  priority: string;
}

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const handleGoalComplete = (goalData: GoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return (
    <div className="container mx-auto py-6">
      <MagicPathGoalCreator onComplete={handleGoalComplete} />
    </div>
  );
};

export default CreateGoalPage;