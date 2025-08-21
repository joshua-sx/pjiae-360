
import React, { useMemo, Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, Users, Settings, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRoleStatistics } from "@/hooks/useRoleStatistics";
import { useEmployeeRoles, type EmployeeWithRole } from "@/hooks/useEmployeeRoles";
import { RoleAssignmentDialog } from "./RoleAssignmentDialog";
import { BulkRoleAssignmentButton } from "./BulkRoleAssignmentButton";
import { RoleInferenceActions } from "./RoleInferenceActions";
import { createRoleColumns } from "./role-columns";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { ResponsiveEmployeeTable } from "@/components/ui/responsive-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppRole } from "@/features/access-control/hooks/usePermissions";

const RolesPage = () => {
  const { stats: roleStats, loading: statsLoading } = useRoleStatistics();
  const { data: employees, isLoading: employeesLoading, refetch } = useEmployeeRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRole | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeWithRole[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const handleAssignRole = (employee: EmployeeWithRole) => {
    setSelectedEmployee(employee);
    setShowAssignDialog(true);
  };

  const handleBulkAssign = () => {
    setSelectedEmployee(null);
    setShowAssignDialog(true);
  };

  const handleAssignmentSuccess = () => {
    refetch();
    setSelectedEmployees([]);
  };

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employees || !searchTerm) return employees || [];
    
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.current_roles?.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  // Create table instance
  const { table } = useDataTable({
    data: filteredEmployees,
    columns: createRoleColumns(handleAssignRole),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  return (
    <DashboardLayout>
      <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 overflow-x-clip">
        <PageHeader
          title="Role & Permissions"
          description="Manage user roles, permissions, and access controls"
        >
          <div className="flex gap-2">
            <RoleInferenceActions variant="bulk" />
          </div>
        </PageHeader>

        {/* Role Statistics Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.totalRoles}
              </div>
              <p className="text-xs text-muted-foreground">System roles</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.admins}
              </div>
              <p className="text-xs text-muted-foreground">Full access</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Directors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.directors}
              </div>
              <p className="text-xs text-muted-foreground">Leadership</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.managers}
              </div>
              <p className="text-xs text-muted-foreground">Team leaders</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.employees}
              </div>
              <p className="text-xs text-muted-foreground">Standard access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : roleStats?.unassigned}
              </div>
              <p className="text-xs text-muted-foreground">No roles</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="space-y-4 min-w-0">
            <div className="space-y-4">
              {/* Filter Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedEmployees.length > 0 && (
                    <BulkRoleAssignmentButton
                      selectedEmployees={selectedEmployees}
                      onSuccess={handleAssignmentSuccess}
                    />
                  )}
                  <DataTableViewOptions 
                    table={table} 
                    triggerClassName="h-9 px-3 text-sm font-medium border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  />
                </div>
              </div>
            </div>
            
            <div className="w-full min-w-0 max-w-full">
              <Suspense fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              }>
                <ResponsiveEmployeeTable 
                  employees={filteredEmployees}
                  columns={createRoleColumns(handleAssignRole)}
                  table={table}
                  onEmployeeClick={handleAssignRole}
                  isLoading={employeesLoading}
                  className="w-full max-w-full min-w-0 table-container"
                  enableHorizontalScroll={true}
                  stickyColumns={["select", "name"]}
                  enableFiltering={false}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Role Assignment Dialog */}
        <RoleAssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          employee={selectedEmployee}
          employees={selectedEmployees}
          mode={selectedEmployee ? "single" : "bulk"}
          onSuccess={handleAssignmentSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default RolesPage;
