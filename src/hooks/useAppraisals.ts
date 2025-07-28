import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';

export interface Appraisal {
  id: string;
  employeeName: string;
  employeeId: string;
  type: string;
  score: number | null;
  scoreLabel: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  appraiser: string;
  appraiserId: string;
  year: string;
  createdAt: string;
  updatedAt: string;
  cycleName?: string;
  periodName?: string;
}

interface UseAppraisalsResult {
  appraisals: Appraisal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAppraisals(filters?: {
  year?: string;
  status?: string;
  type?: string;
  employeeId?: string;
}): UseAppraisalsResult {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { roles, loading: permissionsLoading } = usePermissions();

  const getScoreLabel = (score: number | null): string => {
    if (score === null) return 'Not Rated';
    if (score >= 4.5) return 'Outstanding';
    if (score >= 3.5) return 'Exceeds Expectations';
    if (score >= 2.5) return 'Meets Expectations';
    if (score >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const fetchAppraisals = async () => {
    if (permissionsLoading) return;

    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('appraisals')
        .select(`
          id,
          status,
          final_rating,
          created_at,
          updated_at,
          employee:employee_info!appraisals_employee_id_fkey(
            id,
            profiles(
              first_name,
              last_name
            )
          ),
          cycle:appraisal_cycles(
            id,
            name,
            start_date,
            end_date,
            year
          ),
          appraisal_appraisers(
            is_primary,
            appraiser:employee_info!appraisal_appraisers_appraiser_id_fkey(
              id,
              profiles(
                first_name,
                last_name
              )
            )
          )
        `);

      // Apply role-based filtering
      if (roles.includes('employee') && !roles.some(r => ['admin', 'director', 'manager', 'supervisor'].includes(r))) {
        // Employee sees only their own appraisals
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: empData } = await supabase
            .from('employee_info')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (empData) {
            query = query.eq('employee_id', empData.id);
          }
        }
      } else if (roles.includes('manager') || roles.includes('supervisor')) {
        // Manager/Supervisor sees their direct reports' appraisals
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: empData } = await supabase
            .from('employee_info')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (empData) {
            // For now, just show own appraisals - can be extended later for direct reports
            query = query.eq('employee_id', empData.id);
          }
        }
      }
      // Admin sees all appraisals (no additional filter needed)

      // Apply additional filters
      if (filters?.year && filters.year !== 'All') {
        // Filter by cycle year
        query = query.gte('created_at', `${filters.year}-01-01`)
                   .lt('created_at', `${parseInt(filters.year) + 1}-01-01`);
      }

      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match our Appraisal interface
      const transformedAppraisals: Appraisal[] = (data || []).map(appraisal => {
        const primaryAppraiser = appraisal.appraisal_appraisers?.find(a => a.is_primary);
        const appraiserName = primaryAppraiser?.appraiser?.profile
          ? `${primaryAppraiser.appraiser.profile.first_name || ''} ${primaryAppraiser.appraiser.profile.last_name || ''}`.trim()
          : 'Unassigned';

        return {
          id: appraisal.id,
          employeeName: appraisal.employee?.profile
            ? `${appraisal.employee.profile.first_name || ''} ${appraisal.employee.profile.last_name || ''}`.trim()
            : 'Unknown Employee',
          employeeId: appraisal.employee?.id || '',
          type: 'Annual', // Default type
          score: appraisal.final_rating,
          scoreLabel: getScoreLabel(appraisal.final_rating),
          status: appraisal.status as Appraisal['status'],
          appraiser: appraiserName,
          appraiserId: primaryAppraiser?.appraiser?.id || '',
          year: appraisal.cycle?.start_date ? new Date(appraisal.cycle.start_date).getFullYear().toString() : 
                new Date(appraisal.created_at).getFullYear().toString(),
          createdAt: appraisal.created_at,
          updatedAt: appraisal.updated_at,
          cycleName: appraisal.cycle?.name,
        };
      });

      setAppraisals(transformedAppraisals);
    } catch (err) {
      console.error('Error fetching appraisals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, [filters?.year, filters?.status, filters?.type, filters?.employeeId, permissionsLoading, roles.join(',')]);

  return {
    appraisals,
    loading,
    error,
    refetch: fetchAppraisals,
  };
}