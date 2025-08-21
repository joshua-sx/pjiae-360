
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, Users, Settings, Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRoleStatistics } from "@/hooks/useRoleStatistics";
import { useEmployeeRoles, type EmployeeWithRole } from "@/hooks/useEmployeeRoles";
import { RoleAssignmentDialog } from "./RoleAssignmentDialog";
import { BulkRoleAssignmentButton } from "./BulkRoleAssignmentButton";
import { RoleInferenceActions } from "./RoleInferenceActions";
import { createRoleColumns } from "./role-columns";
import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppRole } from "@/features/access-control/hooks/usePermissions";

const RolesPage = () => {
  const { stats: roleStats, loading: statsLoading } = useRoleStatistics();
  const { data: employees, isLoading: employeesLoading, refetch } = useEmployeeRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRole | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeWithRole[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

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

  // Define columns for the employee roles table
  const columns = createRoleColumns(handleAssignRole);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
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

        {/* Employee Role Management Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee Role Management</CardTitle>
                <CardDescription>
                  Assign and manage roles for all employees in your organization
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {selectedEmployees.length > 0 && (
                  <BulkRoleAssignmentButton
                    selectedEmployees={selectedEmployees}
                    onSuccess={handleAssignmentSuccess}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Employee Table */}
              <DataTable
                columns={columns}
                data={filteredEmployees}
                enablePagination={true}
                enableSorting={true}
                enableSelection={true}
                isLoading={employeesLoading}
                searchKey="name"
                searchPlaceholder="Search employees..."
              />
            </div>
          </CardContent>
        </Card>

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
