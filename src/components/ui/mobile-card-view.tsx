import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileCardViewProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingSkeleton?: React.ReactNode;
}

export function MobileCardView<T>({ 
  data, 
  renderCard, 
  onItemClick, 
  className,
  emptyMessage = "No items found",
  loading = false,
  loadingSkeleton
}: MobileCardViewProps<T>) {
  if (loading && loadingSkeleton) {
    return <div className={className}>{loadingSkeleton}</div>;
  }

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item, index) => (
        <div 
          key={index}
          onClick={() => onItemClick?.(item)}
          className={cn(
            "transition-colors",
            onItemClick && "cursor-pointer hover:bg-accent/50"
          )}
        >
          {renderCard(item, index)}
        </div>
      ))}
    </div>
  );
}

// Predefined card templates for common use cases
interface EmployeeCardProps {
  employee: {
    id: string;
    name: string;
    email?: string;
    department?: string;
    position?: string;
    avatar?: string;
    status?: string;
  };
  onAction?: (employee: any) => void;
  actions?: React.ReactNode;
}

export function EmployeeCard({ employee, onAction, actions }: EmployeeCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
          {employee.avatar ? (
            <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            getInitials(employee.name)
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{employee.name}</h3>
            {employee.status && (
              <Badge variant="secondary" className="text-xs">
                {employee.status}
              </Badge>
            )}
          </div>
          
          {employee.email && (
            <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
          )}
          
          {employee.position && (
            <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
          )}
          
          {employee.department && (
            <p className="text-xs text-muted-foreground truncate">{employee.department}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(employee);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    employeeName?: string;
    status?: string;
    progress?: number;
    dueDate?: string;
    weight?: number;
  };
  onAction?: (goal: any) => void;
}

export function GoalCard({ goal, onAction }: GoalCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed": return "bg-green-50 text-green-700 border-green-200";
      case "active": return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight flex-1">{goal.title}</h3>
          {goal.status && (
            <Badge variant="secondary" className={cn("text-xs", getStatusColor(goal.status))}>
              {goal.status}
            </Badge>
          )}
        </div>
        
        {goal.employeeName && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Employee:</span>
            <span className="text-xs font-medium">{goal.employeeName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {goal.progress !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{goal.progress}%</span>
              </div>
            )}
            
            {goal.weight !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium">{goal.weight}%</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(goal);
            }}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {goal.dueDate && (
          <div className="text-xs text-muted-foreground">
            Due: {new Date(goal.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
}