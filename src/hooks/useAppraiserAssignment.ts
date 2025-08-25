import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDemoGuard } from '@/lib/demo-mode-guard';

export interface AppraiserAssignment {
  id: string;
  appraisal_id: string;
  appraiser_id: string;
  role: 'primary' | 'secondary';
  is_primary: boolean;
  created_at: string;
  appraiser?: {
    id: string;
    job_title?: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      avatar_url?: string;
    };
  };
}

export interface SuggestedAppraiser {
  appraiser_id: string;
  appraiser_name: string;
  appraiser_role: string;
  hierarchy_level: number;
}

export function useAppraiserAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isDemoMode } = useDemoGuard();

  const assignAppraisers = useCallback(async (
    appraisalId: string, 
    appraiserIds: string[],
    assignedBy: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo mode - simulate assignment without actual database calls
      if (isDemoMode) {
        console.log(`🎭 DEMO MODE: Simulating appraiser assignment for appraisal ${appraisalId}`, {
          appraiserIds,
          assignedBy
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = appraiserIds.map((appraiserId, index) => ({
          id: `mock-assignment-${Math.random()}`,
          appraisal_id: appraisalId,
          appraiser_id: appraiserId,
          role: index === 0 ? 'primary' : 'secondary',
          is_primary: index === 0,
          created_at: new Date().toISOString(),
          appraiser: {
            id: appraiserId,
            job_title: 'Manager',
            profile: {
              first_name: 'Demo',
              last_name: 'User',
              email: 'demo@example.com',
              avatar_url: null
            }
          }
        }));

        toast({
          title: "Success",
          description: `Assigned ${appraiserIds.length} appraiser(s) successfully (Demo Mode)`
        });

        return mockData;
      }

      // Remove existing assignments
      await supabase
        .from('appraisal_appraisers')
        .delete()
        .eq('appraisal_id', appraisalId);

      // Create new assignments
      const assignments = appraiserIds.map((appraiserId, index) => ({
        appraisal_id: appraisalId,
        appraiser_id: appraiserId,
        role: index === 0 ? 'primary' : 'secondary',
        is_primary: index === 0
      }));

      const { data, error } = await supabase
        .from('appraisal_appraisers')
        .insert(assignments)
        .select(`
          *,
          appraiser:employee_info(
            id,
            job_title,
            profile:profiles(first_name, last_name, email, avatar_url)
          )
        `);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assigned ${appraiserIds.length} appraiser(s) successfully`
      });

      return data;
    } catch (err: any) {
      const errorMessage = 'Failed to assign appraisers';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, isDemoMode]);

  const getAppraisalAppraisers = useCallback(async (appraisalId: string) => {
    try {
      const { data, error } = await supabase
        .from('appraisal_appraisers')
        .select(`
          *,
          appraiser:employee_info(
            id,
            job_title,
            profile:profiles(first_name, last_name, email, avatar_url)
          )
        `)
        .eq('appraisal_id', appraisalId)
        .order('is_primary', { ascending: false });

      if (error) throw error;

      return data as AppraiserAssignment[];
    } catch (err: any) {
      setError('Failed to fetch appraisers');
      throw err;
    }
  }, []);

  const getSuggestedAppraisers = useCallback(async (employeeId: string): Promise<SuggestedAppraiser[]> => {
    try {
      // Use secure RPC function to get potential appraisers
      const { data: appraisers, error } = await supabase.rpc(
        'get_potential_appraisers',
        { _employee_id: employeeId }
      );

      if (error) {
        console.error('Error getting suggested appraisers:', error);
        return [];
      }

      if (!appraisers) {
        return [];
      }

      // Transform to expected format
      return appraisers.map((appraiser: any) => ({
        appraiser_id: appraiser.appraiser_id,
        appraiser_name: appraiser.full_name || 'Unknown',
        appraiser_role: appraiser.role === 'manager' ? 'Direct Manager' : 'Department Manager',
        hierarchy_level: appraiser.hierarchy_level
      }));
    } catch (err: any) {
      console.error('Error getting suggested appraisers:', err);
      return [];
    }
  }, []);

  const validateAppraiserAssignment = useCallback(async (appraiserId: string, employeeId: string) => {
    try {
      // Use secure RPC function to validate assignment
      const { data: result, error } = await supabase.rpc(
        'validate_appraiser_assignment',
        {
          _appraiser_id: appraiserId,
          _employee_id: employeeId
        }
      );

      if (error) {
        console.error('Error validating appraiser assignment:', error);
        return { valid: false, reason: 'Validation failed due to an error' };
      }

      const resultData = result as any;
      return {
        valid: resultData?.valid || false,
        reason: resultData?.reason || null
      };
    } catch (err: any) {
      return { valid: false, reason: 'Validation failed' };
    }
  }, []);

  const removeAppraiser = useCallback(async (appraisalId: string, appraiserId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('appraisal_appraisers')
        .delete()
        .eq('appraisal_id', appraisalId)
        .eq('appraiser_id', appraiserId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appraiser removed successfully"
      });
    } catch (err: any) {
      const errorMessage = 'Failed to remove appraiser';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    assignAppraisers,
    getAppraisalAppraisers,
    getSuggestedAppraisers,
    validateAppraiserAssignment,
    removeAppraiser
  };
}