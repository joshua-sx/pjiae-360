import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoAppraisals } from '@/lib/demoData';

export interface Appraisal {
  id: string;
  employeeName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  division: string;
  type: string;
  score: number | null;
  scoreLabel: string;
  performance: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  appraiser: string;
  appraiserId: string;
  year: string;
  createdAt: string;
  updatedAt: string;
  cycleName?: string;
  periodName?: string;
  avatarUrl?: string;
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
  const { isDemoMode, demoRole } = useDemoMode();
  
  const getScoreLabel = (score: number | null): string => {
    if (score === null) return 'Not Rated';
    if (score >= 4.5) return 'Outstanding';
    if (score >= 3.5) return 'Exceeds Expectations';
    if (score >= 2.5) return 'Meets Expectations';
    if (score >= 1.5) return 'Needs Improvement';
    return 'Unsatisfactory';
  };
  
  const getPerformanceLevel = (score: number | null): string => {
    if (score === null) return 'Not Evaluated';
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  // Return demo data if in demo mode
  if (isDemoMode) {
    const demoAppraisals = generateDemoAppraisals(demoRole);
    const transformedDemoAppraisals = demoAppraisals.map((appraisal, index) => ({
      ...appraisal,
      jobTitle: index === 0 ? 'Software Engineer' : index === 1 ? 'Product Manager' : 'UI/UX Designer',
      department: index === 0 ? 'Engineering' : index === 1 ? 'Product' : 'Design',
      division: 'Technology',
      scoreLabel: getScoreLabel(appraisal.score),
      performance: getPerformanceLevel(appraisal.score),
      appraiser: 'Demo Manager',
      appraiserId: 'demo-manager-1',
      year: new Date(appraisal.createdAt).getFullYear().toString(),
      avatarUrl: undefined,
    }));
    
    return {
      appraisals: transformedDemoAppraisals,
      loading: false,
      error: null,
      refetch: async () => {},
    };
  }

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
          employee_id,
          cycle_id
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
        query = query.eq('status', filters.status as 'draft' | 'in_progress' | 'completed');
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
        return {
          id: appraisal.id,
          employeeName: 'Unknown Employee',
          employeeId: appraisal.employee_id || '',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          division: 'Technology',
          type: 'Annual', // Default type
          score: appraisal.final_rating,
          scoreLabel: getScoreLabel(appraisal.final_rating),
          performance: getPerformanceLevel(appraisal.final_rating),
          status: appraisal.status as Appraisal['status'],
          appraiser: 'Unassigned',
          appraiserId: '',
          year: new Date(appraisal.created_at).getFullYear().toString(),
          createdAt: appraisal.created_at,
          updatedAt: appraisal.updated_at,
          cycleName: 'Default Cycle',
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