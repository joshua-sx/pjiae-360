/**
 * Tenant-aware query enforcement utilities
 * Ensures all queries are properly scoped to organizations
 */

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { logger } from '@/lib/logger';

/**
 * Validates and enforces organization ID in query keys
 */
export function validateTenantQueryKey(
  queryKey: unknown[],
  expectedOrgId: string | null,
  entity: string
): boolean {
  if (!Array.isArray(queryKey) || queryKey.length < 2) {
    logger.warn('Invalid query key format', {
      entity,
      queryKey: JSON.stringify(queryKey),
      expectedOrgId
    });
    return false;
  }

  const [keyEntity, keyOrgId] = queryKey;
  
  if (keyEntity !== entity) {
    logger.warn('Query key entity mismatch', {
      entity,
      keyEntity,
      expectedOrgId
    });
    return false;
  }

  if (keyOrgId !== expectedOrgId) {
    logger.warn('Query key organization mismatch', {
      entity,
      keyOrgId,
      expectedOrgId
    });
    return false;
  }

  return true;
}

/**
 * Hook to enforce tenant-aware query keys
 */
export function useTenantQueryEnforcement() {
  const { id: organizationId } = useCurrentOrganization();
  const { isDemoMode } = useDemoMode();

  return {
    /**
     * Creates a properly scoped tenant query key
     */
    createTenantKey: (entity: string, ...params: unknown[]) => {
      if (isDemoMode) {
        return [entity, 'demo', ...params];
      }
      return [entity, organizationId, ...params];
    },

    /**
     * Validates that a query key is properly tenant-scoped
     */
    validateKey: (queryKey: unknown[], entity: string) => {
      const expectedOrgId = isDemoMode ? 'demo' : organizationId;
      return validateTenantQueryKey(queryKey, expectedOrgId, entity);
    },

    /**
     * Gets the current organization context for queries
     */
    getOrgContext: () => ({
      organizationId: isDemoMode ? 'demo' : organizationId,
      isDemoMode
    })
  };
}

/**
 * Runtime query key validation for debugging
 */
export function auditQueryKeys(queryClient: any, organizationId: string | null) {
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();
  const violations: Array<{ queryKey: unknown[]; issue: string }> = [];

  queries.forEach(query => {
    const { queryKey } = query;
    
    if (!Array.isArray(queryKey) || queryKey.length < 2) {
      violations.push({
        queryKey,
        issue: 'Invalid query key format - missing organization scope'
      });
      return;
    }

    const [entity, keyOrgId] = queryKey;
    
    if (typeof entity === 'string' && entity !== 'reference' && keyOrgId !== organizationId) {
      violations.push({
        queryKey,
        issue: `Organization mismatch - expected ${organizationId}, got ${keyOrgId}`
      });
    }
  });

  if (violations.length > 0) {
    logger.warn('Query key audit violations found', {
      violationCount: violations.length,
      violations: violations.slice(0, 10), // Log first 10
      organizationId
    });
  }

  return {
    totalQueries: queries.length,
    violations: violations.length,
    details: violations
  };
}