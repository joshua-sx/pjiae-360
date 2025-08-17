import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useOrganizationStore, useEmployeeStore } from '@/stores';
import { queryInvalidation } from '@/lib/query-client';

/**
 * Hook to handle cleanup of state when auth changes
 * Ensures clean slate when users sign in/out or switch accounts
 */
export function useAuthCleanup() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const clearOrganization = useOrganizationStore(state => state.clearOrganization);
  const resetEmployeeFilters = useEmployeeStore(state => state.resetFilters);

  useEffect(() => {
    // Clear all client state when user logs out
    if (!isAuthenticated && user === null) {
      // Clear React Query cache
      queryInvalidation.clearAuthData(queryClient);
      
      // Clear Zustand stores
      clearOrganization();
      resetEmployeeFilters();
      
      // Clear any remaining localStorage items related to the app
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('employee-filters') || 
        key.startsWith('active-organization') ||
        key.startsWith('demo-')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [isAuthenticated, user, queryClient, clearOrganization, resetEmployeeFilters]);

  // Reset filters when organization changes to avoid stale filters
  const organizationId = useOrganizationStore(state => state.id);
  const prevOrgId = React.useRef<string | null>(null);

  useEffect(() => {
    if (prevOrgId.current !== null && prevOrgId.current !== organizationId) {
      resetEmployeeFilters();
    }
    prevOrgId.current = organizationId;
  }, [organizationId, resetEmployeeFilters]);
}