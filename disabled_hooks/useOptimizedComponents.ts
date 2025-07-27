import { useMemo, useCallback } from 'react';
import { AppRole } from '@/types/shared';

// Memoized permission calculations
export function useOptimizedPermissions(userRoles: AppRole[], requiredRoles?: AppRole[]) {
  return useMemo(() => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  }, [userRoles, requiredRoles]);
}

// Memoized navigation items generation
export function useOptimizedNavigation(userRole: AppRole, organizationId?: string) {
  return useMemo(() => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
      { id: 'goals', label: 'Goals', path: '/goals' },
      { id: 'appraisals', label: 'Appraisals', path: '/appraisals' },
      { id: 'calendar', label: 'Calendar', path: '/calendar' },
    ];

    const adminItems = [
      { id: 'admin-employees', label: 'Employees', path: '/admin/employees' },
      { id: 'admin-roles', label: 'Roles', path: '/admin/roles' },
      { id: 'admin-organization', label: 'Organization', path: '/admin/organization' },
      { id: 'admin-settings', label: 'Settings', path: '/admin/settings' },
    ];

    if (userRole === 'admin' || userRole === 'director') {
      return [...baseItems, ...adminItems];
    }

    return baseItems;
  }, [userRole, organizationId]);
}

// Optimized table column definitions
export function useOptimizedTableColumns<T>(
  baseColumns: Array<{ id: string; label: string; accessor: keyof T }>,
  userRole: AppRole
) {
  return useMemo(() => {
    // Add role-specific columns
    const extraColumns = [];
    
    if (userRole === 'admin' || userRole === 'director') {
      extraColumns.push({
        id: 'actions',
        label: 'Actions',
        accessor: 'actions' as keyof T,
      });
    }

    return [...baseColumns, ...extraColumns];
  }, [baseColumns, userRole]);
}

// Debounced callback hook for expensive operations
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  return useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
      };
    })() as T,
    [callback, delay]
  );
}

// Memoized data filtering
export function useOptimizedFilter<T>(
  data: T[],
  filterFunction: (item: T) => boolean,
  dependencies: any[]
) {
  return useMemo(() => {
    return data.filter(filterFunction);
  }, [data, filterFunction, ...dependencies]);
}