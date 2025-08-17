import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';
import { queryInvalidation } from '@/lib/query-client';
import { useOrganizationStore } from '@/stores';

interface QueryClientManagerProps {
  children: React.ReactNode;
}

/**
 * QueryClientManager handles cache hygiene and query invalidation
 * based on auth state and organization changes
 */
export const QueryClientManager = ({ children }: QueryClientManagerProps) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { id: currentOrgId } = useCurrentOrganization();
  const prevOrgId = React.useRef<string | null>(null);

  // Clear all data on logout
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      queryInvalidation.clearAuthData(queryClient);
      // Also clear organization store
      useOrganizationStore.getState().clearOrganization();
    }
  }, [isAuthenticated, user, queryClient]);

  // Handle organization changes
  useEffect(() => {
    // Skip on initial mount
    if (prevOrgId.current === null) {
      prevOrgId.current = currentOrgId;
      return;
    }

    // Organization changed - invalidate old org data and prefetch new
    if (prevOrgId.current !== currentOrgId) {
      // Clear old organization data
      if (prevOrgId.current) {
        queryInvalidation.clearOrganizationData(queryClient, prevOrgId.current);
      }
      
      // Invalidate new organization data to ensure fresh fetch
      if (currentOrgId) {
        queryInvalidation.invalidateOrganizationData(queryClient, currentOrgId);
      }
      
      prevOrgId.current = currentOrgId;
    }
  }, [currentOrgId, queryClient]);

  return <>{children}</>;
};