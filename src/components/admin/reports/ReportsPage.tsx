
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, TrendingUp, PieChart, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const ReportsPage = () => {
  const stats = [
    {
      title: "Completion Rate",
      value: "92%",
      description: "+5.2% from last cycle",
      icon: TrendingUp
    },
    {
      title: "Average Score",
      value: "4.2",
      description: "Out of 5.0",
      icon: BarChart3
    },
    {
      title: "Departments",
      value: "12",
      description: "With active appraisals",
      icon: PieChart
    },
    {
      title: "Reports Generated",
      value: "45",
      description: "This month",
      icon: FileText
    }
  ];

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Reports & Analytics" }
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Generate comprehensive reports and view system analytics"
        >
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                View detailed performance metrics and trends across your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive dashboards with performance trends, completion rates, and score distributions.
                </p>
                <Button variant="outline">
                  View Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>
                Generate and export custom reports for compliance and analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Report Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom reports by department, role, time period, and performance metrics.
                </p>
                <Button variant="outline">
                  Build Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
