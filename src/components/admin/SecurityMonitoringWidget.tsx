import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { useSecurityAnalytics } from '@/hooks/useSecurityAnalytics';

export function SecurityMonitoringWidget() {
  const { metrics, suspiciousActivity, topEvents, recentFailures, loading, canViewAnalytics } = useSecurityAnalytics(24);

  if (!canViewAnalytics) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasSecurityIssues = suspiciousActivity.length > 0 || metrics.failureRate > 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
          {hasSecurityIssues && (
            <Badge variant="destructive" className="ml-auto">
              Issues Detected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Last 24 hours security overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{metrics.failureRate}%</div>
            <div className="text-sm text-muted-foreground">Failure Rate</div>
          </div>
        </div>

        {/* Suspicious Activity Alert */}
        {suspiciousActivity.length > 0 && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">Suspicious Activity Detected</div>
              <div className="text-sm mt-1">
                {suspiciousActivity.length} threat{suspiciousActivity.length > 1 ? 's' : ''} detected with multiple failed attempts
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Top Security Events */}
        {topEvents.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Top Security Events
            </div>
            <div className="space-y-2">
              {topEvents.slice(0, 3).map((event) => (
                <div key={event.event_type} className="flex items-center justify-between text-sm">
                  <span>{event.event_type.replace(/_/g, ' ')}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{event.total_count}</Badge>
                    {event.failure_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {event.failure_count} failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Failures */}
        {recentFailures.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Failures
            </div>
            <div className="space-y-1">
              {recentFailures.slice(0, 2).map((event) => (
                <div key={event.event_type} className="text-sm text-muted-foreground">
                  {event.event_type.replace(/_/g, ' ')}: {event.failure_count} failures
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Issues State */}
        {!hasSecurityIssues && metrics.totalEvents > 0 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
            No security issues detected
          </div>
        )}

        {/* No Data State */}
        {metrics.totalEvents === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No security events recorded in the last 24 hours
          </div>
        )}
      </CardContent>
    </Card>
  );
}