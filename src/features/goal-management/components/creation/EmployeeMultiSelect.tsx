import React, { useMemo } from 'react';
import { useListData } from "react-stately";
import { MultiSelect } from "@/components/base/select/multi-select";
import { Employee } from '../types';

interface EmployeeMultiSelectProps {
  employees: Employee[];
  selectedEmployees: Employee[];
  onSelectionChange: (employees: Employee[]) => void;
  placeholder?: string;
}

export function EmployeeMultiSelect({
  employees,
  selectedEmployees,
  onSelectionChange,
  placeholder = "Select employees..."
}: EmployeeMultiSelectProps): JSX.Element {
  console.log('EmployeeMultiSelect render:', { 
    employeesCount: employees.length, 
    selectedCount: selectedEmployees.length,
    selectedIds: selectedEmployees.map(e => e.id)
  });

  // Transform employees to MultiSelect format
  const items = useMemo(() => employees.map(employee => ({
    id: employee.id,
    label: employee.name,
    supportingText: `${employee.role} • ${employee.department}`,
    avatarUrl: employee.avatar || undefined,
  })), [employees]);

  // Initialize with transformed selected employees
  const selectedItems = useListData({
    initialItems: selectedEmployees.map(emp => ({
      id: emp.id,
      label: emp.name,
      supportingText: `${emp.role} • ${emp.department}`,
      avatarUrl: emp.avatar || undefined,
    })),
  });

  // Sync selected items when props change
  React.useEffect(() => {
    const newSelectedItems = selectedEmployees.map(emp => ({
      id: emp.id,
      label: emp.name,
      supportingText: `${emp.role} • ${emp.department}`,
      avatarUrl: emp.avatar || undefined,
    }));
    
    // Only update if the selection actually changed
    const currentIds = selectedItems.items.map(item => item.id);
    const newIds = newSelectedItems.map(item => item.id);
    
    if (currentIds.length !== newIds.length || 
        !currentIds.every(id => newIds.includes(id))) {
      selectedItems.setSelectedKeys(new Set(newIds));
    }
  }, [selectedEmployees, selectedItems]);

  // Handle selection changes from MultiSelect
  const handleSelectionChange = React.useCallback(() => {
    const currentEmployees = selectedItems.items.map(item => 
      employees.find(emp => emp.id === item.id)
    ).filter(Boolean) as Employee[];
    
    console.log('Selection changed:', { 
      currentEmployees: currentEmployees.map(e => ({ id: e.id, name: e.name }))
    });
    
    onSelectionChange(currentEmployees);
  }, [selectedItems.items, employees, onSelectionChange]);

  // Add effect to trigger callback when selectedItems changes
  React.useEffect(() => {
    handleSelectionChange();
  }, [handleSelectionChange]);

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
}