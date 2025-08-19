import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

export interface SecurityEventStats {
  event_type: string;
  total_count: number;
  success_count: number;
  failure_count: number;
  last_occurrence: string;
}

export interface SuspiciousActivity {
  user_id: string | null;
  ip_address: string | null;
  failed_attempts: number;
  event_types: string[];
  first_attempt: string;
  last_attempt: string;
}

export interface SecurityMetrics {
  totalEvents: number;
  totalFailures: number;
  failureRate: number;
  suspiciousActivityCount: number;
  eventTypes: number;
}

export function useSecurityAnalytics(hoursBack: number = 24) {
  const { isAdmin } = usePermissions();
  const [eventStats, setEventStats] = useState<SecurityEventStats[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch security event statistics
      const { data: stats, error: statsError } = await supabase
        .rpc('get_security_event_stats', { hours_back: hoursBack });

      if (statsError) {
        throw new Error(`Failed to fetch security stats: ${statsError.message}`);
      }

      // Fetch suspicious activity
      const { data: suspicious, error: suspiciousError } = await supabase
        .rpc('detect_suspicious_activity', { hours_back: Math.min(hoursBack, 24) });

      if (suspiciousError) {
        throw new Error(`Failed to fetch suspicious activity: ${suspiciousError.message}`);
      }

      setEventStats(stats || []);
      // Type assertion to handle unknown IP address type from database
      setSuspiciousActivity((suspicious || []).map(activity => ({
        ...activity,
        ip_address: activity.ip_address?.toString() || null
      })));
    } catch (err) {
      console.error('Security analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityMetrics = (): SecurityMetrics => {
    const totalEvents = eventStats.reduce((sum, stat) => sum + stat.total_count, 0);
    const totalFailures = eventStats.reduce((sum, stat) => sum + stat.failure_count, 0);
    const failureRate = totalEvents > 0 ? (totalFailures / totalEvents) * 100 : 0;

    return {
      totalEvents,
      totalFailures,
      failureRate: parseFloat(failureRate.toFixed(1)),
      suspiciousActivityCount: suspiciousActivity.length,
      eventTypes: eventStats.length
    };
  };

  const getTopSecurityEvents = (limit: number = 5) => {
    return eventStats
      .sort((a, b) => b.total_count - a.total_count)
      .slice(0, limit);
  };

  const getRecentFailures = () => {
    return eventStats.filter(event => event.failure_count > 0);
  };

  useEffect(() => {
    fetchSecurityData();
  }, [isAdmin, hoursBack]);

  return {
    eventStats,
    suspiciousActivity,
    loading,
    error,
    metrics: getSecurityMetrics(),
    topEvents: getTopSecurityEvents(),
    recentFailures: getRecentFailures(),
    refetch: fetchSecurityData,
    canViewAnalytics: isAdmin
  };
}