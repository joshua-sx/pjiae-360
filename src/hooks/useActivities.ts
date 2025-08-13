import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useDemoData } from '@/contexts/DemoDataContext';
import { guardAgainstDemoMode } from '@/lib/demo-mode-guard';

export interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  user_id?: string;
  employee_id?: string;
  metadata?: any;
  created_at: string;
  // Additional properties for dashboard display
  type?: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
    department?: string;
    role?: string;
  };
  timestamp?: Date;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  actionable?: boolean;
  actionLabel?: string;
  actionVariant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export function useActivities() {
  const { isDemoMode } = useDemoMode();
  const { getActivities } = useDemoData();

  return useQuery({
    queryKey: ['activities', isDemoMode],
    queryFn: async (): Promise<Activity[]> => {
      if (isDemoMode) {
        return getActivities();
      }

      guardAgainstDemoMode('activities.select');
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform database activities to match dashboard format
      return (data || []).map(activity => ({
        ...activity,
        type: activity.activity_type,
        timestamp: new Date(activity.created_at),
        priority: 'medium' as const,
        actionable: false,
      }));
    },
  });
}

export async function logActivity(activity: {
  title: string;
  description: string;
  activity_type: string;
  employee_id?: string;
  metadata?: Record<string, any>;
}) {
  guardAgainstDemoMode('logActivity');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: employeeInfo } = await supabase
    .from('employee_info')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!employeeInfo) return;

  await supabase.from('activities').insert({
    organization_id: employeeInfo.organization_id,
    user_id: user.id,
    ...activity,
  });
}