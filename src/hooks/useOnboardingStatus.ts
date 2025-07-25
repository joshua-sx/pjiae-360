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
        .select('onboarding_completed, onboarding_completed_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setOnboardingCompleted(data?.onboarding_completed || false);
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

      // Update onboarding completion status
      const { error: updateError } = await supabase
        .from('employee_info')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Assign admin role using secure database function with audit trail
      const { data: roleAssigned, error: roleError } = await supabase.rpc('assign_user_role', {
        _profile_id: profile.id,
        _role: 'admin',
        _reason: 'Organization setup - onboarding completion'
      });

      if (roleError) throw roleError;
      if (!roleAssigned) throw new Error('Failed to assign admin role');
      
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