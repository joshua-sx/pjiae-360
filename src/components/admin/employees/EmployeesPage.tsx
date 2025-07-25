
import React, { useMemo, Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, UserCheck, UserX, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeFilters } from "./EmployeeFilters";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FilterSection } from "@/components/ui/filter-section";
import { useEmployeeStore } from "@/stores/employeeStore";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeTableMemo } from "./EmployeeTableMemo";
import { MobileTable, MobileTableRow } from "@/components/ui/mobile-table";
import { Badge } from "@/components/ui/badge";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

const EmployeesPage = () => {
  const { data: employees, isLoading } = useEmployees({ limit: 100 });
  const { filters, setFilters } = useEmployeeStore();
  const navigate = useNavigate();
  const [isNavigatingToImport, setIsNavigatingToImport] = useState(false);
  const { isMobile } = useMobileResponsive();

  const stats = useMemo(() => {
    const activeEmployees = employees?.filter(emp => emp.status === 'active') || [];
    const inactiveEmployees = employees?.filter(emp => emp.status === 'inactive') || [];
    const totalEmployees = employees?.length || 0;

    return [
      {
        title: "Total Employees",
        value: totalEmployees.toString(),
        description: "All employees",
        icon: Users
      },
      {
        title: "Active",
        value: activeEmployees.length.toString(),
        description: "Currently active",
        icon: UserCheck,
        iconColor: "text-green-600"
      },
      {
        title: "Inactive",
        value: inactiveEmployees.length.toString(),
        description: "Currently inactive",
        icon: UserX,
        iconColor: "text-red-600"
      }
    ];
  }, [employees]);

  const renderMobileEmployeeCard = (employee: any, index: number) => (
    <Card key={employee.id || index} className="mobile-table-card">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
            </div>
            <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {employee.status}
            </Badge>
          </div>
          <div className="space-y-2 text-xs">
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
    <div className="space-y-6">
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

      <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            View and manage all employees in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FilterSection showFilter>
              <EmployeeFilters 
                filters={filters}
                onFiltersChange={setFilters}
                roles={[]}
                divisions={[]}
                departments={[]}
              />
            </FilterSection>
            
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
                <EmployeeTableMemo 
                  employees={employees || []}
                  isLoading={isLoading}
                />
              )}
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesPage;
