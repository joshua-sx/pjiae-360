import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useDebounce } from './useDebounce';

export const useOptimizedEmployees = () => {
  const { filters } = useEmployeeStore();
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const query = useEmployees({ limit: 100 });
  
  const optimizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch
  }), [filters, debouncedSearch]);

  const filteredEmployees = useMemo(() => {
    if (!query.data) return [];
    
    let filtered = query.data;

    // Client-side filtering for immediate feedback
    if (optimizedFilters.search && optimizedFilters.search !== debouncedSearch) {
      const searchTerm = optimizedFilters.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.profile?.first_name?.toLowerCase().includes(searchTerm) ||
        emp.profile?.last_name?.toLowerCase().includes(searchTerm) ||
        emp.profile?.email?.toLowerCase().includes(searchTerm) ||
        emp.job_title?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [query.data, optimizedFilters, debouncedSearch]);

  return {
    ...query,
    data: filteredEmployees,
    optimizedFilters
  };
};