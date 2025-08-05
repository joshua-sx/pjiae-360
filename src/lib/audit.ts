import { supabase } from '@/integrations/supabase/client';

/**
 * Persist an audit event for appraisal actions
 */
export async function logAuditEvent(
  appraisalId: string,
  userId: string,
  action: string
): Promise<void> {
  try {
    await supabase.from('audit_log').insert({
      table_name: 'appraisals',
      record_id: appraisalId,
      action,
      user_id: userId
    });
  } catch (error) {
    // Fallback to console to avoid breaking the flow
    console.error('Failed to log audit event', error);
  }
}
