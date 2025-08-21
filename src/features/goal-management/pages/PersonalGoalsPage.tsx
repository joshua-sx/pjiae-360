import LazyManagerGoalsDashboard from "@/components/LazyManagerGoalsDashboard";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardLayout } from "@/components/DashboardLayout";

const PersonalGoalsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Goals"
          description="Track your personal performance goals"
        />
        <LazyManagerGoalsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default PersonalGoalsPage;