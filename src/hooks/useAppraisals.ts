import { useQuery } from '@tanstack/react-query';
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

export function useAppraisals(filters?: {
  year?: string;
  status?: string;
  type?: string;
  employeeId?: string;
}) {
  const { roles, loading: permissionsLoading } = usePermissions();
  const { isDemoMode, demoRole } = useDemoMode();
  
  const getScoreLabel = (score: number | null): string => {
    if (score === null) return 'Not Rated';
    if (score >= 5) return 'Outstanding';
    if (score >= 4) return 'Exceeds Expectations';
    if (score >= 3) return 'Meets Expectations';
    if (score >= 2) return 'Needs Improvement';
    return 'Unsatisfactory';
  };
  
  const getPerformanceLevel = (score: number | null): string => {
    if (score === null) return 'Not Evaluated';
    if (score >= 5) return 'Excellent';
    if (score >= 4) return 'Good';
    if (score >= 3) return 'Average';
    if (score >= 2) return 'Below Average';
    return 'Poor';
  };

  const query = useQuery({
    queryKey: ['appraisals', filters, roles],
    enabled: !permissionsLoading || isDemoMode,
    queryFn: async (): Promise<Appraisal[]> => {
      if (isDemoMode) {
        const demoAppraisals = generateDemoAppraisals(demoRole);
        return demoAppraisals.map((appraisal, index) => ({
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
      }

      let query = supabase
        .from('appraisals')
        .select(
          `id, status, final_rating, created_at, updated_at, employee_id, cycle_id, organization_id`
        );

      if (filters?.year && filters.year !== 'All') {
        query = query
          .gte('created_at', `${filters.year}-01-01`)
          .lt('created_at', `${parseInt(filters.year) + 1}-01-01`);
      }

      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status as 'draft' | 'in_progress' | 'completed');
      }

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).map(appraisal => ({
        id: appraisal.id,
        employeeName: 'Unknown Employee',
        employeeId: appraisal.employee_id || '',
        jobTitle: 'Unknown',
        department: 'Unknown',
        division: 'Unknown',
        type: 'Annual',
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
      }));
    },
  });

  return {
    appraisals: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}