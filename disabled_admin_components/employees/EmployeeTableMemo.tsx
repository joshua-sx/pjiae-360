import React from "react";
import { DataTable } from "@/components/ui/data-table";
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
      enablePagination
      isLoading={isLoading}
    />
  );
});

EmployeeTableMemo.displayName = "EmployeeTableMemo";