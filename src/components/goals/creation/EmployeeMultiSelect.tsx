import React from 'react';
import { useListData } from "react-stately";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Employee } from '../types';

interface EmployeeMultiSelectProps {
  employees: Employee[];
  selectedEmployees: Employee[];
  onSelectionChange: (employees: Employee[]) => void;
  placeholder?: string;
}

export const EmployeeMultiSelect: React.FC<EmployeeMultiSelectProps> = ({
  employees,
  selectedEmployees,
  onSelectionChange,
  placeholder = "Select employees..."
}) => {
  // Transform employees to MultiSelect format
  const items = employees.map(employee => ({
    id: employee.id,
    label: employee.name,
    supportingText: `${employee.role} • ${employee.department}`,
    avatarUrl: employee.avatar || undefined,
  }));

  // Initialize with transformed selected employees
  const selectedItems = useListData({
    initialItems: selectedEmployees.map(emp => ({
      id: emp.id,
      label: emp.name,
      supportingText: `${emp.role} • ${emp.department}`,
      avatarUrl: emp.avatar || undefined,
    })),
  });

  // Update parent when selection changes
  React.useEffect(() => {
    const currentEmployees = selectedItems.items.map(item => 
      employees.find(emp => emp.id === item.id)
    ).filter(Boolean) as Employee[];
    
    if (currentEmployees.length !== selectedEmployees.length ||
        !currentEmployees.every(emp => selectedEmployees.some(selected => selected.id === emp.id))) {
      onSelectionChange(currentEmployees);
    }
  }, [selectedItems.items, employees, selectedEmployees, onSelectionChange]);

  return (
    <MultiSelect
      selectedItems={selectedItems}
      placeholder={placeholder}
      items={items}
    >
      {(item) => (
        <MultiSelect.Item 
          id={item.id} 
          supportingText={item.supportingText} 
          avatarUrl={item.avatarUrl}
        >
          {item.label}
        </MultiSelect.Item>
      )}
    </MultiSelect>
  );
};