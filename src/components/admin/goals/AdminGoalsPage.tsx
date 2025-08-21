
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, Calendar } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useGoalMetrics } from "@/features/goal-management/hooks/useGoalMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { StandardPage } from "@/components/layout/StandardPage";
import { MetricGrid } from "@/components/layout/MetricGrid";
import { StatCard } from "@/components/ui/stat-card";
import { PageError } from "@/components/states/PageError";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminGoalsPage() {
  const { data: goalMetrics, isLoading, error } = useGoalMetrics();

  if (error) {
    return (
      <DashboardLayout>
        <StandardPage
          title="Goals"
          description="Monitor and manage all goals across your organization"
        >
          <PageError message="Failed to load goal metrics. Please try again later." />
        </StandardPage>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StandardPage
        title="Goals"
        description="Monitor and manage all goals across your organization"
      >
        <DemoModeBanner />
        
        <MetricGrid>
          <StatCard 
            title="Total Goals" 
            value={isLoading ? "..." : goalMetrics?.totalGoals || 0} 
            description="Active this year" 
            icon={Target} 
          />
          <StatCard 
            title="Completion Rate" 
            value={isLoading ? "..." : `${goalMetrics?.completionRate || 0}%`} 
            description={goalMetrics?.completionRateChange || '+12%'} 
            icon={TrendingUp} 
          />
          <StatCard 
            title="Employees with Goals" 
            value={isLoading ? "..." : goalMetrics?.employeesWithGoals || 0} 
            description={goalMetrics?.employeesWithGoalsPercentage || '95% of workforce'} 
            icon={Users} 
          />
          <StatCard 
            title="Due This Quarter" 
            value={isLoading ? "..." : goalMetrics?.dueThisQuarter || 0} 
            description="Ending soon" 
            icon={Calendar} 
          />
        </MetricGrid>

        <Card>
          <CardHeader>
            <CardTitle>Organization-wide Goals Overview</CardTitle>
            <CardDescription>
              Monitor goal progress, performance trends, and completion rates across all departments and employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Comprehensive Goals Dashboard</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                View all active and historical goals, track progress across teams, analyze performance metrics, and identify trends to drive organizational success.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline">
                  View All Goals
                </Button>
                <Button>
                  Performance Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </StandardPage>
    </DashboardLayout>
  );
}
