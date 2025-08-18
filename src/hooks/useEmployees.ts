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

  // Get total count
  const countQuery = useQuery({
    queryKey: ["employees-count", filters],
    queryFn: async (): Promise<number> => {
      let countQuery = supabase
        .from("employee_info")
        .select("*", { count: "exact", head: true });

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        countQuery = countQuery.eq('status', filters.status as 'active' | 'inactive' | 'pending' | 'invited');
      }

      const { count, error } = await countQuery;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !isDemoMode,
  });

  const query = useQuery({
    queryKey: ["employees", filters, limit, offset],
    queryFn: async (): Promise<Employee[]> => {
      // Fetch employees with basic info
      let employeeQuery = supabase
        .from("employee_info")
        .select(`
          id,
          job_title,
          status,
          created_at,
          updated_at,
          user_id,
          organization_id,
          division_id,
          department_id,
          manager_id,
          employee_number,
          phone_number,
          employment_type,
          location,
          cost_center,
          start_date,
          hire_date,
          probation_end_date
        `)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        employeeQuery = employeeQuery.eq('status', filters.status as 'active' | 'inactive' | 'pending' | 'invited');
      }

      const { data: employeeData, error: employeeError } = await employeeQuery;

      if (employeeError) {
        throw employeeError;
      }

      if (!employeeData || employeeData.length === 0) {
        return [];
      }

      // Fetch profiles for these employees
      const userIds = employeeData.map(emp => emp.user_id).filter(Boolean);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, avatar_url, phone_number, preferred_communication")
        .in("user_id", userIds);

      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }

      // Fetch divisions
      const divisionIds = employeeData.map(emp => emp.division_id).filter(Boolean);
      const { data: divisionData, error: divisionError } = await supabase
        .from("divisions")
        .select("id, name")
        .in("id", divisionIds);

      if (divisionError) {
        console.error("Division fetch error:", divisionError);
      }

      // Fetch departments
      const departmentIds = employeeData.map(emp => emp.department_id).filter(Boolean);
      const { data: departmentData, error: departmentError } = await supabase
        .from("departments")
        .select("id, name")
        .in("id", departmentIds);

      if (departmentError) {
        console.error("Department fetch error:", departmentError);
      }

      // Combine the data
      const employees: Employee[] = employeeData.map(emp => {
        const profile = profileData?.find(p => p.user_id === emp.user_id);
        const division = divisionData?.find(d => d.id === emp.division_id);
        const department = departmentData?.find(d => d.id === emp.department_id);

        return {
          id: emp.id,
          job_title: emp.job_title,
          status: emp.status,
          created_at: emp.created_at,
          updated_at: emp.updated_at,
          user_id: emp.user_id,
          organization_id: emp.organization_id || '',
          department_id: emp.department_id,
          division_id: emp.division_id,
          employee_number: emp.employee_number,
          phone_number: emp.phone_number,
          employment_type: emp.employment_type as 'full_time' | 'part_time' | 'contract' | 'intern' | undefined,
          location: emp.location,
          cost_center: emp.cost_center,
          start_date: emp.start_date,
          hire_date: emp.hire_date,
          probation_end_date: emp.probation_end_date,
          manager_id: emp.manager_id,
          role: 'employee' as const,
          division: division ? {
            id: division.id,
            name: division.name,
            created_at: '',
            updated_at: '',
            department_id: emp.department_id || ''
          } : null,
          department: department ? {
            id: department.id,
            name: department.name,
            created_at: '',
            updated_at: '',
            organization_id: emp.organization_id || ''
          } : null,
          profile: profile ? {
            id: '',
            user_id: profile.user_id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            phone_number: profile.phone_number,
            preferred_communication: profile.preferred_communication,
            created_at: '',
            updated_at: ''
          } : null
        };
      });

      return employees;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !isDemoMode, // Only run query when not in demo mode
  });

  // Filter data client-side for better UX
  const filteredData = useMemo(() => {
    if (isDemoMode) {
      // Return demo data filtered
      if (!demoEmployeesResult.data) return [];
      
      let filtered = demoEmployeesResult.data;

      if (filters.division && filters.division !== 'all') {
        filtered = filtered.filter(emp => emp.division?.id === filters.division);
      }

      return filtered;
    }
    
    if (!query.data) return [];
    
    let filtered = query.data;

    if (filters.division && filters.division !== 'all') {
      filtered = filtered.filter(emp => emp.division?.id === filters.division);
    }

    return filtered;
  }, [isDemoMode, demoEmployeesResult.data, query.data, filters]);

  // Return appropriate result based on demo mode
  if (isDemoMode) {
    return {
      ...demoEmployeesResult,
      data: filteredData as Employee[],
      totalCount: filteredData.length,
    };
  }

  return {
    ...query,
    data: filteredData as Employee[],
    totalCount: countQuery.data,
  };
};