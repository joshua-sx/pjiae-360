import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import MagicPathGoalCreator from "./magicpath/MagicPathGoalCreator";
import { MagicPathGoalData } from "./magicpath/types";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Goals", href: "/manager/team/goals" },
    { label: "Create Goal" }
  ];

  const handleGoalComplete = (goalData: MagicPathGoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <MagicPathGoalCreator onComplete={handleGoalComplete} />
    </DashboardLayout>
  );
};

export default CreateGoalPage;