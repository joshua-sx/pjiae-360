import { useMemo } from 'react';
import { AppRole } from '@/features/access-control/hooks/usePermissions';
import { generateDemoActivities } from '@/lib/demoData';
import { Activity } from '@/hooks/useActivities';

export function useDemoActivities(role: AppRole): Activity[] {
  return useMemo(() => {
    return generateDemoActivities(role);
  }, [role]);
}