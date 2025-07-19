import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmployeeFilters {
  search: string;
  status: string;
  role: string;
  division: string;
  department: string;
}

interface EmployeeState {
  filters: EmployeeFilters;
  setFilters: (filters: EmployeeFilters) => void;
  resetFilters: () => void;
}

const defaultFilters: EmployeeFilters = {
  search: '',
  status: 'all',
  role: 'all',
  division: 'all',
  department: 'all',
};

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setFilters: (filters) => set({ filters }),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: 'employee-filters',
    }
  )
);