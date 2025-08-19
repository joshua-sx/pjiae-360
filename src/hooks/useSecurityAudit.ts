import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/features/access-control/hooks/usePermissions';

export interface SecurityAuditEvent {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  event_details: any;
  ip_address: unknown;
  user_agent: unknown;
  success: boolean;
  created_at: string;
}

export function useSecurityAudit() {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = usePermissions();

  const fetchAuditLogs = async (limit = 100) => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (
    eventType: string,
    eventDetails: any,
    success = true
  ) => {
    try {
      // Use secure edge function for audit logging - consistent with app-wide approach
      const { error } = await supabase.functions.invoke('secure-audit-log', {
        body: {
          eventType,
          eventDetails: {
            ...eventDetails,
            source: 'security_audit_hook'
          },
          success
        }
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [isAdmin]);

  return {
    auditLogs,
    loading,
    fetchAuditLogs,
    logSecurityEvent,
    canViewAuditLogs: isAdmin
  };
}