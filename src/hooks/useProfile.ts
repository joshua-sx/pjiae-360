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
  name: string;
  description: string | null;
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
      const { data, error } = await supabase
        .from('employee_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
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
        supabase.from('departments').select('*'),
        supabase.from('divisions').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('employee_info').select('id, first_name, last_name, name, job_title').neq('user_id', user?.id || '')
      ]);

      if (departmentsRes.error) throw departmentsRes.error;
      if (divisionsRes.error) throw divisionsRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (managersRes.error) throw managersRes.error;

      setDepartments(departmentsRes.data || []);
      setDivisions(divisionsRes.data || []);
      setRoles(rolesRes.data || []);
      setManagers(managersRes.data || []);
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('employee_info')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      return { data, error: null };
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