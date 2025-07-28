import { useMemo } from 'react';
import { AppRole } from '@/hooks/usePermissions';
import { generateDemoEmployees } from '@/lib/demoData';

interface UseDemoEmployeesOptions {
  limit?: number;
  offset?: number;
}

export function useDemoEmployees(role: AppRole, options: UseDemoEmployeesOptions = {}) {
  const employees = useMemo(() => {
    const demoData = generateDemoEmployees(role);
    const { limit, offset = 0 } = options;
    
    if (limit) {
      return demoData.slice(offset, offset + limit);
    }
    
    return demoData.slice(offset);
  }, [role, options.limit, options.offset]);

  return {
    data: employees,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
    isSuccess: true,
    isError: false
  };
}