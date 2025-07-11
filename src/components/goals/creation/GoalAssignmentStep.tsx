import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users } from 'lucide-react';
import { EmployeeCombobox } from './EmployeeCombobox';
import { mockEmployees } from '../mockData';
import { Employee } from '../types';

interface GoalAssignmentStepProps {
  type: 'individual' | 'team';
  assignee: string;
  selectedEmployee: Employee | null;
  onTypeChange: (type: 'individual' | 'team') => void;
  onAssigneeChange: (value: string) => void;
  onEmployeeSelect: (employee: Employee | null) => void;
}

export const GoalAssignmentStep: React.FC<GoalAssignmentStepProps> = ({
  type,
  assignee,
  selectedEmployee,
  onTypeChange,
  onAssigneeChange,
  onEmployeeSelect
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Who's responsible?</CardTitle>
        <p className="text-muted-foreground">Assign ownership and set timeline</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Goal Type</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={type === 'individual' ? 'default' : 'outline'}
              onClick={() => onTypeChange('individual')}
              className="h-16 flex-col gap-2"
            >
              <User className="w-5 h-5" />
              Individual
            </Button>
            <Button
              variant={type === 'team' ? 'default' : 'outline'}
              onClick={() => onTypeChange('team')}
              className="h-16 flex-col gap-2"
            >
              <Users className="w-5 h-5" />
              Team
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            {type === 'individual' ? 'Assign to Employee' : 'Assign to Team'}
          </label>
          {type === 'individual' ? (
            <EmployeeCombobox
              employees={mockEmployees}
              selectedEmployee={selectedEmployee}
              onEmployeeSelect={(employee) => {
                onEmployeeSelect(employee);
                onAssigneeChange(employee?.name || '');
              }}
              placeholder="Search and select an employee..."
            />
          ) : (
            <div className="text-sm text-muted-foreground p-3 border rounded-md">
              Team assignment coming soon...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};