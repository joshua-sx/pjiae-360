import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "@/features/appraisals/components/table";
import { useAppraisals } from "@/features/appraisals/hooks/useAppraisals";
import { useGoals } from "@/features/goal-management/hooks/useGoals";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { YearFilter } from "@/components/shared/YearFilter";
import { useState } from "react";

const ManagerTeamSection = () => {
  const navigate = useNavigate();
  const { getRolePageUrl } = useRoleBasedNavigation();
  const { isDemoMode, demoRole } = useDemoMode();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { data: teamAppraisals = [], isLoading: appraisalsLoading } = useAppraisals({ 
    // Manager sees team appraisals (direct reports)
    employeeId: isDemoMode ? undefined : 'current-user',
    year: selectedYear
  });

  const { goals: teamGoals = [], loading: goalsLoading } = useGoals({ 
    // Manager sees team goals
    employeeId: isDemoMode ? undefined : 'current-user'
  });

  const appraisalColumns = createAppraisalColumns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team</h2>
          <p className="text-muted-foreground">Manage goals and appraisals for your direct reports</p>
        </div>
        <div className="flex items-center gap-3">
          <YearFilter 
            value={selectedYear}
            onValueChange={setSelectedYear}
          />
        </div>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="goals">Team Goals</TabsTrigger>
          <TabsTrigger value="appraisals">Team Appraisals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Goals</CardTitle>
              <Button onClick={() => navigate(getRolePageUrl("team/goals/new"))}>
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </CardHeader>
            <CardContent>
              <LazyManagerGoalsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appraisals">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Appraisals</CardTitle>
              <Button onClick={() => navigate(getRolePageUrl("team/appraisals/new"))}>
                <Plus className="mr-2 h-4 w-4" />
                Start Appraisal
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={appraisalColumns}
                data={teamAppraisals}
                isLoading={appraisalsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerTeamSection;