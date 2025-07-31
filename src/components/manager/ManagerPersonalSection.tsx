import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LazyManagerGoalsDashboard from "../LazyManagerGoalsDashboard";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "@/components/appraisals/table";
import { useAppraisals } from "@/hooks/useAppraisals";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { YearFilter } from "@/components/shared/YearFilter";
import { useState } from "react";

const ManagerPersonalSection = () => {
  const { isDemoMode, demoRole } = useDemoMode();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { data: appraisals = [], isLoading: loading } = useAppraisals({ 
    employeeId: isDemoMode ? undefined : 'current-user',
    year: selectedYear
  });

  // Filter for personal appraisals only
  const personalAppraisals = appraisals.filter(appraisal => 
    appraisal.employeeId === 'current-user' || isDemoMode
  );

  const appraisalColumns = createAppraisalColumns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personal</h2>
          <p className="text-muted-foreground">Your own goals and appraisals</p>
        </div>
        <YearFilter 
          value={selectedYear}
          onValueChange={setSelectedYear}
        />
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="goals">My Goals</TabsTrigger>
          <TabsTrigger value="appraisals">My Appraisals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Your Personal Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyManagerGoalsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appraisals">
          <Card>
            <CardHeader>
              <CardTitle>Your Appraisals</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={appraisalColumns}
                data={personalAppraisals}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerPersonalSection;