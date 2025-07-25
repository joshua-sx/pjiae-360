import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users } from 'lucide-react';
import { EmployeeCombobox } from './EmployeeCombobox';
import { EmployeeMultiSelect } from './EmployeeMultiSelect';
import { Employee } from '../types';
import { useEmployees } from "@/hooks/useEmployees";

interface GoalAssignmentStepProps {
  assignee: string;
  selectedEmployee: Employee | null;
  selectedEmployees: Employee[];
  onAssigneeChange: (value: string) => void;
  onEmployeeSelect: (employee: Employee | null) => void;
  onEmployeesSelect: (employees: Employee[]) => void;
}

export function GoalAssignmentStep({
  assignee,
  selectedEmployee,
  selectedEmployees,
  onAssigneeChange,
  onEmployeeSelect,
  onEmployeesSelect
}: GoalAssignmentStepProps): JSX.Element {
  const { data: employeesData, isLoading } = useEmployees();
  
  // Convert the employee data to match the expected format
  const employees: Employee[] = employeesData?.map(emp => ({
    id: emp.id,
    name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
    role: emp.role?.name || 'Employee',
    department: emp.department?.name || 'Unknown',
    avatar: emp.avatar_url || undefined
  })) || [];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Select Team Members</CardTitle>
            <p className="text-muted-foreground text-sm">Choose employees who will work on this goal</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="text-sm font-medium">Team Members</label>
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-muted-foreground/25 rounded-lg">
              <p className="text-sm text-muted-foreground">No employees found. Please import employees first.</p>
            </div>
          ) : (
            <EmployeeMultiSelect
              employees={employees}
              selectedEmployees={selectedEmployees}
              onSelectionChange={(employees) => {
                onEmployeesSelect(employees);
                onAssigneeChange(employees.map(emp => emp.name).join(', '));
              }}
              placeholder="Search and select employees..."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}