import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useGoals } from "../hooks/useGoals";
import { usePermissions } from "@/features/access-control";
import { DataTable } from "@/components/ui/data-table";
// Placeholder for goal columns - create a simple version
const goalColumns = [
  { accessorKey: 'title', header: 'Goal' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'progress', header: 'Progress' },
  { accessorKey: 'dueDate', header: 'Due Date' }
];
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Clock } from "lucide-react";

const EmployeeGoalsPage = () => {
  const { isDemoMode, demoRole } = useDemoMode();
  const permissions = usePermissions();
  
  // Use demo role if in demo mode, otherwise use actual permissions
  const effectiveRole = isDemoMode ? demoRole : (
    permissions.isEmployee ? 'employee' : 'employee'
  );
  
  const { goals = [], loading } = useGoals({ 
    // Employee sees only their own goals
    employeeId: isDemoMode ? undefined : 'current-user'
  });

  // Filter goals for employee scope - only personal goals
  const personalGoals = goals.filter(goal => 
    goal.type === 'individual'
  );

  const activeGoals = personalGoals.filter(goal => goal.status === 'active');
  const completedGoals = personalGoals.filter(goal => goal.status === 'completed');
  const averageProgress = personalGoals.length > 0 
    ? Math.round(personalGoals.reduce((sum, goal) => sum + goal.progress, 0) / personalGoals.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Goals"
        description="Track and manage your personal performance goals"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              Goals achieved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={goalColumns}
            data={personalGoals}
            enablePagination={true}
            enableSorting={true}
            isLoading={loading}
            searchKey="title"
            searchPlaceholder="Search goals..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeGoalsPage;