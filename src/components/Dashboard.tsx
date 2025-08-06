
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, FileText, Calendar, Plus, Target } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { StatCard } from "@/components/ui/stat-card";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { useDemoMode } from "@/contexts/DemoModeContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isDemoMode } = useDemoMode();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  // Fetch appraisals count
  const { data: appraisalsData, isLoading: appraisalsLoading } = useQuery({
    queryKey: ["dashboard-appraisals"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appraisals")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch goals count  
  const { data: goalsData, isLoading: goalsLoading } = useQuery({
    queryKey: ["dashboard-goals"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("goals")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
  
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
    <div className="space-y-4 sm:space-y-6">
      {isDemoMode && <DemoModeBanner />}

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <ActivityFeed />
    </div>
  );
};

export default Dashboard;
