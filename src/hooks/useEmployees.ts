import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/shared";
import { useEmployeeStore, selectEmployeeFilters } from "@/stores";
import { useMemo } from "react";
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoEmployees } from './useDemoEmployees';

interface UseEmployeesOptions {
  limit?: number;
  offset?: number;
}

interface UseEmployeesResult {
  data: Employee[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
  totalCount?: number;
}

export const useEmployees = (options: UseEmployeesOptions = {}): UseEmployeesResult => {
  const filters = useEmployeeStore(selectEmployeeFilters);
  const { isDemoMode, demoRole } = useDemoMode();
  const { limit = 1000, offset = 0 } = options;
  
  // Get demo data hook (always call, but conditionally use result)
  const demoEmployeesResult = useDemoEmployees(demoRole, options);

  // Get total count via secure function
  const countQuery = useQuery({
    queryKey: ["employees-count", filters],
    queryFn: async (): Promise<number> => {
      if (isDemoMode) return 0;
      
      // Parse division and department filters
      const divisionIds = filters.division !== 'all' ? filters.division.split(',').filter(Boolean) : null;
      const departmentIds = filters.department !== 'all' ? filters.department.split(',').filter(Boolean) : null;
      
      const { data, error } = await supabase.rpc('get_secure_employee_directory_count_filtered', {
        _search: filters.search || null,
        _division_ids: divisionIds,
        _department_ids: departmentIds,
        _status: filters.status !== 'all' ? filters.status : null
      });
      
      if (error) throw error;
      return data || 0;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isDemoMode,
  });

  const query = useQuery({
    queryKey: ["employees", filters, limit, offset],
    queryFn: async (): Promise<Employee[]> => {
      if (isDemoMode) return [];
      
      // Parse division and department filters
      const divisionIds = filters.division !== 'all' ? filters.division.split(',').filter(Boolean) : null;
      const departmentIds = filters.department !== 'all' ? filters.department.split(',').filter(Boolean) : null;
      
      // Use the secure directory function with server-side filtering
      const { data: directoryData, error: directoryError } = await supabase
        .rpc('get_secure_employee_directory_filtered', {
          _search: filters.search || null,
          _division_ids: divisionIds,
          _department_ids: departmentIds,
          _status: filters.status !== 'all' ? filters.status : null,
          _limit: limit,
          _offset: offset
        });

      if (directoryError) {
        throw directoryError;
      }

      if (!directoryData || directoryData.length === 0) {
        return [];
      }

      // Convert to Employee format
      const employees: Employee[] = directoryData.map(emp => ({
        id: emp.employee_id,
        job_title: emp.job_title,
        status: emp.status,
        created_at: '',
        updated_at: '',
        user_id: emp.user_id,
        organization_id: emp.organization_id,
        department_id: null,
        division_id: null,
        employee_number: null,
        phone_number: null,
        employment_type: emp.employment_type as 'full_time' | 'part_time' | 'contract' | 'intern' | undefined,
        location: emp.location,
        cost_center: null,
        start_date: null,
        hire_date: null,
        probation_end_date: null,
        manager_id: null,
        role: 'employee' as const,
        division: emp.division_name ? {
          id: '',
          name: emp.division_name,
          created_at: '',
          updated_at: '',
          department_id: ''
        } : null,
        department: emp.department_name ? {
          id: '',
          name: emp.department_name,
          created_at: '',
          updated_at: '',
          organization_id: emp.organization_id
        } : null,
        profile: {
          id: '',
          user_id: emp.user_id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: '',
          avatar_url: null,
          phone_number: null,
          preferred_communication: null,
          created_at: '',
          updated_at: ''
        }
      }));

      return employees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !isDemoMode, // Only run query when not in demo mode
  });

  // Since we now have server-side filtering, we don't need client-side filtering
  // Just return the data directly
  const finalData = useMemo(() => {
    if (isDemoMode) {
      // Return demo data filtered
      if (!demoEmployeesResult.data) return [];
      
      let filtered = demoEmployeesResult.data;

      if (filters.division && filters.division !== 'all') {
        filtered = filtered.filter(emp => emp.division?.id === filters.division);
      }

      return filtered;
    }
    
    // For production data, server-side filtering is already applied
    return query.data || [];
  }, [isDemoMode, demoEmployeesResult.data, query.data, filters.division]);

  // Return appropriate result based on demo mode
  if (isDemoMode) {
    return {
      ...demoEmployeesResult,
      data: finalData as Employee[],
      totalCount: finalData.length,
    };
  }

  return {
    ...query,
    data: finalData as Employee[],
    totalCount: countQuery.data,
  };
};