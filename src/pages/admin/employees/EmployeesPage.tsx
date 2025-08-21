
import React, { useMemo, Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, UserCheck, UserX, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOptimizedEmployees } from "@/hooks/useOptimizedEmployees";
import { useEmployeeCounts } from "@/hooks/useEmployeeCounts";
import { EmployeeFilters } from "../../../components/admin/employees/EmployeeFilters";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDataTable } from "@/hooks/use-data-table";
import { employeeColumns } from "../../../components/admin/employees/employee-columns";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";

import {
  useEmployeeStore,
  selectEmployeeFilters,
  selectSetEmployeeFilters,
} from "@/stores";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeTableMemo } from "../../../components/admin/employees/EmployeeTableMemo";
import { useDivisions } from "@/hooks/useDivisions";
import { useDepartments } from "@/hooks/useDepartments";

import { DashboardLayout } from "@/components/DashboardLayout";

const EmployeesPage = () => {
  const { data: employees, isLoading } = useOptimizedEmployees();
  const { counts: employeeCounts } = useEmployeeCounts();
  const filters = useEmployeeStore(selectEmployeeFilters);
  const setFilters = useEmployeeStore(selectSetEmployeeFilters);
  const navigate = useNavigate();
  const [isNavigatingToImport, setIsNavigatingToImport] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { divisions } = useDivisions();
  const { departments } = useDepartments();

  // Client-side filtering for instant feedback
  const filteredEmployees = useMemo(() => {
    if (!employees || !filters.search) return employees || [];
    
    const searchTerm = filters.search.toLowerCase().trim();
    return employees.filter(emp => {
      const name = emp.profile?.first_name && emp.profile?.last_name 
        ? `${emp.profile.first_name} ${emp.profile.last_name}`.toLowerCase()
        : (emp.profile?.email || emp.employee_number || '').toLowerCase();
      const jobTitle = (emp.job_title || '').toLowerCase();
      const department = (emp.department?.name || '').toLowerCase();
      const division = (emp.division?.name || '').toLowerCase();
      
      return name.includes(searchTerm) || 
             jobTitle.includes(searchTerm) || 
             department.includes(searchTerm) || 
             division.includes(searchTerm);
    });
  }, [employees, filters.search]);

  // Create table instance
  const { table } = useDataTable({
    data: filteredEmployees,
    columns: employeeColumns,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsPreviewOpen(true);
  };

  const stats = useMemo(() => {
    // Use counts from the dedicated hook for accurate totals
    return [
      {
        title: "Total Employees",
        value: employeeCounts.total.toString(),
        description: "All employees",
        icon: Users
      },
      {
        title: "Active",
        value: employeeCounts.active.toString(),
        description: "Currently active",
        icon: UserCheck,
        iconColor: "text-green-600"
      },
      {
        title: "Inactive",
        value: employeeCounts.inactive.toString(),
        description: "Currently inactive",
        icon: UserX,
        iconColor: "text-red-600"
      }
    ];
  }, [employeeCounts]);


  return (
    <DashboardLayout isLoading={isLoading}>
      <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 overflow-x-clip">
        <PageHeader
          title="Employees"
          description="Manage your organization's employees, roles, and permissions"
        >
          <Button 
            onClick={() => {
              setIsNavigatingToImport(true);
              navigate("/admin/employees/import");
            }}
            disabled={isNavigatingToImport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isNavigatingToImport ? "Loading..." : "Import Employees"}
          </Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="space-y-4 min-w-0">
          
          <div className="space-y-4 min-w-0">
            <div className="space-y-4">
              <EmployeeFilters 
                filters={filters}
                onFiltersChange={setFilters}
                roles={[]}
                divisions={divisions}
                departments={departments}
                rightSlot={
                  <DataTableViewOptions 
                    table={table} 
                    triggerClassName="h-9 px-3 text-sm font-medium border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  />
                }
              />
            </div>
            
            <div className="w-full min-w-0 max-w-full">
              <Suspense fallback={
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              }>
                <EmployeeTableMemo 
                  employees={filteredEmployees}
                  isLoading={isLoading}
                  table={table}
                  onEmployeeClick={handleEmployeeClick}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {selectedEmployee.profile?.first_name && selectedEmployee.profile?.last_name 
                    ? `${selectedEmployee.profile.first_name} ${selectedEmployee.profile.last_name}` 
                    : selectedEmployee.profile?.email || selectedEmployee.employee_number || 'Unknown'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {selectedEmployee.profile?.email || 'No email'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Job Title</label>
                  <p>{selectedEmployee.job_title || '—'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedEmployee.status === 'active' ? 'default' : 'secondary'}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Department</label>
                  <p>{selectedEmployee.department?.name || '—'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Division</label>
                  <p>{selectedEmployee.division?.name || '—'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EmployeesPage;
