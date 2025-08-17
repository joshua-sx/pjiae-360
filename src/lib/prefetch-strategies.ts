import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createTenantQueryKey } from './query-client';

/**
 * Prefetch strategies for common data patterns
 */
export const prefetchStrategies = {
  /**
   * Prefetch essential dashboard data when user signs in
   */
  prefetchDashboardData: async (queryClient: QueryClient, organizationId: string) => {
    const prefetchPromises = [
      // Prefetch organization info
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('organization', organizationId),
        queryFn: async () => {
          const { data } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();
          return data;
        },
        staleTime: 5 * 60 * 1000,
      }),

      // Prefetch user's employee info
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('employee-info', organizationId),
        queryFn: async () => {
          const { data } = await supabase
            .from('employee_info')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
          return data;
        },
        staleTime: 5 * 60 * 1000,
      }),

      // Prefetch departments for the organization
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('departments', organizationId),
        queryFn: async () => {
          const { data } = await supabase
            .from('departments')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name');
          return data;
        },
        staleTime: 30 * 60 * 1000,
      }),
    ];

    // Execute all prefetches in parallel
    await Promise.allSettled(prefetchPromises);
  },

  /**
   * Prefetch goal-related data when navigating to goals section
   */
  prefetchGoalsData: async (queryClient: QueryClient, organizationId: string) => {
    const prefetchPromises = [
      // Prefetch goals list
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('goals', organizationId, { page: 1 }),
        queryFn: async () => {
          const { data } = await supabase
            .from('goals')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(20);
          return data;
        },
        staleTime: 3 * 60 * 1000,
      }),

      // Prefetch appraisal cycles
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('appraisal-cycles', organizationId),
        queryFn: async () => {
          const { data } = await supabase
            .from('appraisal_cycles')
            .select('*')
            .eq('organization_id', organizationId)
            .order('year', { ascending: false });
          return data;
        },
        staleTime: 30 * 60 * 1000,
      }),
    ];

    await Promise.allSettled(prefetchPromises);
  },

  /**
   * Prefetch employee-related data when navigating to employees section
   */
  prefetchEmployeeData: async (queryClient: QueryClient, organizationId: string) => {
    const prefetchPromises = [
      // Prefetch employees list (first page)
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('employees', organizationId, { page: 1 }),
        queryFn: async () => {
          const { data } = await supabase
            .from('employee_info')
            .select(`
              *,
              profiles:user_id(first_name, last_name, email),
              departments(name),
              divisions(name)
            `)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(20);
          return data;
        },
        staleTime: 3 * 60 * 1000,
      }),

      // Prefetch divisions
      queryClient.prefetchQuery({
        queryKey: createTenantQueryKey('divisions', organizationId),
        queryFn: async () => {
          const { data } = await supabase
            .from('divisions')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name');
          return data;
        },
        staleTime: 30 * 60 * 1000,
      }),
    ];

    await Promise.allSettled(prefetchPromises);
  },

  /**
   * Prefetch reference data that's commonly needed across the app
   */
  prefetchReferenceData: async (queryClient: QueryClient) => {
    const prefetchPromises = [
      // Prefetch roles
      queryClient.prefetchQuery({
        queryKey: ['roles'],
        queryFn: async () => {
          const { data } = await supabase
            .from('roles')
            .select('*')
            .order('level');
          return data;
        },
        staleTime: 60 * 60 * 1000, // 1 hour
      }),

      // Prefetch permissions
      queryClient.prefetchQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
          const { data } = await supabase
            .from('permissions')
            .select('*')
            .order('name');
          return data;
        },
        staleTime: 60 * 60 * 1000, // 1 hour
      }),
    ];

    await Promise.allSettled(prefetchPromises);
  },
};

/**
 * Smart prefetching based on user navigation patterns
 */
export const smartPrefetch = {
  /**
   * Prefetch data based on the current route
   */
  prefetchForRoute: async (
    queryClient: QueryClient, 
    route: string, 
    organizationId: string | null
  ) => {
    if (!organizationId) return;

    const routePrefetchMap: Record<string, () => Promise<void>> = {
      '/dashboard': () => prefetchStrategies.prefetchDashboardData(queryClient, organizationId),
      '/goals': () => prefetchStrategies.prefetchGoalsData(queryClient, organizationId),
      '/employees': () => prefetchStrategies.prefetchEmployeeData(queryClient, organizationId),
      '/admin': () => prefetchStrategies.prefetchEmployeeData(queryClient, organizationId),
    };

    const prefetchFn = routePrefetchMap[route];
    if (prefetchFn) {
      await prefetchFn();
    }
  },

  /**
   * Prefetch likely next pages based on current context
   */
  prefetchLikelyNext: async (
    queryClient: QueryClient,
    currentRoute: string,
    organizationId: string | null
  ) => {
    if (!organizationId) return;

    // Common navigation patterns
    const likelyNextMap: Record<string, string[]> = {
      '/dashboard': ['/goals', '/appraisals'],
      '/goals': ['/appraisals', '/employees'],
      '/employees': ['/goals', '/admin'],
    };

    const likelyNext = likelyNextMap[currentRoute];
    if (likelyNext) {
      // Prefetch in background without awaiting
      likelyNext.forEach(route => {
        smartPrefetch.prefetchForRoute(queryClient, route, organizationId);
      });
    }
  },
};