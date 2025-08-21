import { useState } from 'react';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { securityColumns } from '@/components/admin/security/security-columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, RefreshCw } from 'lucide-react';
import { DashboardLayout } from "@/components/DashboardLayout";

export function SecurityAuditPage() {
  const { auditLogs, loading, fetchAuditLogs, canViewAuditLogs } = useSecurityAudit();
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
    const matchesEventType = eventTypeFilter === 'all' || log.event_type === eventTypeFilter;
    return matchesEventType;
  });

  const eventTypes = [...new Set(auditLogs.map(log => log.event_type))];

  return (
    <DashboardLayout>
      <PageHeader
        title="Security Audit"
        description="Monitor security events and user activities across the system"
      >
        <Button onClick={() => fetchAuditLogs()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </PageHeader>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                {filteredLogs.length} events found
              </CardDescription>
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
        </CardHeader>
        <CardContent>
          <DataTable
            columns={securityColumns}
            data={filteredLogs}
            enablePagination={true}
            enableSorting={true}
            isLoading={loading}
            searchKey="event_type"
            searchPlaceholder="Search events, details..."
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}