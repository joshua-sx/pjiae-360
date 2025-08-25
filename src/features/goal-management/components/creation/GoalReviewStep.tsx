import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Target, Users, Edit2 } from 'lucide-react';

interface GoalData {
  title: string;
  description: string;
  selectedEmployees: any[];
  dueDate?: Date;
  priority: string;
}

interface GoalReviewStepProps {
  goalData: GoalData;
  onEdit: (stepIndex: number) => void;
}

export function GoalReviewStep({ goalData, onEdit }: GoalReviewStepProps): JSX.Element {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'No due date set';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Review & Submit</h2>
        <p className="text-muted-foreground">
          Please review the goal details before submitting for approval
        </p>
      </div>

      {/* Goal Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Goal Details</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="h-8 px-2"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Title</h3>
            <p className="text-base">{goalData.title}</p>
          </div>
          {goalData.description && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{goalData.description}</p>
            </div>
          )}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(goalData.dueDate)}</span>
            </div>
            <Badge variant={getPriorityColor(goalData.priority)}>
              {goalData.priority} Priority
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Employees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Assigned Employees ({goalData.selectedEmployees.length})
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(0)}
            className="h-8 px-2"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          {goalData.selectedEmployees.length === 0 ? (
            <p className="text-muted-foreground text-sm">No employees assigned</p>
          ) : (
            <div className="grid gap-3">
              {goalData.selectedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} alt={employee.name} />
                    <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.role} • {employee.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm">Goal will be submitted for manager approval</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Assigned employees will be notified once approved
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Progress tracking will begin automatically
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Policy Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> By submitting this goal, you confirm that it aligns with 
            organizational objectives and complies with company goal-setting policies. 
            All goal data will be stored securely and accessible to relevant stakeholders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}