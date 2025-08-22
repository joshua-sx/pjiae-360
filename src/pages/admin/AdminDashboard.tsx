
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, FileText, Calendar, BarChart3, AlertTriangle } from "lucide-react";
import { useEmployeeCounts } from "@/hooks/useEmployeeCounts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDataAccessGuard } from '@/hooks/useDataAccessGuard';
import { useDemoData } from '@/contexts/DemoDataContext';
import { ensureProductionMode } from '@/lib/production-mode-guard';
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import { SystemHealthMetrics } from "../../components/admin/SystemHealthMetrics";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { StandardPage } from "@/components/layout/StandardPage";
import { MetricGrid } from "@/components/layout/MetricGrid";
import { withPerformanceMonitoring } from "@/lib/performance-monitor";
import { usePerformanceDebug } from "@/hooks/usePerformanceDebug";
import { PageSkeleton, ListSkeleton } from "@/components/ui/loading/Loaders";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OnboardingNudge } from "@/components/dashboard/OnboardingNudge";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDemoMode, readyForDb } = useDataAccessGuard();
  const { getAppraisalsCount, getGoalsCount, getOverdueCount } = useDemoData();
  const { counts: employeeCounts, loading: employeesLoading } = useEmployeeCounts();
  const { isEnabled: perfDebugEnabled, toggleDebug } = usePerformanceDebug();

  // Fetch appraisals count with performance monitoring
  const { data: appraisalsData, isLoading: appraisalsLoading } = useQuery({
    queryKey: ["admin-dashboard-appraisals", isDemoMode],
    queryFn: withPerformanceMonitoring(
      'admin_dashboard_appraisals',
      async () => {
        if (isDemoMode) {
          return getAppraisalsCount();
        }
        
        try {
          ensureProductionMode('admin-dashboard-appraisals');
          const { count, error } = await supabase
            .from("appraisals")
            .select("*", { count: "exact", head: true });
          
          if (error) throw error;
          return count || 0;
        } catch (error) {
          console.warn('Failed to fetch appraisals count:', error);
          return 0;
        }
      },
      { isDemoMode, component: 'admin_dashboard' }
    ),
    enabled: isDemoMode || readyForDb,
    retry: false,
  });

  // Fetch goals count with performance monitoring
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["admin-dashboard-goals", isDemoMode],
    queryFn: withPerformanceMonitoring(
      'admin_dashboard_goals',
      async () => {
        if (isDemoMode) {
          return getGoalsCount();
        }
        
        try {
          ensureProductionMode('admin-dashboard-goals');
          const { count, error } = await supabase
            .from("goals")
            .select("*", { count: "exact", head: true });
          
          if (error) throw error;
          return count || 0;
        } catch (error) {
          console.warn('Failed to fetch goals count:', error);
          return 0;
        }
      },
      { isDemoMode, component: 'admin_dashboard' }
    ),
    enabled: isDemoMode || readyForDb,
    retry: false,
  });

  // Fetch overdue items with performance monitoring
  const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ["admin-dashboard-overdue", isDemoMode],
    queryFn: withPerformanceMonitoring(
      'admin_dashboard_overdue',
      async () => {
        if (isDemoMode) {
          return getOverdueCount();
        }
        
        try {
          ensureProductionMode('admin-dashboard-overdue');
          const { count, error } = await supabase
            .from("appraisals")
            .select("*", { count: "exact", head: true })
            .eq("status", "draft");
          
          if (error) throw error;
          return count || 0;
        } catch (error) {
          console.warn('Failed to fetch overdue count:', error);
          return 0;
        }
      },
      { isDemoMode, component: 'admin_dashboard' }
    ),
    enabled: isDemoMode || readyForDb,
    retry: false,
  });

  const totalEmployees = employeeCounts.total;
  const activeEmployees = employeeCounts.active;
  
  const stats = [
    {
      title: "Total Appraisals",
      value: appraisalsData?.toString() || "0",
      description: "All appraisals",
      icon: FileText,
      iconColor: "text-blue-600",
      loading: appraisalsLoading
    },
    {
      title: "Active Employees", 
      value: activeEmployees.toString(),
      description: "Currently employed",
      icon: Users,
      iconColor: "text-green-600",
      loading: employeesLoading
    },
    {
      title: "Total Goals",
      value: goalsData?.toString() || "0", 
      description: "Organization goals",
      icon: TrendingUp,
      iconColor: "text-purple-600",
      loading: goalsLoading
    },
    {
      title: "Overdue Items",
      value: overdueData?.toString() || "0",
      description: "Requires attention", 
      icon: AlertTriangle,
      iconColor: "text-red-600",
      loading: overdueLoading
    }
  ];

  return (
    <DashboardLayout>
      <StandardPage
        title="Admin Dashboard"
        description="Organization oversight and management center"
        right={
          <div className="flex items-center gap-2">
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleDebug}
                className={perfDebugEnabled ? "bg-yellow-100 text-yellow-800" : ""}
              >
                🐛 Perf {perfDebugEnabled ? 'ON' : 'OFF'}
              </Button>
            )}
            <Button onClick={() => navigate("/admin/reports")} variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        }
      >
        <DemoModeBanner />
        
        <OnboardingNudge />
        
        {(appraisalsLoading || employeesLoading || goalsLoading || overdueLoading) ? (
          <PageSkeleton />
        ) : (
          <MetricGrid>
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </MetricGrid>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor key performance indicators and system status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemHealthMetrics />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Administrative oversight and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start tap-target h-12 sm:h-10" onClick={() => navigate("/admin/employees")}>
                  <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Manage Employees</span>
                </Button>
                <Button variant="outline" className="w-full justify-start tap-target h-12 sm:h-10" onClick={() => navigate("/admin/employees/invites")}>
                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Pending Invitations</span>
                </Button>
                <Button variant="outline" className="w-full justify-start tap-target h-12 sm:h-10" onClick={() => navigate("/admin/organization")}>
                  <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Organization Structure</span>
                </Button>
                <Button variant="outline" className="w-full justify-start tap-target h-12 sm:h-10" onClick={() => navigate("/admin/audit")}>
                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Audit Logs</span>
                </Button>
                <Button variant="outline" className="w-full justify-start tap-target h-12 sm:h-10" onClick={() => navigate("/admin/settings")}>
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <ActivityFeed />
      </StandardPage>
    </DashboardLayout>
  );
}
