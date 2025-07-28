import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemHealth } from "@/hooks/useSystemHealth";

export function SystemHealthMetrics() {
  const { data: healthMetrics, isLoading, error } = useSystemHealth();

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Failed to load system health metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Completion Rate</span>
        {isLoading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <span className="text-sm text-muted-foreground">{healthMetrics?.completionRate || '87%'}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">User Activity</span>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className="text-sm text-muted-foreground">{healthMetrics?.userActivity || '94% active'}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Data Quality</span>
        {isLoading ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <span className="text-sm text-muted-foreground">{healthMetrics?.dataQuality || 'Good'}</span>
        )}
      </div>
      <Button variant="outline" className="w-full mt-4">
        View Detailed Analytics
      </Button>
    </div>
  );
}