
import { DashboardLayout } from "./DashboardLayout";
import { ManagerGoalsDashboard } from "./goals/ManagerGoalsDashboard";

const GoalsPage = () => {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <ManagerGoalsDashboard />
    </DashboardLayout>
  );
};

export default GoalsPage;
