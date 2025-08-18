import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import {
  useOrganizationStore,
  selectSetOrganization,
  selectClearOrganization,
  selectOrganizationId,
  selectOrganizationName,
} from '@/stores';

export function useCurrentOrganization() {
  const { user, loading: authLoading } = useAuth();
  const setOrganization = useOrganizationStore(selectSetOrganization);
  const clearOrganization = useOrganizationStore(selectClearOrganization);
  const id = useOrganizationStore(selectOrganizationId);
  const name = useOrganizationStore(selectOrganizationName);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!user) {
        clearOrganization();
        return;
      }

      try {
        const { data, error } = await supabase
          .from('employee_info')
          .select('organization_id, organizations(name)')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to load organization:', error);
          // Handle tenancy-related errors with proper user feedback
          if (error.code === '42P17') {
            console.error('Database policy recursion detected - this should be fixed with the new policies');
          }
          clearOrganization();
          return;
        }

        if (data) {
          setOrganization(data.organization_id, data.organizations?.name ?? null);
        } else {
          // User might not have employee_info yet
          clearOrganization();
        }
      } catch (err) {
        console.error('Error loading organization:', err);
        clearOrganization();
      }
    };

    if (!authLoading) {
      loadOrganization();
    }
  }, [user, authLoading, setOrganization, clearOrganization]);

    return { id, name, setOrganization, clearOrganization };
  }
