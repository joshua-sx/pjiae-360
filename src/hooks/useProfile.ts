import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Profile {
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

interface Department {
  id: string;
  name: string;
  division_id: string | null;
}

interface Division {
  id: string;
  name: string;
}

interface Role {
  id: string;
  role: string;
  organization_id: string;
}

interface Manager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  job_title: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Get employee info and profile data separately due to schema differences
      const [employeeRes, profileRes] = await Promise.all([
        supabase
          .from('employee_info')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', user.id)
          .single()
      ]);

      if (employeeRes.error) throw employeeRes.error;
      
      // Combine the data from both tables
      const combinedProfile: Profile = {
        ...employeeRes.data,
        first_name: profileRes.data?.first_name || null,
        last_name: profileRes.data?.last_name || null,
        email: profileRes.data?.email || user.email || '',
        name: profileRes.data ? `${profileRes.data.first_name || ''} ${profileRes.data.last_name || ''}`.trim() : null,
        role_id: null, // Not stored in employee_info
        avatar_url: null, // Would come from profiles table
      };

      setProfile(combinedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: "Unable to load your profile information."
      });
    }
  };

  const fetchOrganizationData = async () => {
    try {
      const [departmentsRes, divisionsRes, rolesRes, managersRes] = await Promise.all([
        supabase.from('departments').select('id, name, division_id'),
        supabase.from('divisions').select('id, name'),
        supabase.from('user_roles').select('id, role, organization_id'),
        supabase.from('employee_info').select('id, job_title').neq('user_id', user?.id || '')
      ]);

      if (departmentsRes.error) throw departmentsRes.error;
      if (divisionsRes.error) throw divisionsRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (managersRes.error) throw managersRes.error;

      setDepartments(departmentsRes.data || []);
      setDivisions(divisionsRes.data || []);
      setRoles(rolesRes.data || []);
      // Transform manager data to include name fields
      const managersWithNames = (managersRes.data || []).map(manager => ({
        ...manager,
        first_name: null,
        last_name: null,
        name: null,
      }));
      setManagers(managersWithNames);
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'role_id' | 'avatar_url'>>) => {
    if (!user || !profile) return;

    setUpdating(true);
    try {
      // Filter out fields that don't exist in employee_info table
      const { email, first_name, last_name, name, ...employeeUpdates } = updates;
      
      // Cast status to the correct type if it exists
      const updateData = { ...employeeUpdates, updated_at: new Date().toISOString() };
      if (updateData.status) {
        updateData.status = updateData.status as 'active' | 'inactive' | 'pending' | 'invited';
      }

      const { data, error } = await supabase
        .from('employee_info')
        .update(updateData as any) // Type assertion to handle status enum
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update profile with the returned data plus the existing profile fields
      const updatedProfile: Profile = {
        ...profile,
        ...data,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        name: profile.name,
        role_id: profile.role_id,
        avatar_url: profile.avatar_url,
      };

      setProfile(updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Unable to update your profile. Please try again."
      });
      return { data: null, error };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchProfile(), fetchOrganizationData()])
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    departments,
    divisions,
    roles,
    managers,
    loading,
    updating,
    updateProfile,
    refetch: () => {
      if (user) {
        setLoading(true);
        Promise.all([fetchProfile(), fetchOrganizationData()])
          .finally(() => setLoading(false));
      }
    }
  };
}