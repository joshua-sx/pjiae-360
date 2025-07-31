import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { MagicPathGoalCreator } from "./MagicPathGoalCreator";
import { GoalData } from "./goals/creation/types";
import { PageHeader } from "@/components/ui/page-header";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals", href: "/manager/team/goals" },
    { label: "Create Goal" }
  ];

  const handleGoalComplete = (goalData: GoalData) => {
    // Handle goal completion - navigate back to goals page
    navigate("/manager/team/goals");
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Create New Goal"
          description="Set up performance objectives and assign them to team members"
        />

        <MagicPathGoalCreator onComplete={handleGoalComplete} />
      </div>
    </DashboardLayout>
  );
};

export default CreateGoalPage;