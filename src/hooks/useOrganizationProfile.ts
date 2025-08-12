import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OrganizationProfile {
  profileId: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  employeeId: string;
  jobTitle: string | null;
  departmentId: string | null;
  divisionId: string | null;
  managerId: string | null;
  hireDate: string | null;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationContext {
  departments: Array<{
    id: string;
    name: string;
    divisionId: string | null;
  }>;
  divisions: Array<{
    id: string;
    name: string;
  }>;
  managers: Array<{
    id: string;
    userId: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
    jobTitle: string | null;
    email: string;
  }>;
  roles: Array<{
    role: string;
  }>;
}

export interface OrganizationProfileData {
  profile: OrganizationProfile | null;
  context: OrganizationContext;
}

export function useOrganizationProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['organization-profile', user?.id],
    queryFn: async (): Promise<OrganizationProfileData> => {
      if (!user) {
        return {
          profile: null,
          context: {
            departments: [],
            divisions: [],
            managers: [],
            roles: [],
          },
        };
      }

      // Fetch all organization-scoped data using secure RPC functions
      const [profileRes, deptDivRes, managersRes, rolesRes] = await Promise.all([
        supabase.rpc('get_current_user_profile_data'),
        supabase.rpc('get_organization_departments_divisions'),
        supabase.rpc('get_organization_managers'),
        supabase.rpc('get_current_user_roles'),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (deptDivRes.error) throw deptDivRes.error;
      if (managersRes.error) throw managersRes.error;
      if (rolesRes.error) throw rolesRes.error;

      const profileData = profileRes.data?.[0];
      const profile: OrganizationProfile | null = profileData ? {
        profileId: profileData.profile_id || '',
        userId: profileData.user_id,
        email: profileData.email || user.email || '',
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        fullName: profileData.full_name,
        employeeId: profileData.employee_id || '',
        jobTitle: profileData.job_title,
        departmentId: profileData.department_id,
        divisionId: profileData.division_id,
        managerId: profileData.manager_id,
        hireDate: profileData.hire_date,
        status: profileData.status || 'pending',
        organizationId: profileData.organization_id || '',
        createdAt: profileData.created_at || '',
        updatedAt: profileData.updated_at || '',
      } : null;

      // Process departments and divisions
      const departments: OrganizationContext['departments'] = [];
      const divisions: OrganizationContext['divisions'] = [];
      const divisionMap = new Map<string, { id: string; name: string }>();

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
            divisionId: item.dept_division_id,
          });
        }
      });

      const managers: OrganizationContext['managers'] = (managersRes.data || []).map((manager) => ({
        id: manager.manager_id,
        userId: manager.user_id,
        firstName: manager.first_name,
        lastName: manager.last_name,
        fullName: manager.full_name,
        jobTitle: manager.job_title,
        email: manager.email,
      }));

      const roles: OrganizationContext['roles'] = (rolesRes.data || []).map((role) => ({
        role: role.role,
      }));

      return {
        profile,
        context: {
          departments,
          divisions,
          managers,
          roles,
        },
      };
    },
    enabled: !!user,
  });

  return {
    profile: query.data?.profile ?? null,
    context: query.data?.context ?? {
      departments: [],
      divisions: [],
      managers: [],
      roles: [],
    },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}