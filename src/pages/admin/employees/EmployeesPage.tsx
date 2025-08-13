
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
import { FilterSection } from "@/components/ui/filter-section";
import {
  useEmployeeStore,
  selectEmployeeFilters,
  selectSetEmployeeFilters,
} from "@/stores";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeTableMemo } from "../../../components/admin/employees/EmployeeTableMemo";
import { MobileTable, MobileTableRow } from "@/components/ui/mobile-table";
import { Badge } from "@/components/ui/badge";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";
import { useDivisions } from "@/hooks/useDivisions";
import { useDepartments } from "@/hooks/useDepartments";
import { RoleInferenceActions } from "../../../components/admin/roles/RoleInferenceActions";

const EmployeesPage = () => {
    const { data: employees, isLoading } = useOptimizedEmployees();
    const { counts: employeeCounts } = useEmployeeCounts();
    const filters = useEmployeeStore(selectEmployeeFilters);
    const setFilters = useEmployeeStore(selectSetEmployeeFilters);
  const navigate = useNavigate();
  const [isNavigatingToImport, setIsNavigatingToImport] = useState(false);
  const { isMobile } = useMobileResponsive();
  const { divisions } = useDivisions();
  const { departments } = useDepartments();

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

  const renderMobileEmployeeCard = (employee: any, index: number) => (
    <Card key={employee.id || index} className="mobile-table-card">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
            </div>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
              {employee.status}
            </Badge>
          </div>
          <div className="space-y-1 text-xs">
            <MobileTableRow label="Job Title" value={employee.job_title || 'N/A'} />
            <MobileTableRow label="Department" value={employee.department_name || 'N/A'} />
            <MobileTableRow label="Phone" value={employee.phone_number || 'N/A'} />
            <MobileTableRow label="Start Date" value={employee.start_date ? new Date(employee.start_date).toLocaleDateString() : 'N/A'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your organization's employees, roles, and permissions"
      >
        <div className="flex gap-2">
          <RoleInferenceActions variant="bulk" />
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
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">All Employees</h2>
          <p className="text-muted-foreground text-sm">View and manage all employees in your organization</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-4">
            <EmployeeFilters 
              filters={filters}
              onFiltersChange={setFilters}
              roles={[]}
              divisions={divisions}
              departments={departments}
            />
          </div>
          
          <div className="w-full overflow-hidden">
            <Suspense fallback={
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            }>
              {isMobile ? (
                <MobileTable
                  data={employees || []}
                  renderCard={renderMobileEmployeeCard}
                  emptyMessage="No employees found"
                  title="Employees"
                />
              ) : (
                <div className="overflow-x-auto">
                  <EmployeeTableMemo 
                    employees={employees || []}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
