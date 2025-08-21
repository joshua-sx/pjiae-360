import { useNavigate } from "react-router-dom";
import { MagicPathGoalCreator } from "../components/MagicPathGoalCreator";
import { DashboardLayout } from "@/components/DashboardLayout";

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
    <DashboardLayout>
      <MagicPathGoalCreator onComplete={handleGoalComplete} />
    </DashboardLayout>
  );
};

export default CreateGoalPage;