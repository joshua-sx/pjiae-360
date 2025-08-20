import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "@/features/appraisals/components/table/appraisal-columns";
import { useAppraisals, type Appraisal } from "@/features/appraisals/hooks/useAppraisals";
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
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
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

  const handleAppraisalRowClick = (appraisal: Appraisal) => {
    // Convert appraisal data to employee-like structure for preview
    setSelectedEmployee({
      name: appraisal.employeeName,
      position: appraisal.type,
      department: appraisal.department || "—",
      status: appraisal.status,
      performance: appraisal.performance,
      year: appraisal.createdAt ? new Date(appraisal.createdAt).getFullYear() : "—",
      score: appraisal.score || "—"
    });
    setIsPreviewOpen(true);
  };

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
                onRowClick={handleAppraisalRowClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Performance Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {selectedEmployee.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="border-border text-foreground bg-background">
                      {selectedEmployee.position}
                    </Badge>
                    <Badge variant="outline" className="border-border text-foreground bg-background">
                      {selectedEmployee.department}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Performance</label>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {selectedEmployee.performance}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <p className="mt-1">
                    <Badge variant="outline">
                      {selectedEmployee.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Year</label>
                  <p>{selectedEmployee.year}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Score</label>
                  <p>{selectedEmployee.score}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerTeamSection;