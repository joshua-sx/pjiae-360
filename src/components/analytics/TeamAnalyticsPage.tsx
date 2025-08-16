import { useState, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartToolbar } from "@/components/ui/chart-toolbar";
import { ChartDrillDownDrawer, type DrillDownFilter } from "@/components/analytics/ChartDrillDownDrawer";
import { SavedFiltersDropdown } from "@/components/filters/SavedFiltersDropdown";
import { usePreferences } from "@/hooks/usePreferences";
import { DateRange } from "react-day-picker";
import { useGoalMetrics } from "@/hooks/useGoalMetrics";
import { useAppraisalMetrics } from "@/hooks/useAppraisalMetrics";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import LoadingSpinner from "@/components/onboarding/components/LoadingSpinner";
import { TrendingUp, Target, CheckCircle, Star } from "lucide-react";
import { PageContent } from "@/components/ui/page-content";

const TeamAnalyticsPage = () => {
  const { isDemoMode } = useDemoMode();
  const { data: goalMetrics, isLoading: goalLoading } = useGoalMetrics();
  const { data: appraisalMetrics, isLoading: appraisalLoading } = useAppraisalMetrics();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCycle, setSelectedCycle] = useState("current");
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownFilter, setDrillDownFilter] = useState<DrillDownFilter>({});
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [drillDownSource, setDrillDownSource] = useState<"goals" | "appraisals">("goals");
  const { preferences } = usePreferences();

  if (goalLoading || appraisalLoading) {
    return <LoadingSpinner />;
  }

  const handleChartClick = (source: "goals" | "appraisals", filter: DrillDownFilter, title: string) => {
    setDrillDownSource(source);
    setDrillDownFilter(filter);
    setDrillDownTitle(title);
    setDrillDownOpen(true);
  };

  return (
    <PageContent>
      {isDemoMode && <DemoModeBanner />}
      
      <div className="flex items-center justify-between">
        <PageHeader
          title="Team Analytics"
          description="Performance insights and trends for your team"
        />
        <SavedFiltersDropdown
          entity="analytics"
          currentFilters={{ dateRange, selectedCycle }}
          onApplyFilter={(filters) => {
            setDateRange(filters.dateRange);
            setSelectedCycle(filters.selectedCycle || "current");
          }}
        />
      </div>

      <ChartToolbar
        selectedRange={dateRange}
        onRangeChange={setDateRange}
        onPreset={(preset) => {
          // Apply preset logic here
          const now = new Date();
          switch (preset) {
            case '30d':
              setDateRange({ from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now });
              break;
            case '90d':
              setDateRange({ from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now });
              break;
            default:
              setDateRange(undefined);
          }
        }}
        selectedCycle={selectedCycle}
        onCycleChange={setSelectedCycle}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalMetrics?.totalGoals || 0}</div>
            <p className="text-xs text-muted-foreground">Active team goals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalMetrics?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Goals completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Appraisals</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appraisalMetrics?.totalAppraisals || 0}</div>
            <p className="text-xs text-muted-foreground">Total appraisals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Overview</CardTitle>
            <CardDescription>Team goal completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">On Track</span>
                <span className="text-sm font-medium">{Math.floor((goalMetrics?.totalGoals || 0) * 0.7)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">At Risk</span>
                <span className="text-sm font-medium">{Math.floor((goalMetrics?.totalGoals || 0) * 0.2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="text-sm font-medium">{Math.floor((goalMetrics?.totalGoals || 0) * 0.1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appraisal Status</CardTitle>
            <CardDescription>Team appraisal completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed</span>
                <span className="text-sm font-medium">{appraisalMetrics?.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <span className="text-sm font-medium">{appraisalMetrics?.inProgress || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <span className="text-sm font-medium">{appraisalMetrics?.overdue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChartDrillDownDrawer
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        source={drillDownSource}
        title={drillDownTitle}
        filter={drillDownFilter}
      />
    </PageContent>
  );
};

export default TeamAnalyticsPage;