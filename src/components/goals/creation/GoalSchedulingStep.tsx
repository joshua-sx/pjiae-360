import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalSchedulingStepProps {
  dueDate: Date | undefined;
  priority: string;
  onDueDateChange: (date: Date | undefined) => void;
  onPriorityChange: (priority: string) => void;
}

export const GoalSchedulingStep: React.FC<GoalSchedulingStepProps> = ({
  dueDate,
  priority,
  onDueDateChange,
  onPriorityChange
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">When and how important?</CardTitle>
        <p className="text-muted-foreground">Set deadline and priority level</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dueDate ? dueDate.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={onDueDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Priority Level</label>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Low Priority
                </div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Medium Priority
                </div>
              </SelectItem>
              <SelectItem value="High">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  High Priority
                </div>
              </SelectItem>
              <SelectItem value="Critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Critical Priority
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};