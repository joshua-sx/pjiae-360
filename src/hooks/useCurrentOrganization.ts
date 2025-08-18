
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
        // Use the safe RPC function to get organization ID
        const { data: orgId, error: orgError } = await supabase.rpc('get_current_user_org_id');
        
        if (orgError) {
          console.error('Failed to get organization ID:', orgError);
          clearOrganization();
          return;
        }

        if (orgId) {
          // Fetch organization details
          const { data: orgData, error: fetchError } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', orgId)
            .maybeSingle();

          if (fetchError) {
            console.error('Failed to fetch organization details:', fetchError);
            clearOrganization();
            return;
          }

          setOrganization(orgId, orgData?.name ?? null);
        } else {
          // User might not have roles yet (pre-onboarding)
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
