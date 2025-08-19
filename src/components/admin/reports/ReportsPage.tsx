import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Download, FileText, TrendingUp, Users, Target, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { DateRange } from 'react-day-picker';
import { ChartToolbar } from '@/components/ui/chart-toolbar';
import { exportChartToPNG, exportToCSV } from '@/lib/export';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContent } from '@/components/ui/page-content';
import { useReportStats } from '@/hooks/useReportStats';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useAnalyticsCharts } from '@/hooks/useAnalyticsCharts';

const ReportsPage = () => {
  const [selectedCycle, setSelectedCycle] = useState<string>('current');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { isMobile } = useMobileResponsive();

  // Refs for export
  const divByDivisionRef = useRef<HTMLDivElement>(null);
  const appraisalStatusRef = useRef<HTMLDivElement>(null);
  const goalsProgressRef = useRef<HTMLDivElement>(null);

  // Use extracted hooks
  const { data: stats } = useReportStats();
  const { cycles, divisions } = useReportFilters();
  const { data: chartData, isLoading: chartsLoading } = useAnalyticsCharts(selectedCycle, selectedDivision, dateRange);

  const completionRate = stats ? Math.round((stats.completedAppraisals / stats.totalAppraisals) * 100) : 0;

  const reportStats = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      description: "Active employees in system",
      icon: Users,
      iconColor: "text-blue-500"
    },
    {
      title: "Goals Set",
      value: stats?.totalGoals || 0,
      description: "Total goals assigned",
      icon: Target,
      iconColor: "text-green-500"
    },
    {
      title: "Appraisals",
      value: stats?.totalAppraisals || 0,
      description: "Total appraisals in progress",
      icon: FileText,
      iconColor: "text-purple-500"
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description: "Appraisals completed",
      icon: CheckCircle,
      iconColor: "text-emerald-500"
    }
  ];

  return (
    <PageContent>
      <PageHeader
        title="Analytics"
        description="View performance data, completion rates, and generate reports"
      >
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="appraisals">Appraisals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Filter by date range, cycle, and division; export datasets or images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartToolbar
            selectedRange={dateRange}
            onRangeChange={setDateRange}
            onPreset={(p) => {
              const now = new Date();
              const start = new Date();
              if (p === '30d') start.setDate(now.getDate() - 30);
              else if (p === '90d') start.setDate(now.getDate() - 90);
              else if (p === 'ytd') start.setMonth(0, 1);
              else if (p === '12m') start.setMonth(now.getMonth() - 12);
              else return setDateRange(undefined);
              setDateRange({ from: start, to: now });
            }}
            cycles={cycles}
            divisions={divisions}
            selectedCycle={selectedCycle}
            selectedDivision={selectedDivision}
            onCycleChange={setSelectedCycle}
            onDivisionChange={setSelectedDivision}
            onExportCSV={() => {
              // Export a combined CSV snapshot of all simple aggregates
              const rows = [
                { metric: 'Total Employees', value: stats?.totalEmployees ?? 0 },
                { metric: 'Goals', value: stats?.totalGoals ?? 0 },
                { metric: 'Appraisals', value: stats?.totalAppraisals ?? 0 },
                { metric: 'Completed Appraisals', value: stats?.completedAppraisals ?? 0 },
              ];
              exportToCSV(rows, 'analytics-overview.csv');
            }}
            onExportPNG={async () => {
              // Export main section as image (employees by division if present)
              await exportChartToPNG(divByDivisionRef.current, 'employees-by-division.png');
            }}
          />
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Completion Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal Completion Progress</CardTitle>
          <CardDescription>
            Track completion rates across the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.completedAppraisals || 0}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(stats?.totalAppraisals || 0) - (stats?.completedAppraisals || 0)}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">0</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2'}`}>
        {/* Division Performance Chart */}
        <Card className={isMobile ? '' : 'lg:col-span-1'}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Employees by Division</CardTitle>
              <CardDescription>Distribution of active employees across divisions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportChartToPNG(divByDivisionRef.current, 'employees-by-division.png')}>
                <ImageIcon className="mr-2 h-4 w-4" /> PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(chartData?.divisionStats || [], 'employees-by-division.csv')}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className={isMobile ? 'h-[250px] w-full' : 'h-[300px] w-full'} />
            ) : (
              <ChartContainer
                ref={divByDivisionRef}
                config={{
                  employees: {
                    label: "Employees",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className={isMobile ? "h-[250px]" : "h-[300px]"}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData?.divisionStats || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={isMobile ? 10 : 12}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis fontSize={isMobile ? 10 : 12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="employees"
                      fill="var(--color-employees)"
                      onClick={(_, index) => {
                        const item = (chartData?.divisionStats || [])[index as number] as any;
                        if (item?.id) setSelectedDivision(item.id);
                      }}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Appraisal Status Pie Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Appraisal Status</CardTitle>
              <CardDescription>Current status distribution</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportChartToPNG(appraisalStatusRef.current, 'appraisal-status.png')}>
                <ImageIcon className="mr-2 h-4 w-4" /> PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(chartData?.appraisalStatus || [], 'appraisal-status.csv')}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className={isMobile ? 'h-[250px] w-full' : 'h-[300px] w-full'} />
            ) : (
              <ChartContainer config={{
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-2))",
                },
                pending: {
                  label: "Pending",
                  color: "hsl(var(--chart-3))",
                },
                submitted: {
                  label: "Submitted",
                  color: "hsl(var(--chart-4))",
                },
              }} className={isMobile ? "h-[250px]" : "h-[300px]"} ref={appraisalStatusRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.appraisalStatus || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={!isMobile}
                    >
                      {(chartData?.appraisalStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => {
                      const total = (chartData?.appraisalStatus || []).reduce((s, d) => s + (d.value as number), 0);
                      const pct = total ? ((Number(value) / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div className="flex w-full justify-between">
                          <span>{name}</span>
                          <span className="font-mono">{value} ({pct}%)</span>
                        </div>
                      );
                    }} />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Overview</CardTitle>
          <CardDescription>Status distribution of organizational goals</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{
            value: {
              label: "Goals",
              color: "hsl(var(--chart-1))",
            },
          }} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData?.goalProgress || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Custom Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Custom Reports
          </CardTitle>
          <CardDescription>
            Generate custom reports for specific needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <Button variant="outline" className={`justify-start ${isMobile ? 'h-12' : ''}`}>
              Department Performance Summary
            </Button>
            <Button variant="outline" className={`justify-start ${isMobile ? 'h-12' : ''}`}>
              Goal Achievement by Division
            </Button>
            <Button variant="outline" className={`justify-start ${isMobile ? 'h-12' : ''}`}>
              Competency Trends Report
            </Button>
            <Button variant="outline" className={`justify-start ${isMobile ? 'h-12' : ''}`}>
              Manager Effectiveness Report
            </Button>
          </div>
          <Button className="w-full mt-4">
            <Download className="mr-2 h-4 w-4" />
            Generate Custom Report
          </Button>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goals Analytics</CardTitle>
              <CardDescription>
                Comprehensive view of goal-related metrics and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Goals"
                  value={stats?.totalGoals || 0}
                  description="All organizational goals"
                  icon={Target}
                  iconColor="text-green-500"
                />
              </div>
              
              {/* Goal Progress Chart */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Goal Progress by Status</CardTitle>
                  <CardDescription>Distribution of goals by completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    value: {
                      label: "Goals",
                      color: "hsl(var(--chart-1))",
                    },
                  }} className="h-[300px]" ref={goalsProgressRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={chartData?.goalProgress || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appraisals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appraisals Analytics</CardTitle>
              <CardDescription>
                Detailed appraisal metrics and completion tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Appraisals"
                  value={stats?.totalAppraisals || 0}
                  description="All appraisals in system"
                  icon={FileText}
                  iconColor="text-purple-500"
                />
                <StatCard
                  title="Completed"
                  value={stats?.completedAppraisals || 0}
                  description="Finished appraisals"
                  icon={CheckCircle}
                  iconColor="text-emerald-500"
                />
                <StatCard
                  title="Completion Rate"
                  value={`${completionRate}%`}
                  description="Overall completion percentage"
                  icon={TrendingUp}
                  iconColor="text-blue-500"
                />
              </div>

              {/* Appraisal Status Chart */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Appraisal Status Distribution</CardTitle>
                  <CardDescription>Current status of all appraisals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-2))",
                    },
                    pending: {
                      label: "Pending",
                      color: "hsl(var(--chart-3))",
                    },
                    submitted: {
                      label: "Submitted",
                      color: "hsl(var(--chart-4))",
                    },
                  }} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData?.appraisalStatus || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {(chartData?.appraisalStatus || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContent>
  );
};

export default ReportsPage;