import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoalMetrics } from "@/hooks/useGoalMetrics";
import { useAppraisalMetrics } from "@/hooks/useAppraisalMetrics";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import LoadingSpinner from "@/components/onboarding/components/LoadingSpinner";
import { TrendingUp, Target, CheckCircle, Star, Users } from "lucide-react";
import { LineChart, AreaChart, BarChart, DonutChart } from "@tremor/react";
import {
  generateGoalsTimeSeriesData,
  generateGoalStatusData,
  generateDepartmentGoalsData,
  generateGoalProgressData,
  generateAppraisalTimeSeriesData,
  generatePerformanceRatingsData,
  generateAppraisalDepartmentData,
  generateAppraisalProgressData,
  generateRatingTrendsData,
} from "@/lib/mockChartData";

const DivisionAnalyticsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { data: goalMetrics, isLoading: goalLoading } = useGoalMetrics();
  const { data: appraisalMetrics, isLoading: appraisalLoading } = useAppraisalMetrics();
  const { data: orgMetrics, isLoading: orgLoading } = useOrgMetrics();
  const [activeTab, setActiveTab] = useState("goals");

  if (goalLoading || appraisalLoading || orgLoading) {
    return <LoadingSpinner />;
  }

  const GoalsAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goal Completion Trends</CardTitle>
            <CardDescription>Monthly goal completion over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              className="h-72"
              data={generateGoalsTimeSeriesData()}
              index="date"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(number) => `${number} goals`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Current status of all division goals</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-72"
              data={generateGoalStatusData()}
              category="value"
              index="name"
              colors={["emerald", "yellow", "red"]}
              valueFormatter={(number) => `${number}%`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goals by Department</CardTitle>
            <CardDescription>Total goals assigned per department</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-72"
              data={generateDepartmentGoalsData()}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(number) => `${number} goals`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Over Time</CardTitle>
            <CardDescription>Tracking completion vs. outstanding goals</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={generateGoalProgressData()}
              index="month"
              categories={["completed", "inProgress", "overdue"]}
              colors={["emerald", "blue", "red"]}
              valueFormatter={(number) => `${number} goals`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AppraisalsAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appraisal Completion Trends</CardTitle>
            <CardDescription>Monthly appraisal completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              className="h-72"
              data={generateAppraisalTimeSeriesData()}
              index="date"
              categories={["value"]}
              colors={["green"]}
              valueFormatter={(number) => `${number} appraisals`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Ratings Distribution</CardTitle>
            <CardDescription>Distribution of performance ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-72"
              data={generatePerformanceRatingsData()}
              category="value"
              index="name"
              colors={["emerald", "blue", "yellow", "red"]}
              valueFormatter={(number) => `${number}%`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appraisals by Department</CardTitle>
            <CardDescription>Completed appraisals per department</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-72"
              data={generateAppraisalDepartmentData()}
              index="name"
              categories={["value"]}
              colors={["green"]}
              valueFormatter={(number) => `${number} appraisals`}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating Trends</CardTitle>
            <CardDescription>Average performance ratings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart
              className="h-72"
              data={generateRatingTrendsData()}
              index="date"
              categories={["value"]}
              colors={["purple"]}
              valueFormatter={(number) => number.toFixed(1)}
              yAxisWidth={60}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {isDemoMode && <DemoModeBanner />}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Division Analytics"
            description="Performance insights and trends across your division"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgMetrics?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {activeTab === "goals" ? "Division Goals" : "Total Appraisals"}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTab === "goals" ? (goalMetrics?.totalGoals || 0) : (appraisalMetrics?.totalAppraisals || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTab === "goals" ? "Active division goals" : "Total appraisals"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTab === "goals" 
                ? `${goalMetrics?.completionRate || 0}%`
                : `${Math.round(((appraisalMetrics?.completed || 0) / (appraisalMetrics?.totalAppraisals || 1)) * 100)}%`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTab === "goals" ? "Goals completed" : "Appraisals completed"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Division Average</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.1</div>
            <p className="text-xs text-muted-foreground">Performance rating</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="goals">
          <GoalsAnalytics />
        </TabsContent>
        <TabsContent value="appraisals">
          <AppraisalsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DivisionAnalyticsPage;