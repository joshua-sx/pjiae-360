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

export function GoalSchedulingStep({
  dueDate,
  priority,
  onDueDateChange,
  onPriorityChange
}: GoalSchedulingStepProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Schedule & Priority</CardTitle>
            <p className="text-muted-foreground text-sm">Set timeline and importance level</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date (Optional)</label>
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority Level</label>
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
}