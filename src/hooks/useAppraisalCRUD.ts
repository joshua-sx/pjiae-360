import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppraisalData } from '@/components/appraisals/types';
import { logAuditEvent } from '@/lib/audit';

export interface CreateAppraisalData {
  employee_id: string;
  cycle_id: string;
  organization_id: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
  phase?: 'goal_setting' | 'mid_term' | 'year_end';
}

export interface UpdateAppraisalData {
  final_rating?: number;
  overall_feedback?: string;
  development_goals?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
  phase?: 'goal_setting' | 'mid_term' | 'year_end';
  self_assessment_completed?: boolean;
  manager_review_completed?: boolean;
}

export function useAppraisalCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createAppraisal = useCallback(async (data: CreateAppraisalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: appraisal, error } = await supabase
        .from('appraisals')
        .insert({
          employee_id: data.employee_id,
          cycle_id: data.cycle_id,
          organization_id: data.organization_id,
          status: data.status || 'draft',
          phase: data.phase || 'goal_setting'
        })
        .select()
        .single();

      if (error) throw error;

      return appraisal;
    } catch (err: any) {
      const errorMessage = 'Failed to create appraisal';
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

  const updateAppraisal = useCallback(async (appraisalId: string, data: UpdateAppraisalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: appraisal, error } = await supabase
        .from('appraisals')
        .update(data)
        .eq('id', appraisalId)
        .select()
        .single();

      if (error) throw error;

      return appraisal;
    } catch (err: any) {
      const errorMessage = 'Failed to update appraisal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppraisal = useCallback(async (appraisalId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: appraisal, error } = await supabase
        .from('appraisals')
        .select(`
          *,
          employee:employee_info(
            id,
            job_title,
            department:departments(name),
            division:divisions(name),
            profile:profiles(first_name, last_name, email, avatar_url)
          ),
          cycle:appraisal_cycles(name, year),
          appraisers:appraisal_appraisers(
            id,
            role,
            is_primary,
            appraiser:employee_info(
              id,
              job_title,
              profile:profiles(first_name, last_name, email, avatar_url)
            )
          )
        `)
        .eq('id', appraisalId)
        .single();

      if (error) throw error;

      return appraisal;
    } catch (err: any) {
      const errorMessage = 'Failed to fetch appraisal';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppraisalGoals = useCallback(async (appraisalId: string) => {
    try {
      const { data: appraisal, error: appraisalError } = await supabase
        .from('appraisals')
        .select('employee_id')
        .eq('id', appraisalId)
        .single();

      if (appraisalError) throw appraisalError;

      const { data: goals, error } = await supabase
        .from('goal_assignments')
        .select(`
          goal:goals(
            id,
            title,
            description,
            priority,
            status,
            due_date
          )
        `)
        .eq('employee_id', appraisal.employee_id);

      if (error) throw error;

      return goals?.map(item => item.goal).filter(Boolean) || [];
    } catch (err: any) {
      const errorMessage = 'Failed to fetch goals';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getAppraisalCompetencies = useCallback(async (organizationId: string) => {
    try {
      const { data: competencies, error } = await supabase
        .from('competencies')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;

      return competencies || [];
    } catch (err: any) {
      const errorMessage = 'Failed to fetch competencies';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteAppraisal = useCallback(async (appraisalId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('appraisals')
        .delete()
        .eq('id', appraisalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appraisal deleted successfully"
      });
    } catch (err: any) {
      const errorMessage = 'Failed to delete appraisal';
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

  const saveSignature = useCallback(
    async (appraisalId: string, role: string, signatureData: string) => {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        const userId = user?.id || '';

        const { error } = await supabase
          .from('signatures')
          .upsert(
            {
              appraisal_id: appraisalId,
              role,
              signature_data: signatureData,
              user_id: userId
            },
            { onConflict: 'appraisal_id,role' }
          );

        if (error) throw error;

        await logAuditEvent(appraisalId, userId, `signature_${role}`);
      } catch (err: any) {
        const errorMessage = 'Failed to save signature';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchSignatures = useCallback(async (appraisalId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('signatures')
        .select('role, signature_data')
        .eq('appraisal_id', appraisalId);

      if (error) throw error;

      const result: Record<string, string> = {};
      data?.forEach(row => {
        result[row.role] = row.signature_data;
      });

      return result;
    } catch (err: any) {
      const errorMessage = 'Failed to fetch signatures';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createAppraisal,
    updateAppraisal,
    getAppraisal,
    getAppraisalGoals,
    getAppraisalCompetencies,
    deleteAppraisal,
    saveSignature,
    fetchSignatures
  };
}