
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, UserCheck, UserX, Filter } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeFilters } from "./EmployeeFilters";
import { DataTable } from "@/components/ui/data-table";
import { employeeColumns } from "./employee-columns";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { FilterSection } from "@/components/ui/filter-section";

const EmployeesPage = () => {
  const { data: employees, isLoading } = useEmployees();

  const activeEmployees = employees?.filter(emp => emp.status === 'active') || [];
  const inactiveEmployees = employees?.filter(emp => emp.status === 'inactive') || [];
  const totalEmployees = employees?.length || 0;

  const stats = [
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

  return (
    <DashboardLayout
      pageWidth="wide"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Employees" }
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Employee Management"
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
                <EmployeeFilters />
              </FilterSection>
              
              <DataTable
                columns={employeeColumns}
                data={employees || []}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
