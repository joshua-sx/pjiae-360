import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Download, FileText, TrendingUp, Users, Target, CheckCircle, AlertCircle } from 'lucide-react';

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
      const { data } = await supabase.from('divisions').select('id, name, code').order('name');
      return data || [];
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
      <div className="flex justify-between items-center">
        <PageHeader
          title="Reports & Analytics"
          description="View performance data, completion rates, and generate reports"
        />
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

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

      {/* Quick Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>
              View detailed performance metrics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Score</span>
                <Badge variant="secondary">3.8/5.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Goal Achievement Rate</span>
                <Badge variant="secondary">87%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Top Performing Division</span>
                <Badge variant="default">Engineering</Badge>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>

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
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Department Performance Summary
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Goal Achievement by Division
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Competency Trends Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
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
    </div>
  );
};

export default ReportsPage;