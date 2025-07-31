import { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/components/admin/employees/types";
import type { EmployeeFilters } from "@/stores/employeeStore";

export const fetchEmployees = async (
  filters: EmployeeFilters,
  limit = 100,
  offset = 0
): Promise<Employee[]> => {
  let employeeQuery = supabase
    .from("employee_info")
    .select(
      `id, job_title, status, created_at, user_id, division_id, department_id`
    )
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (filters.status && filters.status !== "all") {
    employeeQuery = employeeQuery.eq(
      "status",
      filters.status as "active" | "inactive" | "pending" | "invited"
    );
  }

  const { data: employeeData, error: employeeError } = await employeeQuery;
  if (employeeError) throw employeeError;
  if (!employeeData || employeeData.length === 0) return [];

  const userIds = employeeData.map((e) => e.user_id).filter(Boolean);
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, email, avatar_url")
    .in("user_id", userIds);
  if (profileError) throw profileError;

  const divisionIds = employeeData.map((e) => e.division_id).filter(Boolean);
  const { data: divisionData, error: divisionError } = await supabase
    .from("divisions")
    .select("id, name")
    .in("id", divisionIds);
  if (divisionError) throw divisionError;

  const departmentIds = employeeData.map((e) => e.department_id).filter(Boolean);
  const { data: departmentData, error: departmentError } = await supabase
    .from("departments")
    .select("id, name")
    .in("id", departmentIds);
  if (departmentError) throw departmentError;

  // ...rest of the transformation and return logic
};

  const userIds = employeeData.map((e) => e.user_id).filter(Boolean);
  const { data: profileData } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, email, avatar_url")
    .in("user_id", userIds);

  const divisionIds = employeeData.map((e) => e.division_id).filter(Boolean);
  const { data: divisionData } = await supabase
    .from("divisions")
    .select("id, name")
    .in("id", divisionIds);

  const departmentIds = employeeData.map((e) => e.department_id).filter(Boolean);
  const { data: departmentData } = await supabase
    .from("departments")
    .select("id, name")
    .in("id", departmentIds);

  const createEmployeeObject = (
    emp: any,
    profile?: any,
    division?: any,
    department?: any
  ): Employee => ({
    id: emp.id,
    job_title: emp.job_title,
    status: emp.status,
    created_at: emp.created_at,
    updated_at: emp.created_at, // Consider using actual updated_at if available
    user_id: emp.user_id,
    organization_id: emp.organization_id || "",
    department_id: emp.department_id,
    division_id: emp.division_id,
    employee_number: emp.employee_number || "",
    hire_date: emp.hire_date || "",
    manager_id: emp.manager_id || "",
    division: division
      ? {
          id: division.id,
          name: division.name,
          created_at: division.created_at || "",
          updated_at: division.updated_at || "",
          organization_id: division.organization_id || "",
        }
      : null,
    department: department
      ? {
          id: department.id,
          name: department.name,
          created_at: department.created_at || "",
          updated_at: department.updated_at || "",
          organization_id: department.organization_id || "",
          division_id: department.division_id || null,
        }
      : null,
    profile: profile
      ? {
          id: profile.id || "",
          user_id: profile.user_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at || "",
          updated_at: profile.updated_at || "",
        }
      : null,
  });

  return employeeData.map((emp) => {
    const profile = profileData?.find((p) => p.user_id === emp.user_id);
    const division = divisionData?.find((d) => d.id === emp.division_id);
    const department = departmentData?.find((d) => d.id === emp.department_id);
    return createEmployeeObject(emp, profile, division, department);
  });
};

export const prefetchEmployees = (
  queryClient: QueryClient,
  filters: EmployeeFilters
) =>
  queryClient.prefetchQuery({
    queryKey: ["employees", filters, 100, 0],
    queryFn: () => fetchEmployees(filters),
  });

const fetchAdminStats = async () => {
  const [
    { data: employees },
    { data: goals },
    { data: appraisals },
    { data: completedAppraisals },
  ] = await Promise.all([
    supabase.from("employee_info").select("id").eq("status", "active"),
    supabase.from("goals").select("id"),
    supabase.from("appraisals").select("id"),
    supabase.from("appraisals").select("id").eq("status", "completed"),
  ]);

  return {
    totalEmployees: employees?.length || 0,
    totalGoals: goals?.length || 0,
    totalAppraisals: appraisals?.length || 0,
    completedAppraisals: completedAppraisals?.length || 0,
  };
};

const fetchCycles = async () => {
  const { data, error } = await supabase
    .from("appraisal_cycles")
    .select("id, name, status")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchDivisions = async () => {
  const { data, error } = await supabase
    .from("divisions")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data || [];
};

const fetchAnalyticsCharts = async (
  cycle: string,
  division: string
) => {
  const { data: divisionData } = await supabase
    .from("divisions")
    .select(`id, name, employee_info(id, status)`);

  const { data: appraisalStatusData } = await supabase
    .from("appraisals")
    .select("status")
    .neq("status", "draft");

  const { data: goalsData } = await supabase
    .from("goals")
    .select("status, type")
    .neq("status", "draft");

  const divisionStats =
    divisionData?.map((division) => ({
      name: division.name,
      employees:
        division.employee_info?.filter((emp) => emp.status === "active").length ||
        0,
    })) || [];

  const statusCounts =
    appraisalStatusData?.reduce((acc: Record<string, number>, appraisal) => {
      acc[appraisal.status] = (acc[appraisal.status] || 0) + 1;
      return acc;
    }, {}) || {};

  const goalProgress =
    goalsData?.reduce((acc: Record<string, number>, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {}) || {};

  return {
    divisionStats,
    appraisalStatus: Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })),
    goalProgress: Object.entries(goalProgress).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })),
  };
};

export const prefetchReportsData = (queryClient: QueryClient) => {
  queryClient.prefetchQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  queryClient.prefetchQuery({ queryKey: ["cycles"], queryFn: fetchCycles });
  queryClient.prefetchQuery({ queryKey: ["divisions"], queryFn: fetchDivisions });
  queryClient.prefetchQuery({
    queryKey: ["analytics-charts", "current", "all"],
    queryFn: () => fetchAnalyticsCharts("current", "all"),
  });
};


