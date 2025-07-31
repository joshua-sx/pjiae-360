import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { MagicPathGoalCreator } from "./MagicPathGoalCreator";
import { GoalData } from "./goals/creation/types";
import { PageHeader } from "@/components/ui/page-header";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Team" },
    { label: "Goals", href: "/manager/team/goals" },
    { label: "Create Goal" }
  ];

  const handleGoalComplete = (goalData: GoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <PageHeader
        title="Create New Goal"
        description="Set up performance objectives and assign them to team members"
      />
      <MagicPathGoalCreator onComplete={handleGoalComplete} />
    </DashboardLayout>
  );
};

export default CreateGoalPage;