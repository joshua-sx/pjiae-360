import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target } from "lucide-react";
import { useGoalSettingWindows } from "@/features/goal-management/hooks/useGoalSettingWindows";
import { format, isAfter, isBefore, isWithinInterval } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const GoalSettingWindowsDisplay = () => {
  const { windows, isLoading, error } = useGoalSettingWindows();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Setting Windows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Setting Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading goal setting windows: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!windows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Setting Windows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No goal setting windows configured yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getWindowStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isBefore(now, start)) {
      return { status: 'upcoming', variant: 'secondary' as const };
    } else if (isWithinInterval(now, { start, end })) {
      return { status: 'active', variant: 'default' as const };
    } else {
      return { status: 'completed', variant: 'outline' as const };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Goal Setting Windows
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {windows.map((window) => {
          const { status, variant } = getWindowStatus(window.start_date, window.end_date);
          
          return (
            <div
              key={window.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{window.name}</h4>
                  <Badge variant={variant} className="capitalize">
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(window.start_date), 'MMM d')} - {format(new Date(window.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.ceil((new Date(window.end_date).getTime() - new Date(window.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
                {window.cycle && (
                  <p className="text-xs text-muted-foreground">
                    {window.cycle.name} ({window.cycle.year})
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};