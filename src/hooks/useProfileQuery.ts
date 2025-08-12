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

      // Get consolidated profile data using secure RPC function
      const [profileRes, deptDivRes, rolesRes, managersRes] = await Promise.all([
        supabase.rpc('get_current_user_profile_data'),
        supabase.rpc('get_organization_departments_divisions'),
        supabase.rpc('get_current_user_roles'),
        supabase.rpc('get_organization_managers'),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (deptDivRes.error) throw deptDivRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (managersRes.error) throw managersRes.error;

      const profileData = profileRes.data?.[0];
      if (!profileData) {
        return {
          profile: null,
          departments: [],
          divisions: [],
          roles: [],
          managers: [],
        };
      }

      const combinedProfile: Profile = {
        id: profileData.employee_id || '',
        user_id: profileData.user_id,
        email: profileData.email || user.email || "",
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        name: profileData.full_name,
        job_title: profileData.job_title,
        department_id: profileData.department_id,
        division_id: profileData.division_id,
        manager_id: profileData.manager_id,
        role_id: null,
        avatar_url: null,
        hire_date: profileData.hire_date,
        status: profileData.status || 'pending',
        organization_id: profileData.organization_id || '',
        created_at: profileData.created_at || '',
        updated_at: profileData.updated_at || '',
      };

      // Process departments and divisions from consolidated query
      const departments: Department[] = [];
      const divisions: Division[] = [];
      const divisionMap = new Map<string, Division>();

      (deptDivRes.data || []).forEach((item) => {
        if (item.div_id && !divisionMap.has(item.div_id)) {
          const division = {
            id: item.div_id,
            name: item.div_name,
          };
          divisions.push(division);
          divisionMap.set(item.div_id, division);
        }

        if (item.dept_id) {
          departments.push({
            id: item.dept_id,
            name: item.dept_name,
            division_id: item.dept_division_id,
          });
        }
      });

      const managers: Manager[] = (managersRes.data || []).map((manager) => ({
        id: manager.manager_id,
        first_name: manager.first_name,
        last_name: manager.last_name,
        name: manager.full_name,
        job_title: manager.job_title,
      }));

      return {
        profile: combinedProfile,
        departments,
        divisions,
        roles: rolesRes.data?.map(r => ({ id: r.role, role: r.role, organization_id: '' })) || [],
        managers,
      };
    },
    enabled: !!user,
  });
};
