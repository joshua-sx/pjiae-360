
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';
import { DashboardLayout } from "@/components/DashboardLayout";
import { EnhancedAuditFilters } from './EnhancedAuditFilters';
import { enhancedAuditColumns } from './enhanced-audit-columns';
import { AuditDetailsDrawer } from './AuditDetailsDrawer';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { EmptyTableState } from '@/components/ui/empty-table-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ResponsiveDataTable } from '@/components/ui/responsive-data-table';
import { EnhancedAuditLogEntry, AuditFiltersState } from '@/types/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnhancedAuditLogPage() {
  const [selectedEntry, setSelectedEntry] = useState<EnhancedAuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  
  const { canViewAudit } = usePermissions();

  // Simplified filter state - no URL params for now to avoid TypeScript issues
  const [filters, setFilters] = useState<AuditFiltersState>({
    search: '',
    roles: [],
    divisions: [],
    departments: [],
    actions: [],
    dateFrom: '',
    dateTo: '',
    outcome: 'all',
  });

  // Update filters function
  const updateFilters = (newFilters: Partial<AuditFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1); // Reset pagination on filter change
  };

  // Fetch audit logs - simplified to use existing columns for now
  const { data: auditResult, isLoading } = useQuery<{ data: EnhancedAuditLogEntry[], count: number }>({
    enabled: canViewAudit,
    queryKey: ['enhanced-audit-logs', JSON.stringify(filters), currentPage],
    queryFn: async () => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;

      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex);

      // Apply basic filters that work with existing schema
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      if (filters.outcome !== 'all') {
        const isSuccess = filters.outcome === 'success';
        query = query.eq('success', isSuccess);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      
      // Transform existing data to match enhanced interface
      const transformedData = (data ?? []).map(entry => ({
        ...entry,
        // Map existing fields to new interface
        actor_name: null,
        actor_email: null,
        actor_role_name: null,
        actor_division_name: null,
        actor_department_name: null,
        object_type: null,
        object_id: null,
        object_name: null,
        action_code: entry.event_type,
        outcome: entry.success ? 'success' : 'failure',
        metadata: entry.event_details || {},
        occurred_at: entry.created_at,
      })) as EnhancedAuditLogEntry[];
      
      return { data: transformedData, count: count ?? 0 };
    }
  });

  const auditLogs = auditResult?.data ?? [];
  const totalCount = auditResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Client-side search filtering for instant feedback
  const filteredLogs = useMemo(() => {
    if (!auditLogs || !filters.search) return auditLogs || [];
    
    const searchTerm = filters.search.toLowerCase().trim();
    return auditLogs.filter(log => {
      const searchableText = [
        log.event_type,
        JSON.stringify(log.event_details || {}),
        log.user_id
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }, [auditLogs, filters.search]);

  // Get unique values for filter dropdowns - simplified for now
  const { data: filterOptions } = useQuery<{ roles: string[], divisions: string[], departments: string[] }>({
    enabled: canViewAudit,
    queryKey: ['audit-filter-options'],
    queryFn: async () => {
      // Return empty arrays for now since we don't have the new columns yet
      return { 
        roles: [] as string[], 
        divisions: [] as string[], 
        departments: [] as string[] 
      };
    }
  });

  // Create table instance
  const { table } = useDataTable({
    data: filteredLogs,
    columns: enhancedAuditColumns,
    enableRowSelection: false,
    getRowId: (row) => row.id,
  });

  const handleAuditEntryClick = (entry: EnhancedAuditLogEntry) => {
    setSelectedEntry(entry);
  };

  const handleExport = () => {
    // TODO: Implement CSV export with current filters
    console.log('Export audit logs with filters:', filters);
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
          title="Activity Log"
          description="Business-readable audit trail of all system activities"
        />

        <div className="space-y-4 min-w-0">
          <EnhancedAuditFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onExport={handleExport}
            availableRoles={filterOptions?.roles ?? []}
            availableDivisions={filterOptions?.divisions ?? []}
            availableDepartments={filterOptions?.departments ?? []}
            rightSlot={
              <DataTableViewOptions 
                table={table} 
                triggerClassName="h-9 px-3 text-sm font-medium border-input bg-background hover:bg-accent hover:text-accent-foreground"
              />
            }
          />
          
          <div className="w-full min-w-0 max-w-full">
            {isLoading ? (
              <TableSkeleton rows={10} columns={8} />
            ) : filteredLogs.length === 0 ? (
              <EmptyTableState
                title="No activity found"
                description={
                  Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v && v !== 'all')
                    ? "Try adjusting your filters or search terms"
                    : "No audit events have been recorded yet"
                }
                showSearchTip={true}
              />
            ) : (
              <ResponsiveDataTable
                data={filteredLogs}
                columns={enhancedAuditColumns}
                table={table}
                onRowClick={handleAuditEntryClick}
                enableHorizontalScroll={true}
                stickyColumns={["occurred_at", "action_code"]}
                enableFiltering={false}
                searchKey="actor_name"
                searchPlaceholder="Search activities..."
                className="w-full max-w-full min-w-0"
                emptyMessage="No activity entries found"
                isLoading={isLoading}
              />
            )}
          </div>
          
          {/* Pagination info */}
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground text-center py-2">
              Showing {filteredLogs.length} of {totalCount} entries
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>
      </div>

      {/* Audit Entry Details Drawer */}
      <AuditDetailsDrawer
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </DashboardLayout>
  );
};
