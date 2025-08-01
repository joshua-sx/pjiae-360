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
import { Search, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMobileResponsive } from '@/hooks/use-mobile-responsive';
import { useSearchParams } from 'react-router-dom';

interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values: any;
  new_values: any;
  user_id: string;
  created_at: string;
  context: any;
}

const AuditLogPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [tableFilter, setTableFilter] = useState<string>(searchParams.get('table') ?? 'all');
  const [actionFilter, setActionFilter] = useState<string>(searchParams.get('action') ?? 'all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const { isMobile } = useMobileResponsive();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', tableFilter, actionFilter],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('timestamp', { ascending: false });

      if (tableFilter && tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter && actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AuditLogEntry[];
    }
  });

  const filteredLogs = auditLogs.filter(log => {
    if (!searchQuery) return true;
    return (
      log.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.record_id.includes(searchQuery)
    );
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const formatJsonPreview = (data: any) => {
    if (!data) return 'N/A';
    const str = JSON.stringify(data, null, 2);
    return str.length > 100 ? `${str.substring(0, 100)}...` : str;
  };

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
                  placeholder="Search by table name, action, or record ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-48"}>
                  <SelectValue placeholder="Filter by table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tables</SelectItem>
                  <SelectItem value="profiles">Profiles</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="appraisals">Appraisals</SelectItem>
                  <SelectItem value="user_roles">User Roles</SelectItem>
                  <SelectItem value="cycles">Cycles</SelectItem>
                  <SelectItem value="periods">Periods</SelectItem>
                  <SelectItem value="organizations">Organizations</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-32"}>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
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
          <CardTitle>Audit Entries ({filteredLogs.length})</CardTitle>
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
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </div>
                  
                  <MobileTableRow 
                    label="Table" 
                    value={log.table_name} 
                  />
                  
                  <MobileTableRow 
                    label="Record ID" 
                    value={<span className="font-mono text-sm">{log.record_id.substring(0, 12)}...</span>} 
                  />
                  
                  <MobileTableRow 
                    label="Changes" 
                    value={
                      <div className="text-sm">
                        {log.action === 'INSERT' && formatJsonPreview(log.new_values)}
                        {log.action === 'UPDATE' && 'Field changes'}
                        {log.action === 'DELETE' && formatJsonPreview(log.old_values)}
                      </div>
                    } 
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
                              <label className="text-sm font-medium">Action</label>
                              <div>
                                <Badge variant={getActionBadgeVariant(log.action)}>
                                  {log.action}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Table</label>
                              <p>{log.table_name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Record ID</label>
                              <p className="font-mono text-sm break-all">{log.record_id}</p>
                            </div>
                          </div>
                          
                          {log.old_values && (
                            <div>
                              <label className="text-sm font-medium">Previous Values</label>
                              <pre className={`mt-2 bg-muted p-4 rounded-md text-xs overflow-auto ${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                                {JSON.stringify(log.old_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.new_values && (
                            <div>
                              <label className="text-sm font-medium">New Values</label>
                              <pre className={`mt-2 bg-muted p-4 rounded-md text-xs overflow-auto ${isMobile ? 'max-h-32' : 'max-h-48'}`}>
                                {JSON.stringify(log.new_values, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {log.context && (
                            <div>
                              <label className="text-sm font-medium">Context</label>
                              <pre className="mt-2 bg-muted p-4 rounded-md text-xs overflow-auto max-h-24">
                                {JSON.stringify(log.context, null, 2)}
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
                  <TableHead>Table</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Changes</TableHead>
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
                    <TableCell>{log.table_name}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.record_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.action === 'INSERT' && formatJsonPreview(log.new_values)}
                      {log.action === 'UPDATE' && 'Field changes'}
                      {log.action === 'DELETE' && formatJsonPreview(log.old_values)}
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
                                <label className="text-sm font-medium">Action</label>
                                <div>
                                  <Badge variant={getActionBadgeVariant(log.action)}>
                                    {log.action}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Table</label>
                                <p>{log.table_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Record ID</label>
                                <p className="font-mono text-sm">{log.record_id}</p>
                              </div>
                            </div>
                            
                            {log.old_values && (
                              <div>
                                <label className="text-sm font-medium">Previous Values</label>
                                <pre className="mt-2 bg-muted p-4 rounded-md text-xs overflow-auto max-h-48">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.new_values && (
                              <div>
                                <label className="text-sm font-medium">New Values</label>
                                <pre className="mt-2 bg-muted p-4 rounded-md text-xs overflow-auto max-h-48">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {log.context && (
                              <div>
                                <label className="text-sm font-medium">Context</label>
                                <pre className="mt-2 bg-muted p-4 rounded-md text-xs overflow-auto max-h-24">
                                  {JSON.stringify(log.context, null, 2)}
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