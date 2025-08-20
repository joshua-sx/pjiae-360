
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
          <div>
            <h2 className="text-lg font-semibold mb-1">All Employees</h2>
            <p className="text-muted-foreground text-sm">View and manage all employees in your organization</p>
          </div>
          
          <div className="space-y-4 min-w-0">
            <div className="space-y-4">
              <EmployeeFilters 
                filters={filters}
                onFiltersChange={setFilters}
                roles={[]}
                divisions={divisions}
                departments={departments}
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
                  employees={employees || []}
                  isLoading={isLoading}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeesPage;
