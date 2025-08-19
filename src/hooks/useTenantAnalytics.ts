import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

interface TenantAnalytics {
  organization_id: string;
  total_users: number;
  users_with_failures: number;
  total_failures: number;
  cross_org_attempts: number;
  last_activity: string;
  activity_date: string;
}

export function useTenantAnalytics(organizationId?: string) {
  const [analytics, setAnalytics] = useState<TenantAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = usePermissions();

  const fetchAnalytics = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_tenant_analytics', {
          _org_id: organizationId
        });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Failed to fetch tenant analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    if (!isAdmin) return;
    
    try {
      // Refresh the materialized view
      await supabase.rpc('refresh_tenant_analytics');
      // Then fetch updated data
      await fetchAnalytics();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, organizationId]);

  return {
    analytics,
    loading,
    refreshAnalytics,
    canViewAnalytics: isAdmin,
  };
}