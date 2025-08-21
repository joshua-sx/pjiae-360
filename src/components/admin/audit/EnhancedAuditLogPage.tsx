
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/page-header';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEntry, setSelectedEntry] = useState<EnhancedAuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  
  const { canViewAudit } = usePermissions();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<AuditFiltersState>({
    search: searchParams.get('search') ?? '',
    roles: searchParams.getAll('role') ?? [],
    divisions: searchParams.getAll('division') ?? [],
    departments: searchParams.getAll('department') ?? [],
    actions: searchParams.getAll('action') ?? [],
    dateFrom: searchParams.get('dateFrom') ?? '',
    dateTo: searchParams.get('dateTo') ?? '',
    outcome: searchParams.get('outcome') ?? 'all',
  });

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<AuditFiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const newParams = new URLSearchParams();
    if (updatedFilters.search) newParams.set('search', updatedFilters.search);
    updatedFilters.roles.forEach(role => newParams.append('role', role));
    updatedFilters.divisions.forEach(div => newParams.append('division', div));
    updatedFilters.departments.forEach(dept => newParams.append('department', dept));
    updatedFilters.actions.forEach(action => newParams.append('action', action));
    if (updatedFilters.dateFrom) newParams.set('dateFrom', updatedFilters.dateFrom);
    if (updatedFilters.dateTo) newParams.set('dateTo', updatedFilters.dateTo);
    if (updatedFilters.outcome !== 'all') newParams.set('outcome', updatedFilters.outcome);
    
    setSearchParams(newParams);
    setCurrentPage(1); // Reset pagination on filter change
  };

  // Fetch audit logs with enhanced fields
  const { data: auditResult, isLoading } = useQuery({
    enabled: canViewAudit,
    queryKey: ['enhanced-audit-logs', filters, currentPage],
    queryFn: async (): Promise<{ data: EnhancedAuditLogEntry[], count: number }> => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize - 1;

      let query = supabase
        .from('security_audit_log')
        .select('*', { count: 'exact' })
        .order('occurred_at', { ascending: false })
        .range(startIndex, endIndex);

      // Apply filters
      if (filters.roles.length > 0) {
        query = query.in('actor_role_name', filters.roles);
      }
      
      if (filters.divisions.length > 0) {
        query = query.in('actor_division_name', filters.divisions);
      }
      
      if (filters.departments.length > 0) {
        query = query.in('actor_department_name', filters.departments);
      }
      
      if (filters.actions.length > 0) {
        query = query.in('action_code', filters.actions);
      }
      
      if (filters.dateFrom) {
        query = query.gte('occurred_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('occurred_at', filters.dateTo);
      }
      
      if (filters.outcome !== 'all') {
        query = query.eq('outcome', filters.outcome);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: (data ?? []) as EnhancedAuditLogEntry[], count: count ?? 0 };
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
        log.actor_name,
        log.actor_email,
        log.event_type,
        log.action_code,
        log.object_name,
        log.object_type,
        JSON.stringify(log.event_details || {}),
        JSON.stringify(log.metadata || {})
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }, [auditLogs, filters.search]);

  // Get unique values for filter dropdowns
  const { data: filterOptions } = useQuery({
    enabled: canViewAudit,
    queryKey: ['audit-filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('actor_role_name, actor_division_name, actor_department_name')
        .not('actor_role_name', 'is', null);

      if (error) throw error;

      const roles = [...new Set(data.map(d => d.actor_role_name).filter(Boolean))];
      const divisions = [...new Set(data.map(d => d.actor_division_name).filter(Boolean))];
      const departments = [...new Set(data.map(d => d.actor_department_name).filter(Boolean))];

      return { roles, divisions, departments };
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
