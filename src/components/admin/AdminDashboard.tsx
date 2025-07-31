
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, FileText, Calendar, BarChart3, AlertTriangle } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import { SystemHealthMetrics } from "./SystemHealthMetrics";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { useEmployeeStore } from "@/stores/employeeStore";
import { prefetchEmployees, prefetchReportsData } from "@/lib/prefetch";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { filters } = useEmployeeStore();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  // Fetch appraisals count
  const { data: appraisalsData, isLoading: appraisalsLoading } = useQuery({
    queryKey: ["admin-dashboard-appraisals"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appraisals")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch goals count  
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["admin-dashboard-goals"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch overdue items for oversight
  const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ["admin-dashboard-overdue"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appraisals")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      
      if (error) throw error;
      return count || 0;
    },
  });

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
  
  const stats = [
    {
      title: "Total Appraisals",
      value: appraisalsLoading ? "..." : appraisalsData?.toString() || "0",
      description: "All appraisals",
      icon: FileText,
      iconColor: "text-blue-600"
    },
    {
      title: "Active Employees",
      value: employeesLoading ? "..." : activeEmployees.toString(),
      description: "Currently employed",
      icon: Users,
      iconColor: "text-green-600"
    },
    {
      title: "Total Goals",
      value: goalsLoading ? "..." : goalsData?.toString() || "0",
      description: "Organization goals",
      icon: TrendingUp,
      iconColor: "text-purple-600"
    },
    {
      title: "Overdue Items",
      value: overdueLoading ? "..." : overdueData?.toString() || "0",
      description: "Requires attention",
      icon: AlertTriangle,
      iconColor: "text-red-600"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <DemoModeBanner />
      
      <PageHeader
        title="Admin Dashboard"
        description="Organization oversight and management center"
      >
        <Button
          onClick={() => navigate("/admin/reports")}
          onMouseEnter={() => prefetchReportsData(queryClient)}
          variant="outline"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

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
              <Button
                variant="outline"
                className="w-full justify-start tap-target h-12 sm:h-10"
                onClick={() => navigate("/admin/employees")}
                onMouseEnter={() => prefetchEmployees(queryClient, filters)}
              >
                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Manage Employees</span>
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
    </div>
  );
};

export default AdminDashboard;
