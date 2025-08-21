import { PageHeader } from "@/components/ui/page-header";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { useAppraisals } from "@/features/appraisals/hooks/useAppraisals";
import { DataTable } from "@/components/ui/data-table";
import { createAppraisalColumns } from "@/features/appraisals/components/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { YearFilter } from "@/components/shared/YearFilter";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

const EmployeeAppraisalsPage = () => {
  const { isDemoMode, demoRole } = useDemoMode();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { data: appraisals = [], isLoading: loading } = useAppraisals({ 
    // Employee sees only their own appraisals
    employeeId: isDemoMode ? undefined : 'current-user',
    year: selectedYear
  });

  // Filter appraisals for employee scope - only personal appraisals
  const personalAppraisals = appraisals.filter(appraisal => 
    appraisal.employeeId === 'current-user' || isDemoMode
  );

  const appraisalColumns = createAppraisalColumns();

  const pendingAppraisals = personalAppraisals.filter(a => a.status === 'draft');
  const completedAppraisals = personalAppraisals.filter(a => a.status === 'completed');
  const inReviewAppraisals = personalAppraisals.filter(a => a.status === 'in_progress');

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <PageHeader
        title="My Appraisals"
        description="View your performance appraisal history and feedback"
      >
        <YearFilter 
          value={selectedYear}
          onValueChange={setSelectedYear}
        />
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalAppraisals.length}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppraisals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your input
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inReviewAppraisals.length}</div>
            <p className="text-xs text-muted-foreground">
              Being reviewed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppraisals.length}</div>
            <p className="text-xs text-muted-foreground">
              Finalized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Appraisals Table */}
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
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAppraisalsPage;