
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useDemoGuard } from '@/lib/demo-mode-guard';

interface ImportRequest {
  organizationId: string; // Changed: now requires organizationId instead of orgName
  people: Array<{
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    department?: string;
    division?: string;
    role?: string;
  }>;
  adminInfo: {
    name: string;
    email: string;
    role: string;
  };
}

interface ImportResult {
  success: boolean;
  message?: string;
  stats?: {
    total: number;
    successful: number;
    failed: number;
  };
  errors?: Array<{
    email: string;
    error: string;
  }>;
}

export const useEmployeeImport = () => {
  const { user } = useAuth();
  const { guardDatabaseOperation } = useDemoGuard();
  const [isImporting, setIsImporting] = useState(false);

  const importEmployees = async (
    organizationId: string, // Changed: now takes organizationId instead of orgName
    people: ImportRequest['people'],
    adminInfo: ImportRequest['adminInfo']
  ): Promise<ImportResult> => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      // Guard against demo mode violations
      guardDatabaseOperation('import employees');
    } catch (error) {
      console.warn('Demo mode: Skipping employee import');
      return {
        success: true,
        message: 'Demo mode: Import simulated successfully',
        stats: { total: people.length, successful: people.length, failed: 0 }
      };
    }

    setIsImporting(true);

    try {
      const payload: ImportRequest = {
        organizationId, // Send organizationId instead of orgName
        people,
        adminInfo
      };

      const { data, error } = await supabase.functions.invoke('import-employees', {
        body: payload
      });

      if (error) {
        console.error('Import error:', error);
        return {
          success: false,
          message: `Import failed: ${error.message}`
        };
      }

      return data as ImportResult;
    } catch (error) {
      console.error('Unexpected import error:', error);
      return {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importEmployees,
    isImporting
  };
};
