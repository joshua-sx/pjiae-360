import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const assignAppraisers = useCallback(async (
    appraisalId: string, 
    appraiserIds: string[],
    assignedBy: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
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
  }, [toast]);

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
      // Get employee's manager and organizational hierarchy
      const { data: employee, error: empError } = await supabase
        .from('employee_info')
        .select(`
          id,
          manager_id,
          department_id,
          division_id,
          organization_id
        `)
        .eq('id', employeeId)
        .single();

      if (empError) throw empError;

      const suggestions: SuggestedAppraiser[] = [];

      // Get manager if exists
      if (employee.manager_id) {
        const { data: manager } = await supabase
          .from('employee_info')
          .select(`
            id,
            job_title,
            user_id
          `)
          .eq('id', employee.manager_id)
          .single();

        if (manager) {
          // Get manager's profile
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', manager.user_id)
            .single();

          const managerName = managerProfile 
            ? `${managerProfile.first_name || ''} ${managerProfile.last_name || ''}`.trim()
            : 'Manager';
            
          suggestions.push({
            appraiser_id: manager.id,
            appraiser_name: managerName || 'Unknown Manager',
            appraiser_role: manager.job_title || 'Manager',
            hierarchy_level: 1
          });
        }
      }

      // Get other managers in the same department
      const { data: deptManagers, error: deptError } = await supabase
        .from('employee_info')
        .select(`
          id,
          job_title,
          user_id
        `)
        .eq('department_id', employee.department_id)
        .ilike('job_title', '%manager%')
        .neq('id', employeeId)
        .neq('id', employee.manager_id || '')
        .limit(3);

      if (!deptError && deptManagers) {
        for (const manager of deptManagers) {
          // Get manager's profile
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', manager.user_id)
            .single();

          const managerName = managerProfile 
            ? `${managerProfile.first_name || ''} ${managerProfile.last_name || ''}`.trim()
            : 'Manager';
            
          suggestions.push({
            appraiser_id: manager.id,
            appraiser_name: managerName || 'Unknown Manager',
            appraiser_role: manager.job_title || 'Department Manager',
            hierarchy_level: 2
          });
        }
      }

      return suggestions;
    } catch (err: any) {
      console.error('Error getting suggested appraisers:', err);
      return [];
    }
  }, []);

  const validateAppraiserAssignment = useCallback(async (appraiserId: string, employeeId: string) => {
    try {
      // Basic validation - ensure appraiser is not the same as employee
      if (appraiserId === employeeId) {
        return { valid: false, reason: 'Employee cannot appraise themselves' };
      }

      // Get both employee and appraiser info
      const { data: employee, error: empError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('id', employeeId)
        .single();

      const { data: appraiser, error: appError } = await supabase
        .from('employee_info')
        .select('organization_id')
        .eq('id', appraiserId)
        .single();

      if (empError || appError) {
        return { valid: false, reason: 'Could not validate employee or appraiser' };
      }

      // Ensure same organization
      if (employee.organization_id !== appraiser.organization_id) {
        return { valid: false, reason: 'Appraiser must be in the same organization' };
      }

      return { valid: true, reason: null };
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