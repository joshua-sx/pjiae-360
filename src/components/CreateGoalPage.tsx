import { useNavigate } from "react-router-dom";
import { Target } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { MagicPathGoalCreator } from "./MagicPathGoalCreator";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals", href: "/goals" },
    { label: "Create Goal" }
  ];

  const handleGoalComplete = (goalData: any) => {
    // Handle goal completion - navigate back to goals page
    navigate("/goals");
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Create New Goal</h1>
            </div>
          </div>
        </div>

        {/* MagicPath Goal Creator */}
        <MagicPathGoalCreator onComplete={handleGoalComplete} />
      </div>
    </DashboardLayout>
  );
};

export default CreateGoalPage;