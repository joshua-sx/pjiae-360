import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/data-table-advanced-toolbar";
import { employeeColumns } from "./employee-columns";
import { Employee } from "./types";

interface EmployeeTableMemoProps {
  employees: Employee[];
  isLoading: boolean;
}

export const EmployeeTableMemo = React.memo(({ employees, isLoading }: EmployeeTableMemoProps) => {
  return (
    <DataTable
      columns={employeeColumns}
      data={employees}
      enablePagination={true}
      enableSorting={true}
      enableSelection={true}
      enableHorizontalScroll={true}
      isLoading={isLoading}
      searchKey="name"
      searchPlaceholder="Search employees..."
    />
  );
});

EmployeeTableMemo.displayName = "EmployeeTableMemo";