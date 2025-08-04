import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    { name: 'employee-filters' }
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
    { name: 'active-organization' }
  )
);

export const selectOrganizationId = (state: OrganizationState) => state.id;
export const selectOrganizationName = (state: OrganizationState) => state.name;
export const selectSetOrganization = (state: OrganizationState) => state.setOrganization;
export const selectClearOrganization = (state: OrganizationState) => state.clearOrganization;

