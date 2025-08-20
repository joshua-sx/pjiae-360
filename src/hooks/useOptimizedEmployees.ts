import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import { useEmployeeStore, selectEmployeeFilters } from '@/stores';
import { useDebounce } from './useDebounce';
import { Employee } from '@/types/shared';

export const useOptimizedEmployees = () => {
  const filters = useEmployeeStore(selectEmployeeFilters);
  
  // useEmployees already reads filters from the store for server-side filtering
  const query = useEmployees({ limit: 1000 });

  return {
    ...query,
    optimizedFilters: filters
  };
};