import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/components/admin/employees/types";
import { useEmployeeStore } from "@/stores/employeeStore";
import { useMemo } from "react";

interface UseEmployeesOptions {
  limit?: number;
  offset?: number;
}

export const useEmployees = (options: UseEmployeesOptions = {}) => {
  const { filters } = useEmployeeStore();
  const { limit = 50, offset = 0 } = options;

  const query = useQuery({
    queryKey: ["employees", filters, limit, offset],
    queryFn: async (): Promise<Employee[]> => {
    let query = supabase
      .from("employee_info")
      .select(`
        id,
        first_name,
        last_name,
        email,
        job_title,
        status,
        created_at,
        role:roles(id, name),
        division:divisions(id, name, code),
        department:departments(id, name, code),
        manager:employee_info!profiles_manager_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
        .order("first_name", { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply search filter
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        manager: Array.isArray(item.manager) ? item.manager[0] : item.manager
      })) as Employee[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter data client-side for better UX
  const filteredData = useMemo(() => {
    if (!query.data) return [];
    
    let filtered = query.data;

    // Additional client-side filtering for better UX
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(emp => emp.role?.id === filters.role);
    }

    if (filters.division && filters.division !== 'all') {
      filtered = filtered.filter(emp => emp.division?.id === filters.division);
    }

    return filtered;
  }, [query.data, filters]);

  return {
    ...query,
    data: filteredData,
  };
};