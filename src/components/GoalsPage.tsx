
import { DashboardLayout } from "./DashboardLayout";
import LazyManagerGoalsDashboard from "./LazyManagerGoalsDashboard";

const GoalsPage = () => {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goals" }
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <LazyManagerGoalsDashboard />
    </DashboardLayout>
  );
};

export default GoalsPage;
