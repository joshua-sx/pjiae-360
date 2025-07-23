import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganizationStore } from '@/stores/organizationStore';

export function useCurrentOrganization() {
  const { user, loading: authLoading } = useAuth();
  const { setOrganization, clearOrganization } = useOrganizationStore();

  useEffect(() => {
    const loadOrganization = async () => {
      if (!user) {
        clearOrganization();
        return;
      }

      const { data, error } = await supabase
        .from('employee_info')
        .select('organization_id, organizations(name)')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to load organization:', error);
        clearOrganization();
        return;
      }

      setOrganization(data.organization_id, data.organizations?.name ?? null);
    };

    if (!authLoading) {
      loadOrganization();
    }
  }, [user, authLoading, setOrganization, clearOrganization]);

  return useOrganizationStore();
}
