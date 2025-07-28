import { useQuery } from '@tanstack/react-query';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { generateDemoNotificationMetrics } from '@/lib/demoData';

interface NotificationMetrics {
  activeAlerts: number;
  emailsSent: number;
  inAppNotifications: number;
  scheduled: number;
}

export function useNotificationMetrics() {
  const { isDemoMode, demoRole } = useDemoMode();

  return useQuery({
    queryKey: ['notification-metrics', isDemoMode, demoRole],
    queryFn: async (): Promise<NotificationMetrics> => {
      if (isDemoMode) {
        return generateDemoNotificationMetrics(demoRole);
      }

      // In a real implementation, these would come from your notification system
      // For now, return placeholder values since we don't have a notifications table
      return {
        activeAlerts: 0,
        emailsSent: 0,
        inAppNotifications: 0,
        scheduled: 0
      };
    },
    enabled: true
  });
}