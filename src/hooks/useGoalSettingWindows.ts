import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GoalSettingWindow {
  id: string;
  cycle_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface GoalSettingWindowWithCycle extends GoalSettingWindow {
  cycle: {
    id: string;
    name: string;
    year: number;
  } | null;
}

export const useGoalSettingWindows = () => {
  const { user } = useAuth();
  const [windows, setWindows] = useState<GoalSettingWindowWithCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoalSettingWindows = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('goal_setting_windows')
        .select(`
          *,
          cycle:appraisal_cycles(
            id,
            name,
            year
          )
        `)
        .order('start_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(window => ({
        ...window,
        cycle: Array.isArray(window.cycle) ? window.cycle[0] || null : window.cycle
      }));

      setWindows(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goal setting windows';
      setError(errorMessage);
      console.error('Error fetching goal setting windows:', err);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalSettingWindows();
  }, [user]);

  const refetch = () => {
    fetchGoalSettingWindows();
  };

  return {
    windows,
    isLoading,
    error,
    refetch
  };
};

export const useGoalSettingWindowsByCycle = (cycleId?: string) => {
  const { user } = useAuth();
  const [windows, setWindows] = useState<GoalSettingWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWindowsByCycle = async () => {
    if (!user || !cycleId) {
      setWindows([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('goal_setting_windows')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('start_date', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setWindows(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goal setting windows';
      setError(errorMessage);
      console.error('Error fetching goal setting windows by cycle:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWindowsByCycle();
  }, [user, cycleId]);

  const refetch = () => {
    fetchWindowsByCycle();
  };

  return {
    windows,
    isLoading,
    error,
    refetch
  };
};