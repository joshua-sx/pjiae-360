import React from "react";
import { ResponsiveEmployeeTable } from "@/components/ui/responsive-data-table";
import { employeeColumns } from "./employee-columns";
import { Employee } from "./types";

interface EmployeeTableMemoProps {
  employees: Employee[];
  isLoading: boolean;
}

export const EmployeeTableMemo = React.memo(({ employees, isLoading }: EmployeeTableMemoProps) => {
  return (
    <ResponsiveEmployeeTable
      employees={employees}
      columns={employeeColumns}
      onEmployeeClick={(employee) => {
        // Handle employee click - could navigate to employee detail
        console.log("Employee clicked:", employee);
      }}
      onEmployeeAction={(employee) => {
        // Handle employee action menu
        console.log("Employee action:", employee);
      }}
      isLoading={isLoading}
      className="w-full max-w-full min-w-0 table-container"
    />
  );
});

EmployeeTableMemo.displayName = "EmployeeTableMemo";