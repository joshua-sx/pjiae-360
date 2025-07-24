
import React, { useMemo, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, UserCheck, UserX, Filter } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeFilters } from "./EmployeeFilters";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FilterSection } from "@/components/ui/filter-section";
import { useEmployeeStore } from "@/stores/employeeStore";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeTableMemo } from "./EmployeeTableMemo";

const EmployeesPage = () => {
  const { data: employees, isLoading } = useEmployees({ limit: 100 });
  const { filters, setFilters } = useEmployeeStore();

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your organization's employees, roles, and permissions"
      >
        <Button variant="outline" asChild>
          <a href="/admin/employees/import">
            <Upload className="mr-2 h-4 w-4" />
            Import Employees
          </a>
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
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
              <EmployeeTableMemo 
                employees={employees || []}
                isLoading={isLoading}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesPage;
