import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from './usePermissions';

interface ExportResult {
  export_timestamp: string;
  organization_id: string;
  exported_by: string;
  tables: Record<string, {
    record_count: number;
    data: any[];
  }>;
}

export function useTenantExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { isAdmin } = usePermissions();

  const exportTenantData = async (organizationId?: string) => {
    if (!isAdmin) {
      toast.error('Admin privileges required for data export');
      return;
    }

    setIsExporting(true);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call the tenant export edge function
      const { data, error } = await supabase.functions.invoke('tenant-export', {
        body: { organizationId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Export error:', error);
        throw new Error(error.message || 'Export failed');
      }

      const result = data as ExportResult;
      
      // Create and download the export file
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-export-${result.organization_id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success summary
      const tableNames = Object.keys(result.tables);
      const totalRecords = Object.values(result.tables).reduce(
        (sum, table) => sum + table.record_count, 0
      );

      toast.success(
        `Export completed: ${tableNames.length} tables, ${totalRecords} total records`
      );

      return result;
    } catch (error) {
      console.error('Tenant export failed:', error);
      toast.error(
        error instanceof Error 
          ? `Export failed: ${error.message}`
          : 'Export failed with unknown error'
      );
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportTenantData,
    isExporting,
    canExport: isAdmin,
  };
}