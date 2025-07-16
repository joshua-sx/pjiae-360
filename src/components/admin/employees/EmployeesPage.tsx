import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, Download } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { DataTable } from "@/components/ui/data-table";
import { employeeColumns } from "./employee-columns";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeFilters as EmployeeFiltersType } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  
  const [filters, setFilters] = useState<EmployeeFiltersType>({
    search: "",
    status: "all",
    role: "all",
    division: "all",
    department: "all",
  });

  // Fetch filter options
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await supabase.from("roles").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ["divisions"],
    queryFn: async () => {
      const { data } = await supabase.from("divisions").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("id, name").order("name");
      return data || [];
    },
  });

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = !filters.search || 
        employee.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.job_title?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === "all" || employee.status === filters.status;
      const matchesRole = filters.role === "all" || employee.role_id === filters.role;
      const matchesDivision = filters.division === "all" || employee.division_id === filters.division;
      const matchesDepartment = filters.department === "all" || employee.department_id === filters.department;

      return matchesSearch && matchesStatus && matchesRole && matchesDivision && matchesDepartment;
    });
  }, [employees, filters]);

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Export employees to CSV");
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Employees" }]}>
      <>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your organization's employees and their information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(e => e.status === 'active' && e.user_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invited</CardTitle>
              <Badge variant="outline" className="text-orange-600 border-orange-300">Invited</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(e => e.status === 'invited').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Divisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{divisions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Employees</CardTitle>
            <CardDescription>Use the filters below to find specific employees</CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeFilters
              filters={filters}
              onFiltersChange={setFilters}
              roles={roles}
              divisions={divisions}
              departments={departments}
            />
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Employee List
              <Badge variant="secondary" className="ml-2">
                {filteredEmployees.length} of {employees.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete list of employees with their roles and department information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={employeeColumns}
              data={filteredEmployees}
              enableSorting={true}
              enablePagination={true}
              enableSelection={true}
            />
          </CardContent>
        </Card>
      </>
    </DashboardLayout>
  );
}