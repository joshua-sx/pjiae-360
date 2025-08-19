import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, Plus, Edit, Trash2 } from "lucide-react";
import { useGoalSettingWindows } from "@/features/goal-management/hooks/useGoalSettingWindows";
import { format, isWithinInterval } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const GoalSettingWindowsManagement = () => {
  const { windows, isLoading, error, refetch } = useGoalSettingWindows();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (windowId: string) => {
    try {
      setDeletingId(windowId);
      
      const { error } = await supabase
        .from('goal_setting_windows')
        .delete()
        .eq('id', windowId);

      if (error) throw error;

      toast.success('Goal setting window deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting goal setting window:', error);
      toast.error('Failed to delete goal setting window');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goal Setting Windows Management
            </CardTitle>
            <Button disabled>
              <Plus className="w-4 h-4 mr-2" />
              Add Window
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
            Goal Setting Windows Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading goal setting windows: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getWindowStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Setting Windows Management
          </CardTitle>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Window
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!windows.length ? (
          <p className="text-muted-foreground text-center py-8">
            No goal setting windows configured yet. Add your first window to get started.
          </p>
        ) : (
          windows.map((window) => {
            const { status, variant } = getWindowStatus(window.start_date, window.end_date);
            
            return (
              <div
                key={window.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-2">
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

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={deletingId === window.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Goal Setting Window</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{window.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(window.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};