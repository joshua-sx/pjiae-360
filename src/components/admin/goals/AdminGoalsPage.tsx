
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, Calendar, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { useNavigate } from "react-router-dom";

const AdminGoalsPage = () => {
  const navigate = useNavigate();

  const handleCreateGoal = () => {
    navigate("/goals/new");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Monitor and manage all goals across your organization"
      >
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button onClick={handleCreateGoal}>
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Active this year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+12% from last year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees with Goals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">148</div>
            <p className="text-xs text-muted-foreground">95% of workforce</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Quarter</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Ending soon</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization-wide Goals Overview</CardTitle>
          <CardDescription>
            Monitor goal progress, performance trends, and completion rates across all departments and employees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comprehensive Goals Dashboard</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              View all active and historical goals, track progress across teams, analyze performance metrics, and identify trends to drive organizational success.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                View All Goals
              </Button>
              <Button>
                Performance Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGoalsPage;
