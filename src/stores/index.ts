import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EmployeeFilters } from '@/components/admin/employees/types';

/**
 * EmployeeStore
 *
 * Responsibilities:
 * - Manage and persist employee list filters across sessions.
 *
 * Selectors:
 * - selectEmployeeFilters
 * - selectSetEmployeeFilters
 * - selectResetEmployeeFilters
 */
interface EmployeeState {
  filters: EmployeeFilters;
  setFilters: (filters: EmployeeFilters) => void;
  resetFilters: () => void;
}

const defaultEmployeeFilters: EmployeeFilters = {
  search: '',
  status: 'all',
  role: 'all',
  division: 'all',
  department: 'all',
};

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      filters: defaultEmployeeFilters,
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: defaultEmployeeFilters }),
    }),
    {
      name: 'employee-filters',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filters: state.filters }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate and sanitize rehydrated state
          const { filters } = state;
          if (!filters || typeof filters !== 'object') {
            state.filters = defaultEmployeeFilters;
          }
        }
      },
    }
  )
);

export const selectEmployeeFilters = (state: EmployeeState) => state.filters;
export const selectSetEmployeeFilters = (state: EmployeeState) => state.setFilters;
export const selectResetEmployeeFilters = (state: EmployeeState) => state.resetFilters;

/**
 * OrganizationStore
 *
 * Responsibilities:
 * - Track the currently active organization for the user.
 *
 * Selectors:
 * - selectOrganizationId
 * - selectOrganizationName
 * - selectSetOrganization
 * - selectClearOrganization
 */
interface OrganizationState {
  id: string | null;
  name: string | null;
  setOrganization: (id: string | null, name: string | null) => void;
  clearOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      setOrganization: (id, name) => set({ id, name }),
      clearOrganization: () => set({ id: null, name: null }),
    }),
    {
      name: 'active-organization',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ id: state.id, name: state.name }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate organization data on rehydration
          if (state.id && typeof state.id !== 'string') {
            state.id = null;
            state.name = null;
          }
        }
      },
    }
  )
);

export const selectOrganizationId = (state: OrganizationState) => state.id;
export const selectOrganizationName = (state: OrganizationState) => state.name;
export const selectSetOrganization = (state: OrganizationState) => state.setOrganization;
export const selectClearOrganization = (state: OrganizationState) => state.clearOrganization;

