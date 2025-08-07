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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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
import {
  useGoalsTimeSeriesData,
  useGoalStatusData,
  useDepartmentGoalsData,
  useAppraisalTimeSeriesData,
  usePerformanceRatingsData,
  useAppraisalDepartmentData,
  useRatingTrendsData,
} from "@/hooks/useRealChartData";

const DivisionAnalyticsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { data: goalMetrics, isLoading: goalLoading } = useGoalMetrics();
  const { data: appraisalMetrics, isLoading: appraisalLoading } = useAppraisalMetrics();
  const { data: orgMetrics, isLoading: orgLoading } = useOrgMetrics();
  const [activeTab, setActiveTab] = useState("goals");

  if (goalLoading || appraisalLoading || orgLoading) {
    return <LoadingSpinner />;
  }

  const goalCompletionConfig = {
    value: {
      label: "Goals Completed",
      color: "hsl(var(--chart-2))", // Green for success
    },
  };

  const goalStatusConfig = {
    "On Track": {
      label: "On Track",
      color: "hsl(var(--chart-2))", // Green for success
    },
    "At Risk": {
      label: "At Risk", 
      color: "hsl(var(--chart-3))", // Orange for warning
    },
    "Overdue": {
      label: "Overdue",
      color: "hsl(var(--chart-4))", // Red for danger
    },
  };

  const departmentConfig = {
    value: {
      label: "Goals",
      color: "hsl(var(--chart-1))",
    },
  };

  const progressConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-2))", // Green for completed
    },
    inProgress: {
      label: "In Progress",
      color: "hsl(var(--chart-3))", // Orange for in progress
    },
    overdue: {
      label: "Overdue",
      color: "hsl(var(--chart-4))", // Red for overdue
    },
  };

  const GoalsAnalytics = () => {
    const goalsTimeSeriesData = useGoalsTimeSeriesData();
    const goalStatusData = useGoalStatusData();
    const departmentGoalsData = useDepartmentGoalsData();

    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Completion Trends</CardTitle>
              <CardDescription>Monthly goal completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={goalCompletionConfig} className="h-72">
                <LineChart data={goalsTimeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [`${value} goals`, "Goals Completed"]} />} 
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-value)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Current status of all division goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={goalStatusConfig} className="h-72">
              <PieChart>
                <ChartTooltip 
                  content={<ChartTooltipContent hideLabel formatter={(value) => [`${value}%`, ""]} />} 
                />
                <Pie
                  data={goalStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {goalStatusData.map((entry, index) => {
                    const colors = ['hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goals by Department</CardTitle>
            <CardDescription>Total goals assigned per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={departmentConfig} className="h-72">
              <BarChart data={departmentGoalsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [`${value} goals`, "Goals"]} />} 
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Over Time</CardTitle>
            <CardDescription>Tracking completion vs. outstanding goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={progressConfig} className="h-72">
              <AreaChart data={generateGoalProgressData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value, name) => [`${value} goals`, name]} />} 
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="var(--color-completed)"
                  fill="var(--color-completed)"
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke="var(--color-inProgress)"
                  fill="var(--color-inProgress)"
                />
                <Area
                  type="monotone"
                  dataKey="overdue"
                  stackId="1"
                  stroke="var(--color-overdue)"
                  fill="var(--color-overdue)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  const appraisalCompletionConfig = {
    value: {
      label: "Appraisals Completed",
      color: "hsl(var(--chart-2))", // Green for success
    },
  };

  const performanceRatingConfig = {
    "Exceeds Expectations": {
      label: "Exceeds Expectations",
      color: "hsl(var(--chart-1))", // Blue for excellence
    },
    "Meets Expectations": {
      label: "Meets Expectations", 
      color: "hsl(var(--chart-2))", // Green for success
    },
    "Below Expectations": {
      label: "Below Expectations",
      color: "hsl(var(--chart-3))", // Orange for warning
    },
    "Needs Improvement": {
      label: "Needs Improvement",
      color: "hsl(var(--chart-4))", // Red for needs attention
    },
  };

  const appraisalDepartmentConfig = {
    value: {
      label: "Appraisals",
      color: "hsl(var(--chart-1))", // Blue primary
    },
  };

  const ratingTrendsConfig = {
    value: {
      label: "Average Rating",
      color: "hsl(var(--chart-5))", // Purple for ratings
    },
  };

  const AppraisalsAnalytics = () => {
    const appraisalTimeSeriesData = useAppraisalTimeSeriesData();
    const performanceRatingsData = usePerformanceRatingsData();
    const appraisalDepartmentData = useAppraisalDepartmentData();
    const ratingTrendsData = useRatingTrendsData();

    return (
      <div className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Appraisal Completion Trends</CardTitle>
              <CardDescription>Monthly appraisal completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={appraisalCompletionConfig} className="h-72">
                <LineChart data={appraisalTimeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [`${value} appraisals`, "Appraisals Completed"]} />} 
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-value)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Ratings Distribution</CardTitle>
            <CardDescription>Distribution of performance ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={performanceRatingConfig} className="h-72">
              <PieChart>
                <ChartTooltip 
                  content={<ChartTooltipContent hideLabel formatter={(value) => [`${value}%`, ""]} />} 
                />
                <Pie
                  data={performanceRatingsData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {performanceRatingsData.map((entry, index) => {
                    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
                    return <Cell key={`cell-${index}`} fill={colors[index]} />;
                  })}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appraisals by Department</CardTitle>
            <CardDescription>Completed appraisals per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={appraisalDepartmentConfig} className="h-72">
              <BarChart data={appraisalDepartmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [`${value} appraisals`, "Appraisals"]} />} 
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Rating Trends</CardTitle>
            <CardDescription>Average performance ratings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ratingTrendsConfig} className="h-72">
              <AreaChart data={ratingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, "Average Rating"]} />} 
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

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