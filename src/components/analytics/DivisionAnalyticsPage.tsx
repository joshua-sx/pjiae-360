import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ChartToolbar } from "@/components/ui/chart-toolbar";
import { ChartDrillDownDrawer, type DrillDownFilter } from "@/components/analytics/ChartDrillDownDrawer";
import { SavedFiltersDropdown } from "@/components/filters/SavedFiltersDropdown";
import { usePreferences } from "@/hooks/usePreferences";
import { usePermissions } from "@/features/access-control/hooks/usePermissions";
import { useProfileQuery } from "@/hooks/useProfileQuery";
import { DateRange } from "react-day-picker";
import { exportChartToPNG } from "@/lib/export";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoalMetrics } from "@/features/goal-management/hooks/useGoalMetrics";
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
import { StandardPage } from "@/components/layout/StandardPage";
import { MetricGrid } from "@/components/layout/MetricGrid";
import { StatCard } from "@/components/ui/stat-card";
import { PageLoader } from "@/components/states/PageLoader";

const DivisionAnalyticsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { isAdmin, isDirector } = usePermissions();
  const { data: profileData } = useProfileQuery();
  const { data: goalMetrics, isLoading: goalLoading } = useGoalMetrics();
  const { data: appraisalMetrics, isLoading: appraisalLoading } = useAppraisalMetrics();
  const { data: orgMetrics, isLoading: orgLoading } = useOrgMetrics();
  const [activeTab, setActiveTab] = useState("goals");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCycle, setSelectedCycle] = useState("current");
  
  // For directors, force selectedDivision to their division; for admins, allow 'all'
  const userDivisionId = profileData?.profile?.division_id;
  const [selectedDivision, setSelectedDivision] = useState(
    isDirector && userDivisionId ? userDivisionId : "all"
  );
  
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownFilter, setDrillDownFilter] = useState<DrillDownFilter>({});
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const chartRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { preferences } = usePreferences();

  // Enforce division scoping for directors
  const effectiveDivisionId = isDirector && userDivisionId ? userDivisionId : 
    (selectedDivision === "all" ? undefined : selectedDivision);

  if (goalLoading || appraisalLoading || orgLoading) {
    return <PageLoader />;
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

  const handleChartClick = (source: "goals" | "appraisals", filter: DrillDownFilter, title: string) => {
    setDrillDownFilter(filter);
    setDrillDownTitle(title);
    setDrillDownOpen(true);
  };

  const GoalsAnalytics = () => {
    const goalsTimeSeriesData = useGoalsTimeSeriesData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });
    const goalStatusData = useGoalStatusData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });
    const departmentGoalsData = useDepartmentGoalsData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });

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
    const appraisalTimeSeriesData = useAppraisalTimeSeriesData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });
    const performanceRatingsData = usePerformanceRatingsData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });
    const appraisalDepartmentData = useAppraisalDepartmentData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });
    const ratingTrendsData = useRatingTrendsData({ 
      dateRange, 
      cycleId: selectedCycle, 
      divisionId: effectiveDivisionId 
    });

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
    <StandardPage
      title="Division Analytics"
      description="Performance insights and trends across your division"
      right={
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    >
      {isDemoMode && <DemoModeBanner />}
      
      <MetricGrid>
        <StatCard 
          title="Total Employees" 
          value={orgMetrics?.totalEmployees || 0} 
          description="Active employees" 
          icon={Users} 
        />
        <StatCard 
          title={activeTab === "goals" ? "Division Goals" : "Total Appraisals"} 
          value={activeTab === "goals" ? (goalMetrics?.totalGoals || 0) : (appraisalMetrics?.totalAppraisals || 0)} 
          description={activeTab === "goals" ? "Active division goals" : "Total appraisals"} 
          icon={Target} 
        />
        <StatCard 
          title="Completion Rate" 
          value={activeTab === "goals" ? `${goalMetrics?.completionRate || 0}%` : `${Math.round(((appraisalMetrics?.completed || 0) / (appraisalMetrics?.totalAppraisals || 1)) * 100)}%`} 
          description={activeTab === "goals" ? "Goals completed" : "Appraisals completed"} 
          icon={CheckCircle} 
        />
        <StatCard 
          title="Division Average" 
          value="4.1" 
          description="Performance rating" 
          icon={Star} 
        />
      </MetricGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="goals">
          <GoalsAnalytics />
        </TabsContent>
        <TabsContent value="appraisals">
          <AppraisalsAnalytics />
        </TabsContent>
      </Tabs>

      <ChartDrillDownDrawer
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        source={activeTab === "goals" ? "goals" : "appraisals"}
        title={drillDownTitle}
        filter={drillDownFilter}
      />
    </StandardPage>
  );
};

export default DivisionAnalyticsPage;