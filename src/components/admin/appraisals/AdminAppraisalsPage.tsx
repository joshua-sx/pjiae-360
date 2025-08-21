
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useAppraisalMetrics } from "@/hooks/useAppraisalMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";

const AdminAppraisalsPage = () => {
  const { data: appraisalMetrics, isLoading, error } = useAppraisalMetrics();

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Appraisals"
          description="Monitor and manage all appraisals across your organization"
        />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load appraisal metrics. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoModeBanner />
      
      <PageHeader
        title="Appraisals"
        description="Monitor and manage all appraisals across your organization"
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{appraisalMetrics?.totalAppraisals}</div>
            )}
            <p className="text-xs text-muted-foreground">Current cycle</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{appraisalMetrics?.completed}</div>
            )}
            <p className="text-xs text-muted-foreground">{appraisalMetrics?.completionRate || '82% completion rate'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{appraisalMetrics?.inProgress}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{appraisalMetrics?.overdue}</div>
            )}
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization-wide Appraisals Dashboard</CardTitle>
          <CardDescription>
            Monitor appraisal progress, review completion rates, and manage the entire performance evaluation process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Appraisals Overview</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              View all ongoing and past appraisals, filter by year, department, status, or reviewer. Flag issues and export comprehensive reports.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                View All Appraisals
              </Button>
              <Button>
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppraisalsPage;
