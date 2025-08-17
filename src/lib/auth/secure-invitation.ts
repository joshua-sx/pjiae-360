import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security/events';

/**
 * Secure invitation token validation using server-side function
 */
export const validateInvitationTokenSecure = async (token: string) => {
  try {
    // Use the secure server-side function to validate invitation
    const { data, error } = await supabase.rpc('validate_invitation_token_secure', {
      _token: token
    });

    if (error) {
      await logSecurityEvent('invitation_validation_error', {
        error: error.message,
        token_provided: !!token
      }, false);
      return { isValid: false, error: 'Failed to validate invitation' };
    }

    const result = data?.[0];
    if (!result || !result.is_valid) {
      await logSecurityEvent('invalid_invitation_access_attempt', {
        token_provided: !!token
      }, false);
      return { isValid: false, error: 'Invalid or expired invitation' };
    }

    await logSecurityEvent('invitation_validated', {
      organization_id: result.organization_id,
      email: result.email
    }, true);

    return {
      isValid: true,
      organizationId: result.organization_id,
      email: result.email,
      employeeId: result.employee_id
    };
  } catch (error) {
    await logSecurityEvent('invitation_validation_exception', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return { isValid: false, error: 'System error during validation' };
  }
};

/**
 * Enhanced invitation claiming with security logging
 */
export const claimInvitationSecure = async (token: string, userId: string) => {
  try {
    // First validate the invitation
    const validation = await validateInvitationTokenSecure(token);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Use the secure server-side function to claim invitation
    const { data, error } = await supabase.rpc('claim_employee_invitation', {
      _token: token,
      _user_id: userId
    });

    if (error) {
      await logSecurityEvent('invitation_claim_failed', {
        error: error.message,
        user_id: userId,
        organization_id: validation.organizationId
      }, false);
      return { success: false, error: 'Failed to claim invitation' };
    }

    // Type the response data properly
    const response = data as { success?: boolean; error?: string; organization_id?: string } | null;
    
    if (!response?.success) {
      await logSecurityEvent('invitation_claim_rejected', {
        reason: response?.error || 'Unknown reason',
        user_id: userId,
        organization_id: validation.organizationId
      }, false);
      return { success: false, error: response?.error || 'Invitation claim failed' };
    }

    await logSecurityEvent('invitation_claimed_successfully', {
      user_id: userId,
      organization_id: response.organization_id,
      email: validation.email
    }, true);

    return {
      success: true,
      organizationId: response.organization_id
    };
  } catch (error) {
    await logSecurityEvent('invitation_claim_exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
      user_id: userId
    }, false);
    return { success: false, error: 'System error during invitation claim' };
  }
};