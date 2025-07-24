import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Download, FileText, TrendingUp, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const ReportsPage = () => {
  const [selectedCycle, setSelectedCycle] = useState<string>('current');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Fetch basic statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { data: employees },
        { data: goals },
        { data: appraisals },
        { data: completedAppraisals }
      ] = await Promise.all([
        supabase.from('employee_info').select('id').eq('status', 'active'),
        supabase.from('goals').select('id'),
        supabase.from('appraisals').select('id'),
        supabase.from('appraisals').select('id').eq('status', 'completed')
      ]);

      return {
        totalEmployees: employees?.length || 0,
        totalGoals: goals?.length || 0,
        totalAppraisals: appraisals?.length || 0,
        completedAppraisals: completedAppraisals?.length || 0
      };
    }
  });

  // Fetch cycles for filter
  const { data: cycles = [] } = useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const { data } = await supabase.from('cycles').select('id, name, status').order('created_at', { ascending: false });
      return data || [];
    }
  });

  // Fetch divisions for filter
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data } = await supabase.from('divisions').select('id, name').order('name');
      return data || [];
    }
  });

  // Fetch chart data
  const { data: chartData } = useQuery({
    queryKey: ['analytics-charts', selectedCycle, selectedDivision],
    queryFn: async () => {
      // Fetch division performance data
      const { data: divisionData } = await supabase
        .from('divisions')
        .select(`
          id,
          name,
          employee_info(id, status)
        `);

      // Fetch appraisal completion by status
      const { data: appraisalStatusData } = await supabase
        .from('appraisals')
        .select('status')
        .neq('status', 'draft');

      // Fetch goals by status
      const { data: goalsData } = await supabase
        .from('goals')
        .select('status, type, employee_id')
        .neq('status', 'draft');

      const divisionStats = divisionData?.map(division => ({
        name: division.name,
        employees: division.employee_info?.filter(emp => emp.status === 'active').length || 0
      })) || [];

      const statusCounts = appraisalStatusData?.reduce((acc, appraisal) => {
        acc[appraisal.status] = (acc[appraisal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const goalProgress = goalsData?.reduce((acc, goal) => {
        acc[goal.status] = (acc[goal.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        divisionStats,
        appraisalStatus: Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        })),
        goalProgress: Object.entries(goalProgress).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      };
    }
  });

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
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="View performance data, completion rates, and generate reports"
      >
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Filter reports by cycle and division
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Cycle</SelectItem>
              {cycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Division Performance Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Employees by Division</CardTitle>
            <CardDescription>Distribution of active employees across divisions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              employees: {
                label: "Employees",
                color: "hsl(var(--chart-1))",
              },
            }} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData?.divisionStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="employees" fill="var(--color-employees)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Appraisal Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Appraisal Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
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
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              Department Performance Summary
            </Button>
            <Button variant="outline" className="justify-start">
              Goal Achievement by Division
            </Button>
            <Button variant="outline" className="justify-start">
              Competency Trends Report
            </Button>
            <Button variant="outline" className="justify-start">
              Manager Effectiveness Report
            </Button>
          </div>
          <Button className="w-full mt-4">
            <Download className="mr-2 h-4 w-4" />
            Generate Custom Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;