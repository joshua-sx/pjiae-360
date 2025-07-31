import { useState } from 'react';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import { format } from 'date-fns';

export function SecurityAuditPage() {
  const { auditLogs, loading, fetchAuditLogs, canViewAuditLogs } = useSecurityAudit();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');

  if (!canViewAuditLogs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view security audit logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.event_details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === 'all' || log.event_type === eventTypeFilter;
    
    return matchesSearch && matchesEventType;
  });

  const eventTypes = [...new Set(auditLogs.map(log => log.event_type))];

  const getEventIcon = (eventType: string, success: boolean) => {
    if (!success) return <XCircle className="h-4 w-4 text-destructive" />;
    
    if (eventType.includes('role') || eventType.includes('assignment')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    if (eventType.includes('verification') || eventType.includes('auth')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (eventType.includes('violation') || eventType.includes('attempt')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getEventSeverity = (eventType: string, success: boolean) => {
    if (!success) return 'high';
    if (eventType.includes('violation') || eventType.includes('unauthorized')) return 'high';
    if (eventType.includes('attempt') && !eventType.includes('success')) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Audit"
        description="Monitor security events and user activities across the system"
      >
        <Button onClick={() => fetchAuditLogs()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            {filteredLogs.length} events found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(log.event_type, log.success)}
                        <span className="font-medium">
                          {log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.success ? 'default' : 'destructive'}
                        className={
                          getEventSeverity(log.event_type, log.success) === 'high' 
                            ? 'border-red-500 text-red-700' 
                            : getEventSeverity(log.event_type, log.success) === 'medium'
                            ? 'border-yellow-500 text-yellow-700'
                            : ''
                        }
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
                          {JSON.stringify(log.event_details, null, 2)}
                        </pre>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No security events found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}