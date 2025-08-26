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
import { PageContent } from "@/components/ui/page";
import { useReportStats } from '@/hooks/useReportStats';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useAnalyticsCharts } from '@/hooks/useAnalyticsCharts';
import { DashboardLayout } from "@/components/DashboardLayout";

export default function ReportsPage() {
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
    <DashboardLayout>
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
          // ... keep existing content (filters, stats, charts, etc.)
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          // ... keep existing goals content
        </TabsContent>

        <TabsContent value="appraisals" className="space-y-6">
          // ... keep existing appraisals content  
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}