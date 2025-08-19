import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, FileText, Calendar, Plus, Target } from "lucide-react";
import { useEmployeeCounts } from "@/hooks/useEmployeeCounts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { StatCard } from "@/components/ui/stat-card";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Seo } from "@/components/seo/Seo";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PageContent } from "@/components/ui/page-content";
import { PageHeader } from "@/components/ui/page-header";
import { MetricGrid } from "@/components/layout/MetricGrid";
const Dashboard = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();
  const { counts: employeeCounts, loading: employeesLoading } = useEmployeeCounts();

  // Fetch appraisals count (gated by permission)
  const { data: appraisalsData, isLoading: appraisalsLoading } = useQuery({
    queryKey: ["dashboard-appraisals"],
    enabled: permissions.canViewReports,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appraisals")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch goals count (gated by permission)
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["dashboard-goals"],
    enabled: permissions.canViewReports,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const totalEmployees = employeeCounts.total;
  const activeEmployees = employeeCounts.active;
  
  const stats = [
    {
      title: "Active Appraisals",
      value: appraisalsLoading ? "..." : appraisalsData?.toString() || "0",
      description: "In progress",
      icon: FileText,
      iconColor: "text-blue-600"
    },
    {
      title: "Team Members",
      value: employeesLoading ? "..." : activeEmployees.toString(),
      description: "Active employees",
      icon: Users,
      iconColor: "text-green-600"
    },
    {
      title: "Total Goals",
      value: goalsLoading ? "..." : goalsData?.toString() || "0",
      description: "Created goals",
      icon: TrendingUp,
      iconColor: "text-purple-600"
    },
    {
      title: "All Employees",
      value: employeesLoading ? "..." : totalEmployees.toString(),
      description: "Total in system",
      icon: Calendar,
      iconColor: "text-orange-600"
    }
  ];

  return (
    <PageContent>
      <Seo 
        title="Admin Dashboard | Performance Management"
        description="View key metrics and recent activity for goals and appraisals."
      />
      {isDemoMode && <DemoModeBanner />}

      <PageHeader title="Dashboard" />

      <PermissionGuard permissions={["view_reports"]}>
        <MetricGrid>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </MetricGrid>
      </PermissionGuard>

      <ActivityFeed />
    </PageContent>
  );
};

export default Dashboard;
