import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { formatDistanceToNow } from 'date-fns';

interface PerformanceMetric {
  id: string;
  name: string;
  organization_id: string;
  user_id: string;
  duration_ms: number;
  event_type: string;
  event_details: Record<string, any>;
  created_at: string;
}

export function PerformanceDashboard() {
  const { id: organizationId } = useCurrentOrganization();

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['performance-metrics', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('perf_query_events')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PerformanceMetric[];
    },
    enabled: !!organizationId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = React.useMemo(() => {
    if (!metrics?.length) return null;

    const recent = metrics.filter(m => 
      new Date(m.created_at) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );

    const avgDuration = metrics.reduce((sum, m) => sum + m.duration_ms, 0) / metrics.length;
    const slowQueries = metrics.filter(m => m.duration_ms > 1000);
    const queryTypes = [...new Set(metrics.map(m => m.event_type))];

    return {
      totalQueries: metrics.length,
      recentQueries: recent.length,
      avgDuration: Math.round(avgDuration),
      slowQueries: slowQueries.length,
      queryTypes: queryTypes.length,
      slowestQuery: Math.max(...metrics.map(m => m.duration_ms))
    };
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent (5m)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.recentQueries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration}ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Slow Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.slowQueries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Query Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queryTypes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Slowest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.slowestQuery}ms</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Query Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!metrics?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No performance data available
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.slice(0, 20).map(metric => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {metric.duration_ms > 1000 ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : metric.duration_ms > 500 ? (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-success" />
                      )}
                      <Badge variant={metric.duration_ms > 1000 ? 'destructive' : 'secondary'}>
                        {metric.duration_ms}ms
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-muted-foreground">{metric.event_type}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(metric.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}