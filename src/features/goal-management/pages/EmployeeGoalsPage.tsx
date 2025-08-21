import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useGoals, type Goal } from "../hooks/useGoals";
import { usePermissions } from "@/features/access-control";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoGoalStore } from "@/stores/demoGoalStore";
import { GoalDetailDrawer } from "@/components/goals/GoalDetailDrawer";
import { useAuth } from "@/hooks/useAuth";

// Enhanced goal columns with actions for demo mode
const createGoalColumns = (isDemoMode: boolean, onViewGoal?: (goalId: string) => void) => [
  { accessorKey: 'title', header: 'Goal' },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status');
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'published': return 'bg-blue-100 text-blue-800';
          case 'active': return 'bg-green-100 text-green-800';
          case 'completed': return 'bg-emerald-100 text-emerald-800';
          case 'archived': return 'bg-gray-100 text-gray-600';
          default: return 'bg-gray-100 text-gray-800';
        }
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }
  },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'dueDate', header: 'Due Date' },
  ...(isDemoMode ? [{
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const goal = row.original;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewGoal?.(goal.id);
          }}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      );
    }
  }] : [])
];

const EmployeeGoalsPage = () => {
  const { isDemoMode, demoRole } = useDemoMode();
  const permissions = usePermissions();
  const { user } = useAuth();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const { getGoalsByEmployee } = useDemoGoalStore();
  
  // Use demo role if in demo mode, otherwise use actual permissions
  const effectiveRole = isDemoMode ? demoRole : (
    permissions.isEmployee ? 'employee' : 'employee'
  );
  
  const { goals: regularGoals = [], loading } = useGoals({ 
    // Employee sees only their own goals
    employeeId: isDemoMode ? undefined : 'current-user'
  });

  // Use demo goals when in demo mode, filtered by current user
  const employeeGoals = isDemoMode 
    ? getGoalsByEmployee(user?.user_metadata?.full_name || '') 
    : regularGoals;

  // Convert demo goals to Goal format for consistency
  const goals = isDemoMode ? employeeGoals.map(demoGoal => ({
    id: demoGoal.id,
    title: demoGoal.title,
    employeeName: demoGoal.employeeName,
    employeeId: demoGoal.employeeId,
    status: demoGoal.status,
    dueDate: demoGoal.dueDate,
    description: demoGoal.description,
    type: demoGoal.type,
    weight: demoGoal.weight,
    year: demoGoal.year,
    progress: demoGoal.progress.length * 25 // Simple progress calculation
  } as Goal)) : regularGoals;

  // Filter goals for employee scope - only personal goals
  const personalGoals = goals.filter(goal => 
    goal.type === 'Performance' || goal.type === 'Development' || !goal.type
  );

  const activeGoals = personalGoals.filter(goal => goal.status === 'active');
  const completedGoals = personalGoals.filter(goal => goal.status === 'completed');
  const averageProgress = personalGoals.length > 0 
    ? Math.round(personalGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / personalGoals.length)
    : 0;

  const handleViewGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsDetailDrawerOpen(true);
  };

  const goalColumns = createGoalColumns(isDemoMode, handleViewGoal);

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

      {/* Demo Goal Detail Drawer */}
      <GoalDetailDrawer
        goalId={selectedGoalId}
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
      />
    </div>
  );
};

export default EmployeeGoalsPage;