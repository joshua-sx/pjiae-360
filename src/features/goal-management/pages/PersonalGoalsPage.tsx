import LazyManagerGoalsDashboard from "@/components/LazyManagerGoalsDashboard";
import { PageHeader } from "@/components/ui/page-header";

const PersonalGoalsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Goals"
        description="Track your personal performance goals"
      />
      <LazyManagerGoalsDashboard />
    </div>
  );
};

export default PersonalGoalsPage;