import { QueryClient } from '@tanstack/react-query';

// Centralized QueryClient configuration with optimized defaults
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Keep data fresh for 5 minutes in most cases
        staleTime: 5 * 60 * 1000,
        // Cache time: Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 2 times with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        // Enable background refetch on window focus for critical data
        refetchOnWindowFocus: true,
        // Disable refetch on reconnect to avoid unnecessary requests
        refetchOnReconnect: false,
        // Enable refetch on mount for fresh data
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once on network errors
        retry: (failureCount, error: any) => {
          // Only retry network errors, not application errors
          if (error?.status >= 400) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });

// Global query invalidation utilities
export const queryInvalidation = {
  // Invalidate all organization-scoped queries
  invalidateOrganizationData: (queryClient: QueryClient, organizationId: string | null) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes(organizationId);
      },
    });
  },

  // Clear all organization data when switching orgs
  clearOrganizationData: (queryClient: QueryClient, organizationId: string | null) => {
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes(organizationId);
      },
    });
  },

  // Clear all auth-related data on logout
  clearAuthData: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  // Invalidate specific entity types across all orgs
  invalidateEntityType: (queryClient: QueryClient, entityType: string) => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes(entityType);
      },
    });
  },
};

// Tenant-aware query key factory
export const createTenantQueryKey = (
  entity: string,
  organizationId: string | null,
  ...params: (string | number | object | null | undefined)[]
) => {
  // Filter out undefined values to ensure consistent keys
  const filteredParams = params.filter(p => p !== undefined);
  return [entity, organizationId, ...filteredParams];
};

// Common query configurations for different data types
export const queryConfigs = {
  // Critical user data - keep very fresh
  userProfile: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  },
  
  // Organization data - moderately fresh
  organization: {
    staleTime: 5 * 60 * 1000, // 5 minutes  
    gcTime: 60 * 60 * 1000,   // 1 hour
  },
  
  // Lists and dashboards - can be slightly stale
  lists: {
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes
  },
  
  // Reference data - can be stale for longer
  reference: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  },
  
  // Analytics data - background updates OK
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnWindowFocus: false,
  },
};
