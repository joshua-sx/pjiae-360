import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoData } from '@/contexts/DemoDataContext';
import { guardAgainstDemoMode } from '@/lib/demo-mode-guard';
import { useUserQuery } from './useTenantAwareQuery';

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

export function useOrganization() {
  const { isDemoMode } = useDemoMode();
  const { getOrganization } = useDemoData();

  const query = useUserQuery<Organization | null>({
    entity: 'organization',
    params: [isDemoMode ? 'demo' : 'live'],
    queryFn: async (): Promise<Organization | null> => {
      if (isDemoMode) {
        return getOrganization();
      }

      guardAgainstDemoMode('organization.select');

      const { data, error } = await supabase
        .from('employee_info')
        .select('organization_id, organizations(id, name, logo_url, status, subscription_plan, created_at, updated_at)')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data?.organizations || null;
    },
  });

  return {
    organization: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}