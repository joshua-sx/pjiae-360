import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
}

export function useOnboardingStatus() {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOnboardingStatus = async () => {
    if (!user) {
      setOnboardingCompleted(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('employee_info')
        .select('status')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      // Use status to determine if onboarding is completed
      setOnboardingCompleted(data?.status === 'active');
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // First, get the user's profile to get profile_id and organization_id
      const { data: profile, error: profileError } = await supabase
        .from('employee_info')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      // Update status to active to mark onboarding as complete
      const { error: updateError } = await supabase
        .from('employee_info')
        .update({
          status: 'active'
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Create user role record manually since assign_user_role function doesn't exist
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
          organization_id: profile.organization_id
        });

      if (roleError) {
        console.error('Failed to assign admin role:', roleError);
        // Don't throw error for role assignment failure
      }
      
      setOnboardingCompleted(true);
      return { success: true };
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, [user]);

  return {
    onboardingCompleted,
    loading,
    markOnboardingComplete,
    refetch: fetchOnboardingStatus
  };
}