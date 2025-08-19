import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, Activity, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

interface SecurityEventStats {
  event_type: string;
  total_count: number;
  success_count: number;
  failure_count: number;
  last_occurrence: string;
}

interface SuspiciousActivity {
  user_id: string | null;
  ip_address: string | null;
  failed_attempts: number;
  event_types: string[];
  first_attempt: string;
  last_attempt: string;
}

export function SecurityAnalyticsDashboard() {
  const { isAdmin } = usePermissions();
  const [eventStats, setEventStats] = useState<SecurityEventStats[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1' | '24' | '168'>('24');

  const fetchSecurityData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Fetch security event statistics
      const { data: stats, error: statsError } = await supabase
        .rpc('get_security_event_stats', { hours_back: parseInt(timeRange) });

      if (statsError) {
        console.error('Error fetching security stats:', statsError);
      } else {
        setEventStats(stats || []);
      }

      // Fetch suspicious activity
      const { data: suspicious, error: suspiciousError } = await supabase
        .rpc('detect_suspicious_activity', { hours_back: 1 });

      if (suspiciousError) {
        console.error('Error fetching suspicious activity:', suspiciousError);
      } else {
        // Type assertion to handle unknown IP address type from database
        setSuspiciousActivity((suspicious || []).map(activity => ({
          ...activity,
          ip_address: activity.ip_address?.toString() || null
        })));
      }
    } catch (error) {
      console.error('Error in security data fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [isAdmin, timeRange]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You need admin permissions to view security analytics.
        </AlertDescription>
      </Alert>
    );
  }

  const totalEvents = eventStats.reduce((sum, stat) => sum + stat.total_count, 0);
  const totalFailures = eventStats.reduce((sum, stat) => sum + stat.failure_count, 0);
  const failureRate = totalEvents > 0 ? (totalFailures / totalEvents * 100).toFixed(1) : '0';

  const chartData = eventStats.map(stat => ({
    name: stat.event_type.replace(/_/g, ' '),
    total: stat.total_count,
    success: stat.success_count,
    failure: stat.failure_count
  }));

  const pieData = eventStats.map(stat => ({
    name: stat.event_type.replace(/_/g, ' '),
    value: stat.total_count
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Analytics</h1>
          <p className="text-muted-foreground">Monitor security events and detect threats</p>
        </div>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '1' | '24' | '168')}>
          <TabsList>
            <TabsTrigger value="1">Last Hour</TabsTrigger>
            <TabsTrigger value="24">Last 24h</TabsTrigger>
            <TabsTrigger value="168">Last Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange === '1' ? 'hour' : timeRange === '24' ? '24 hours' : 'week'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalFailures} failed events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousActivity.length}</div>
            <p className="text-xs text-muted-foreground">
              Detected threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Different event types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Activity Alerts */}
      {suspiciousActivity.length > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Suspicious Activity Detected</div>
            <div className="space-y-2">
              {suspiciousActivity.map((activity, index) => (
                <div key={index} className="text-sm">
                  IP: {activity.ip_address || 'Unknown'} - {activity.failed_attempts} failed attempts
                  <Badge variant="destructive" className="ml-2">
                    {activity.event_types.join(', ')}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Event Breakdown</TabsTrigger>
          <TabsTrigger value="distribution">Event Distribution</TabsTrigger>
          <TabsTrigger value="timeline">Event Details</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events by Type</CardTitle>
              <CardDescription>Success vs failure rates for different event types</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="success" stackId="a" fill="hsl(var(--primary))" name="Success" />
                    <Bar dataKey="failure" stackId="a" fill="hsl(var(--destructive))" name="Failure" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Event Distribution</CardTitle>
              <CardDescription>Proportion of different security event types</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Detailed breakdown of security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventStats.map((event) => (
                  <div key={event.event_type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{event.event_type.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        Last occurred: {new Date(event.last_occurrence).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">Total: {event.total_count}</div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{event.success_count} success</Badge>
                        {event.failure_count > 0 && (
                          <Badge variant="destructive">{event.failure_count} failed</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}