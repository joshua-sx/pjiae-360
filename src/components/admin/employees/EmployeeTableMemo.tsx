import React from "react";
import { ResponsiveEmployeeTable } from "@/components/ui/responsive-data-table";
import { employeeColumns } from "./employee-columns";
import { Employee } from "./types";

interface EmployeeTableMemoProps {
  employees: Employee[];
  isLoading: boolean;
  table?: any;
  onEmployeeClick?: (employee: Employee) => void;
}

export const EmployeeTableMemo = React.memo(({ employees, isLoading, table, onEmployeeClick }: EmployeeTableMemoProps) => {
  return (
    <ResponsiveEmployeeTable
      employees={employees}
      columns={employeeColumns}
      table={table}
      onEmployeeClick={onEmployeeClick}
      onEmployeeAction={(employee) => {
        // Handle employee action menu
        console.log("Employee action:", employee);
      }}
      isLoading={isLoading}
      className="w-full max-w-full min-w-0 table-container"
      enableHorizontalScroll={true}
      stickyColumns={["select", "name"]}
      enableFiltering={false}
    />
  );
});

EmployeeTableMemo.displayName = "EmployeeTableMemo";