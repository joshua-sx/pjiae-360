import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useEmployeeStore, selectEmployeeFilters } from '@/stores';
import { useDebounce } from './useDebounce';
import { Employee } from '@/types/shared';

export const useOptimizedEmployees = () => {
  const filters = useEmployeeStore(selectEmployeeFilters);
  const debouncedSearch = useDebounce(filters.search, 300);
  
  const query = useEmployees({ limit: 100 });
  
  const optimizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch
  }), [filters, debouncedSearch]);

  const filteredEmployees = useMemo(() => {
    if (!query.data) return [];
    
    let filtered: Employee[] = query.data as Employee[];

    // Search filtering
    if (optimizedFilters.search) {
      const searchTerm = optimizedFilters.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.profile?.first_name?.toLowerCase().includes(searchTerm) ||
        emp.profile?.last_name?.toLowerCase().includes(searchTerm) ||
        emp.profile?.email?.toLowerCase().includes(searchTerm) ||
        emp.job_title?.toLowerCase().includes(searchTerm)
      );
    }

    // Division filtering
    if (optimizedFilters.division !== 'all') {
      const selectedDivisions = optimizedFilters.division.split(',').filter(Boolean);
      if (selectedDivisions.length > 0) {
        filtered = filtered.filter(emp => 
          emp.division && selectedDivisions.includes(emp.division.id)
        );
      }
    }

    // Department filtering
    if (optimizedFilters.department !== 'all') {
      const selectedDepartments = optimizedFilters.department.split(',').filter(Boolean);
      if (selectedDepartments.length > 0) {
        filtered = filtered.filter(emp => 
          emp.department && selectedDepartments.includes(emp.department.id)
        );
      }
    }

    return filtered;
  }, [query.data, optimizedFilters]);

  return {
    ...query,
    data: filteredEmployees,
    optimizedFilters
  };
};