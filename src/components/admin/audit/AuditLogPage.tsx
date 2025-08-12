import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MobileTable, MobileTableRow } from '@/components/ui/mobile-table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  event_details: any;
  success: boolean;
  created_at: string;
}

const AuditLogPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>(searchParams.get('event_type') ?? 'all');
  const [successFilter, setSuccessFilter] = useState<string>(searchParams.get('success') ?? 'all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const { isMobile } = useMobileResponsive();
  const { canViewAudit } = usePermissions();

  const { data: auditResult, isLoading } = useQuery({
    enabled: canViewAudit,
    queryKey: ['audit-logs', eventTypeFilter, successFilter, currentPage],
    queryFn: async (): Promise<{ data: AuditLogEntry[], count: number }> => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;

      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      if (eventTypeFilter && eventTypeFilter !== 'all') {
        query = query.eq('event_type', eventTypeFilter);
      }

      if (successFilter && successFilter !== 'all') {
        query = query.eq('success', successFilter === 'true');
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data ?? []) as AuditLogEntry[], count: count ?? 0 };
    }
  });

  const auditLogs = auditResult?.data ?? [];
  const totalCount = auditResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredLogs = auditLogs.filter(log => {
    if (!searchQuery) return true;
    return (
      log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(log.event_details).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user_id && log.user_id.includes(searchQuery))
    );
  });

  const getStatusBadgeVariant = (success: boolean) => {
    return success ? 'default' : 'destructive';
  };

  const formatJsonPreview = (data: any) => {
    if (!data) return 'N/A';
    const str = JSON.stringify(data, null, 2);
    return str.length > 100 ? `${str.substring(0, 100)}...` : str;
  };

  if (!canViewAudit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view audit logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Audit Log"
        description="View and search all system activities and changes"
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter audit logs by table, action, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by event type, details, or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                  <SelectValue placeholder="Filter by event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  <SelectItem value="role_assignment">Role Assignment</SelectItem>
                  <SelectItem value="role_granted">Role Granted</SelectItem>
                  <SelectItem value="role_activated">Role Activated</SelectItem>
                  <SelectItem value="role_deactivated">Role Deactivated</SelectItem>
                  <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                  <SelectItem value="user_creation_error">User Creation Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={successFilter} onValueChange={setSuccessFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-32"}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Success</SelectItem>
                  <SelectItem value="false">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size={isMobile ? "default" : "icon"} className={isMobile ? "w-full" : ""}>
                <Download className="h-4 w-4" />
                {isMobile && <span className="ml-2">Export</span>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Audit Entries ({filteredLogs.length})</CardTitle>
              <CardDescription>
                Page {currentPage} of {totalPages} ({totalCount} total entries)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : isMobile ? (
            <MobileTable
              data={filteredLogs}
              renderCard={(log) => (
                <Card key={log.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium font-mono">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                      </div>
                      <Badge variant={getStatusBadgeVariant(log.success)}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <MobileTableRow 
                      label="Event Type" 
                      value={log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    />
                    
                    <MobileTableRow 
                      label="Details" 
                      value={<span className="text-sm">{formatJsonPreview(log.event_details)}</span>} 
                    />
                    
                    <MobileTableRow 
                      label="User" 
                      value={<span className="font-mono text-sm">{log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}</span>} 
                    />
                  
                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedEntry(log)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-4xl'}`}>
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <div>
                              <label className="text-sm font-medium">Timestamp</label>
                              <p className="font-mono text-sm">
                                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                              </p>
                            </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div>
                                  <Badge variant={getStatusBadgeVariant(log.success)}>
                                    {log.success ? 'Success' : 'Failed'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Event Type</label>
                                <p>{log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User ID</label>
                                <p className="font-mono text-sm break-all">{log.user_id || 'System'}</p>
                              </div>
                          </div>
                          
                            {log.event_details && (
                              <div>
                                <label className="text-sm font-medium">Event Details</label>
                                <pre className={`mt-2 bg-muted p-4 rounded-md text-xs overflow-auto ${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                                  {JSON.stringify(log.event_details, null, 2)}
                                </pre>
                              </div>
                            )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              )}
              emptyMessage="No audit logs found"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.success)}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatJsonPreview(log.event_details)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedEntry(log)}
                            aria-label="View audit log details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Timestamp</label>
                                <p className="font-mono text-sm">
                                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div>
                                  <Badge variant={getStatusBadgeVariant(log.success)}>
                                    {log.success ? 'Success' : 'Failed'}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Event Type</label>
                                <p>{log.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">User ID</label>
                                <p className="font-mono text-sm">{log.user_id || 'System'}</p>
                              </div>
                            </div>
                            
                            {log.event_details && (
                              <div>
                                <label className="text-sm font-medium">Event Details</label>
                                <pre className="mt-2 bg-muted p-4 rounded-md text-xs overflow-auto max-h-48">
                                  {JSON.stringify(log.event_details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;