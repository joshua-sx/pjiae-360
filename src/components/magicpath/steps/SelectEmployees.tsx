import React from "react";
import { AlertCircle } from "lucide-react";

import EmployeeMultiSelectDropdown from "../EmployeeMultiSelectDropdown";
import type { MagicPathEmployee } from "../types";

interface SelectEmployeesProps {
  employees: MagicPathEmployee[];
  selectedEmployees: MagicPathEmployee[];
  loading: boolean;
  onSelect: (employees: MagicPathEmployee[]) => void;
}

export const SelectEmployees = ({
  employees,
  selectedEmployees,
  loading,
  onSelect,
}: SelectEmployeesProps) => {
  if (loading) {
    return <div className="text-center p-8">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        No employees found
      </div>
    );
  }

  return (
    <EmployeeMultiSelectDropdown
      employees={employees}
      selectedEmployees={selectedEmployees}
      onSelectionChange={onSelect}
    />
  );
};

export default SelectEmployees;
