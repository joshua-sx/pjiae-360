import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCurrentOrganization } from './useCurrentOrganization';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { createTenantQueryKey, queryConfigs } from '@/lib/query-client';

interface TenantAwareQueryOptions<TData, TError = Error> 
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  // Entity type for consistent query keys
  entity: string;
  // Additional parameters for the query key
  params?: (string | number | object | null | undefined)[];
  // Query function that receives organizationId
  queryFn: (organizationId: string | null) => Promise<TData>;
  // Query configuration preset
  config?: keyof typeof queryConfigs;
  // Whether to enable the query when no organization is selected
  enableWithoutOrg?: boolean;
}

/**
 * Hook for tenant-aware queries that automatically include organizationId in query keys
 * and are disabled when no organization is available (unless explicitly enabled)
 */
export function useTenantAwareQuery<TData, TError = Error>({
  entity,
  params = [],
  queryFn,
  config = 'lists',
  enableWithoutOrg = false,
  enabled = true,
  ...options
}: TenantAwareQueryOptions<TData, TError>) {
  const { id: organizationId } = useCurrentOrganization();
  const { isDemoMode } = useDemoMode();

  // Apply configuration preset
  const configOptions = queryConfigs[config];

  return useQuery<TData, TError>({
    queryKey: createTenantQueryKey(entity, organizationId, ...params),
    queryFn: () => queryFn(organizationId),
    enabled: enabled && (enableWithoutOrg || !!organizationId || isDemoMode),
    ...configOptions,
    ...options,
  });
}

/**
 * Hook for reference data queries (departments, roles, etc.) that don't need tenant scoping
 * but benefit from consistent caching patterns
 */
export function useReferenceQuery<TData, TError = Error>({
  entity,
  params = [],
  queryFn,
  ...options
}: Omit<TenantAwareQueryOptions<TData, TError>, 'config' | 'enableWithoutOrg'>) {
  return useTenantAwareQuery<TData, TError>({
    entity,
    params,
    queryFn,
    config: 'reference',
    enableWithoutOrg: true,
    ...options,
  });
}

/**
 * Hook for user profile queries that should work regardless of organization
 */
export function useUserQuery<TData, TError = Error>({
  entity,
  params = [],
  queryFn,
  ...options
}: Omit<TenantAwareQueryOptions<TData, TError>, 'config' | 'enableWithoutOrg'>) {
  return useTenantAwareQuery<TData, TError>({
    entity,
    params,
    queryFn,
    config: 'userProfile',
    enableWithoutOrg: true,
    ...options,
  });
}