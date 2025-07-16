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
          overall_score,
          created_at,
          updated_at,
          employee:profiles!appraisals_employee_id_fkey(
            id,
            first_name,
            last_name
          ),
          cycle:cycles(
            id,
            name,
            start_date,
            end_date,
            frequency
          ),
          period:periods(
            id,
            name,
            start_date,
            end_date
          ),
          appraisal_appraisers(
            is_primary,
            appraiser:profiles!appraisal_appraisers_appraiser_id_fkey(
              id,
              first_name,
              last_name
            )
          )
        `);

      // Apply role-based filtering
      if (roles.includes('employee') && !roles.some(r => ['admin', 'director', 'manager', 'supervisor'].includes(r))) {
        // Employee sees only their own appraisals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          query = query.eq('employee_id', profileData);
        }
      } else if (roles.includes('manager') || roles.includes('supervisor')) {
        // Manager/Supervisor sees their direct reports' appraisals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          const { data: directReports } = await supabase.rpc('get_direct_reports', {
            _profile_id: profileData
          });
          
          if (directReports && directReports.length > 0) {
            const reportIds = directReports.map(r => r.profile_id);
            reportIds.push(profileData); // Include own appraisals
            query = query.in('employee_id', reportIds);
          } else {
            query = query.eq('employee_id', profileData);
          }
        }
      } else if (roles.includes('director')) {
        // Director sees division-level appraisals
        const { data: profileData } = await supabase.rpc('get_user_profile_id');
        if (profileData) {
          const { data: divisionEmployees } = await supabase.rpc('get_division_employees', {
            _profile_id: profileData
          });
          
          if (divisionEmployees && divisionEmployees.length > 0) {
            const employeeIds = divisionEmployees.map(e => e.profile_id);
            query = query.in('employee_id', employeeIds);
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
        const appraiserName = primaryAppraiser?.appraiser 
          ? `${primaryAppraiser.appraiser.first_name || ''} ${primaryAppraiser.appraiser.last_name || ''}`.trim()
          : 'Unassigned';

        return {
          id: appraisal.id,
          employeeName: appraisal.employee 
            ? `${appraisal.employee.first_name || ''} ${appraisal.employee.last_name || ''}`.trim()
            : 'Unknown Employee',
          employeeId: appraisal.employee?.id || '',
          type: appraisal.cycle?.frequency || 'Unknown',
          score: appraisal.overall_score,
          scoreLabel: getScoreLabel(appraisal.overall_score),
          status: appraisal.status as Appraisal['status'],
          appraiser: appraiserName,
          appraiserId: primaryAppraiser?.appraiser?.id || '',
          year: appraisal.cycle?.start_date ? new Date(appraisal.cycle.start_date).getFullYear().toString() : 
                new Date(appraisal.created_at).getFullYear().toString(),
          createdAt: appraisal.created_at,
          updatedAt: appraisal.updated_at,
          cycleName: appraisal.cycle?.name,
          periodName: appraisal.period?.name,
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