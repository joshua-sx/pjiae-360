import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  job_title: string | null;
  department_id: string | null;
  division_id: string | null;
  manager_id: string | null;
  role_id: string | null;
  avatar_url: string | null;
  hire_date: string | null;
  status: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  division_id: string | null;
}

export interface Division {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  role: string;
  organization_id: string;
}

export interface Manager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  job_title: string | null;
}

interface ProfileQueryData {
  profile: Profile | null;
  departments: Department[];
  divisions: Division[];
  roles: Role[];
  managers: Manager[];
}

export const useProfileQuery = () => {
  const { user } = useAuth();

  return useQuery<ProfileQueryData>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          profile: null,
          departments: [],
          divisions: [],
          roles: [],
          managers: [],
        };
      }

      // Get employee info and profile data separately due to schema differences
      const [employeeRes, profileRes] = await Promise.all([
        supabase.from("employee_info").select("*").eq("user_id", user.id).single(),
        supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("user_id", user.id)
          .single(),
      ]);

      if (employeeRes.error) throw employeeRes.error;

      const combinedProfile: Profile = {
        ...(employeeRes.data as any),
        first_name: profileRes.data?.first_name || null,
        last_name: profileRes.data?.last_name || null,
        email: profileRes.data?.email || user.email || "",
        name: profileRes.data
          ? `${profileRes.data.first_name || ""} ${profileRes.data.last_name || ""}`.trim()
          : null,
        role_id: null,
        avatar_url: null,
      };

      const [departmentsRes, divisionsRes, rolesRes, managersRes] = await Promise.all([
        supabase.from("departments").select("id, name, division_id"),
        supabase.from("divisions").select("id, name"),
        supabase.from("user_roles").select("id, role, organization_id"),
        supabase.from("employee_info").select("id, job_title").neq("user_id", user.id),
      ]);

      if (departmentsRes.error) throw departmentsRes.error;
      if (divisionsRes.error) throw divisionsRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (managersRes.error) throw managersRes.error;

      const managersWithNames: Manager[] = (managersRes.data || []).map((manager) => ({
        ...manager,
        first_name: null,
        last_name: null,
        name: null,
      }));

      return {
        profile: combinedProfile,
        departments: (departmentsRes.data as Department[]) || [],
        divisions: (divisionsRes.data as Division[]) || [],
        roles: (rolesRes.data as Role[]) || [],
        managers: managersWithNames,
      };
    },
    enabled: !!user,
  });
};
