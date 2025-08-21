import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSearchParams } from 'react-router-dom';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuditFilters } from './AuditFilters';
import { auditColumns, AuditLogEntry } from './audit-columns';
import { AuditTableMemo } from './AuditTableMemo';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { EmptyTableState } from '@/components/ui/empty-table-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';


export default function AuditLogPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>(searchParams.get('event_type') ?? 'all');
  const [successFilter, setSuccessFilter] = useState<string>(searchParams.get('success') ?? 'all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
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

  // Client-side filtering for instant feedback
  const filteredLogs = useMemo(() => {
    if (!auditLogs || !searchQuery) return auditLogs || [];
    
    const searchTerm = searchQuery.toLowerCase().trim();
    return auditLogs.filter(log => {
      const eventType = log.event_type.toLowerCase();
      const details = JSON.stringify(log.event_details || {}).toLowerCase();
      const userId = (log.user_id || '').toLowerCase();
      
      return eventType.includes(searchTerm) || 
             details.includes(searchTerm) || 
             userId.includes(searchTerm);
    });
  }, [auditLogs, searchQuery]);

  // Create table instance
  const { table } = useDataTable({
    data: filteredLogs,
    columns: auditColumns,
    enableRowSelection: false,
    getRowId: (row) => row.id,
  });

  const handleAuditEntryClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export audit logs');
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
    <DashboardLayout isLoading={isLoading}>
      <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 overflow-x-clip">
        <PageHeader
          title="Audit Log"
          description="View and search all system activities and changes"
        />

        <div className="space-y-4 min-w-0">
          <AuditFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            eventTypeFilter={eventTypeFilter}
            onEventTypeChange={setEventTypeFilter}
            successFilter={successFilter}
            onSuccessChange={setSuccessFilter}
            onExport={handleExport}
            rightSlot={
              <DataTableViewOptions 
                table={table} 
                triggerClassName="h-9 px-3 text-sm font-medium border-input bg-background hover:bg-accent hover:text-accent-foreground"
              />
            }
          />
          
          <div className="w-full min-w-0 max-w-full">
            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : filteredLogs.length === 0 ? (
              <EmptyTableState
                title="No audit entries found"
                description={searchQuery || eventTypeFilter !== 'all' || successFilter !== 'all' 
                  ? "Try adjusting your filters or search terms"
                  : "No audit events have been recorded yet"
                }
                showSearchTip={true}
              />
            ) : (
              <AuditTableMemo
                auditEntries={filteredLogs}
                isLoading={isLoading}
                table={table}
                onAuditEntryClick={handleAuditEntryClick}
              />
            )}
          </div>
          
          {/* Pagination info - subtle display like Employees */}
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              Showing {filteredLogs.length} of {totalCount} entries
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>
      </div>

      {/* Audit Entry Details Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Timestamp</label>
                    <p>{format(new Date(selectedEntry.created_at), "PPpp")}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Event Type</label>
                    <p>{selectedEntry.event_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">User ID</label>
                    <p>{selectedEntry.user_id || "System"}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Success</label>
                    <p>{selectedEntry.success ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Organization ID</label>
                    <p>{selectedEntry.organization_id || "—"}</p>
                  </div>
                </div>
                
                {selectedEntry.event_details && (
                  <div>
                    <label className="font-medium text-muted-foreground block mb-2">Event Details</label>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(selectedEntry.event_details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};