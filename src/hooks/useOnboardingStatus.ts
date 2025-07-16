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
        .from('profiles')
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setOnboardingCompleted(true);
      return { success: true };
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      return { success: false, error };
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