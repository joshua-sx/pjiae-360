
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Clock, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { toast } from 'sonner';

interface PerformanceEvent {
  id: string;
  name: string;
  duration_ms: number;
  event_details: any;
  created_at: string;
  user_id?: string;
}

interface PerformanceStats {
  avgDuration: number;
  slowQueries: number;
  totalQueries: number;
  topSlowQueries: Array<{
    name: string;
    avgDuration: number;
    count: number;
  }>;
}

export function PerformanceDashboard() {
  const [events, setEvents] = useState<PerformanceEvent[]>([]);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const { isAdmin } = usePermissions();

  const fetchPerformanceData = async () => {
    if (!isAdmin) {
      toast.error('Admin access required to view performance data');
      return;
    }

    setLoading(true);
    try {
      const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      
      // Fetch recent performance events
      const { data: eventsData, error: eventsError } = await supabase
        .from('perf_query_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);

      // Calculate statistics
      if (eventsData && eventsData.length > 0) {
        const totalDuration = eventsData.reduce((sum, event) => sum + event.duration_ms, 0);
        const avgDuration = totalDuration / eventsData.length;
        const slowQueries = eventsData.filter(event => event.duration_ms > 1000).length;

        // Group by query name for top slow queries
        const queryGroups = eventsData.reduce((groups, event) => {
          const name = event.name || 'Unknown';
          if (!groups[name]) {
            groups[name] = { durations: [], count: 0 };
          }
          groups[name].durations.push(event.duration_ms);
          groups[name].count++;
          return groups;
        }, {} as Record<string, { durations: number[]; count: number }>);

        const topSlowQueries = Object.entries(queryGroups)
          .map(([name, data]) => ({
            name,
            avgDuration: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
            count: data.count
          }))
          .sort((a, b) => b.avgDuration - a.avgDuration)
          .slice(0, 5);

        setStats({
          avgDuration,
          slowQueries,
          totalQueries: eventsData.length,
          topSlowQueries
        });
      } else {
        setStats({
          avgDuration: 0,
          slowQueries: 0,
          totalQueries: 0,
          topSlowQueries: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange, isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Admin privileges required to view performance dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getSeverityColor = (duration: number) => {
    if (duration > 5000) return 'destructive';
    if (duration > 1000) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor database query performance and system health</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === '1h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('1h')}
          >
            1 Hour
          </Button>
          <Button
            variant={timeRange === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('24h')}
          >
            24 Hours
          </Button>
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button onClick={fetchPerformanceData} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading performance data...</div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalQueries || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(stats?.avgDuration || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.slowQueries || 0}</div>
                <p className="text-xs text-muted-foreground">
                  &gt; 1 second
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.slowQueries && stats.totalQueries 
                    ? `${Math.round((1 - stats.slowQueries / stats.totalQueries) * 100)}%`
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Fast queries
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Slow Queries */}
          <Card>
            <CardHeader>
              <CardTitle>Slowest Query Types</CardTitle>
              <CardDescription>
                Queries with the highest average execution time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats?.topSlowQueries.length ? (
                  stats.topSlowQueries.map((query, index) => (
                    <div key={query.name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{query.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({query.count} executions)
                        </span>
                      </div>
                      <Badge variant={getSeverityColor(query.avgDuration)}>
                        {formatDuration(query.avgDuration)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No performance data available for the selected time range
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Query Events</CardTitle>
              <CardDescription>
                Latest database query executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length ? (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.name || 'Unknown Query'}</span>
                        <span className="text-muted-foreground">
                          {new Date(event.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <Badge variant={getSeverityColor(event.duration_ms)}>
                        {formatDuration(event.duration_ms)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent query events found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
