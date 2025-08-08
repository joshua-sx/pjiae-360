import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from './events';
import { sanitizeErrorMessage } from './errors';

// Organization context validation
export const validateOrganizationContext = async (requiredRole?: string): Promise<boolean> => {
  try {
    const { data: userRoles } = await supabase.rpc('get_current_user_roles');
    
    if (!userRoles || userRoles.length === 0) {
      await logSecurityEvent('unauthorized_access_attempt', {
        reason: 'no_roles_found'
      });
      return false;
    }
    
    if (requiredRole && !userRoles.some((r: any) => r.role === requiredRole)) {
      await logSecurityEvent('unauthorized_access_attempt', {
        reason: 'insufficient_role',
        required_role: requiredRole,
        user_roles: userRoles.map((r: any) => r.role)
      });
      return false;
    }
    
    return true;
  } catch (error) {
    await logSecurityEvent('validation_error', {
      error: sanitizeErrorMessage(error)
    });
    return false;
  }
};
