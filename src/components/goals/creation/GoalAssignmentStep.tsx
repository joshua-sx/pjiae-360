import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users } from 'lucide-react';
import { EmployeeCombobox } from './EmployeeCombobox';
import { EmployeeMultiSelect } from './EmployeeMultiSelect';
import { mockEmployees } from '../mockData';
import { Employee } from '../types';

interface GoalAssignmentStepProps {
  assignee: string;
  selectedEmployee: Employee | null;
  selectedEmployees: Employee[];
  onAssigneeChange: (value: string) => void;
  onEmployeeSelect: (employee: Employee | null) => void;
  onEmployeesSelect: (employees: Employee[]) => void;
}

export const GoalAssignmentStep: React.FC<GoalAssignmentStepProps> = ({
  assignee,
  selectedEmployee,
  selectedEmployees,
  onAssigneeChange,
  onEmployeeSelect,
  onEmployeesSelect
}) => {
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
          <EmployeeMultiSelect
            employees={mockEmployees}
            selectedEmployees={selectedEmployees}
            onSelectionChange={(employees) => {
              onEmployeesSelect(employees);
              onAssigneeChange(employees.map(emp => emp.name).join(', '));
            }}
            placeholder="Search and select employees..."
          />
        </div>
      </CardContent>
    </Card>
  );
};