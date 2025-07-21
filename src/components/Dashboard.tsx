
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, FileText, Calendar } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

const Dashboard = () => {
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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to your appraisal management center"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Start New Appraisal
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">John completed Q4 self-assessment</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">New team member added</p>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">Q4 review cycle started</p>
                  <p className="text-xs text-slate-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Features we're working on for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">360° Feedback</h3>
              <p className="text-sm text-slate-600">Comprehensive peer reviews</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">AI Insights</h3>
              <p className="text-sm text-slate-600">Smart performance analytics</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Goal Tracking</h3>
              <p className="text-sm text-slate-600">Set and monitor objectives</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
