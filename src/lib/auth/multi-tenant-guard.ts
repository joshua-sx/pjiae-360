/**
 * Multi-tenant security guards and validation utilities
 */

import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security/events';
import { validateOrganizationIsolation } from './session-security';

export class MultiTenantViolationError extends Error {
  constructor(operation: string, details?: string) {
    super(`Multi-tenant violation detected for operation "${operation}". ${details || ''}`);
    this.name = 'MultiTenantViolationError';
  }
}

/**
 * Guards database operations to ensure multi-tenant isolation
 */
export async function guardMultiTenantOperation<T>(
  operation: string,
  dbOperation: () => Promise<T>,
  options: {
    requireOrganization?: boolean;
    allowDuringOnboarding?: boolean;
  } = {}
): Promise<T> {
  const { requireOrganization = true, allowDuringOnboarding = false } = options;

  try {
    // Validate session and organization context
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new MultiTenantViolationError(operation, 'No authenticated user');
    }

    // Check organization context if required
    if (requireOrganization) {
      const { data: orgId, error } = await supabase.rpc('get_current_user_org_id');
      
      if (error) {
        await logSecurityEvent('multi_tenant_guard_org_check_failed', {
          operation,
          userId: session.user.id,
          error: error.message
        }, false);
        throw new MultiTenantViolationError(operation, 'Failed to validate organization context');
      }

      if (!orgId && !allowDuringOnboarding) {
        await logSecurityEvent('multi_tenant_guard_no_org', {
          operation,
          userId: session.user.id
        }, false);
        throw new MultiTenantViolationError(operation, 'User not associated with any organization');
      }
    }

    // Validate organization isolation
    const isolationValid = await validateOrganizationIsolation(operation);
    if (!isolationValid && requireOrganization && !allowDuringOnboarding) {
      throw new MultiTenantViolationError(operation, 'Organization isolation validation failed');
    }

    // Execute the operation
    const result = await dbOperation();

    await logSecurityEvent('multi_tenant_operation_success', {
      operation,
      userId: session.user.id
    });

    return result;
  } catch (error) {
    if (error instanceof MultiTenantViolationError) {
      throw error;
    }

    await logSecurityEvent('multi_tenant_operation_error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);

    throw new MultiTenantViolationError(operation, `Unexpected error: ${error}`);
  }
}

/**
 * Validates that a user can only access data from their organization
 */
export async function validateDataAccessScope(
  tableName: string,
  recordId: string,
  userId?: string
): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return false;
    }

    const currentUserId = userId || session.user.id;
    const { data: userOrgId } = await supabase.rpc('get_current_user_org_id');

    // Special handling for different table types
    switch (tableName) {
      case 'employee_info':
        const { data: employee } = await supabase
          .from('employee_info')
          .select('organization_id, user_id')
          .eq('id', recordId)
          .single();
        
        return employee?.organization_id === userOrgId;

      case 'profiles':
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', recordId)
          .single();
        
        // Users can access their own profile or profiles in their org
        if (profile?.user_id === currentUserId) return true;
        
        const { data: profileEmployee } = await supabase
          .from('employee_info')
          .select('organization_id')
          .eq('user_id', profile?.user_id)
          .single();
        
        return profileEmployee?.organization_id === userOrgId;

      case 'organizations':
      case 'appraisal_cycles':
      case 'goals':
      case 'competencies':
      case 'departments':
      case 'divisions':
        // Tables with organization_id column
        const { data: orgRecord } = await supabase
          .from(tableName as any)
          .select('organization_id')
          .eq('id', recordId)
          .single();
        
        return (orgRecord as any)?.organization_id === userOrgId;

      default:
        // For tables without organization_id, check through relationships
        return true; // Default allow - should be handled by RLS policies
    }
  } catch (error) {
    await logSecurityEvent('data_access_scope_validation_failed', {
      tableName,
      recordId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return false;
  }
}

/**
 * Cross-organization access attempt detector
 */
export async function detectCrossOrgAccess(
  targetOrgId: string,
  operation: string
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: userOrgId } = await supabase.rpc('get_current_user_org_id');
    
    if (userOrgId && userOrgId !== targetOrgId) {
      await logSecurityEvent('cross_org_access_attempt', {
        operation,
        userId: session.user.id,
        userOrgId,
        targetOrgId
      }, false);

      // Use database function to log this security violation
      await supabase.rpc('log_cross_org_access_attempt', {
        _attempted_org_id: targetOrgId,
        _event_details: { operation }
      });

      throw new MultiTenantViolationError(operation, 'Cross-organization access denied');
    }
  } catch (error) {
    if (error instanceof MultiTenantViolationError) {
      throw error;
    }
    // Log but don't throw for logging errors
    console.error('Cross-org access detection failed:', error);
  }
}

/**
 * Role-based organization access validator
 */
export async function validateRoleBasedAccess(
  requiredRole: string,
  operation: string
): Promise<boolean> {
  try {
    return await guardMultiTenantOperation(
      `role_check_${operation}`,
      async () => {
        const { data: roles } = await supabase.rpc('get_current_user_roles');
        const hasRole = roles?.some((r: any) => r.role === requiredRole) || false;

        await logSecurityEvent('role_based_access_check', {
          operation,
          requiredRole,
          hasRole,
          userRoles: roles?.map((r: any) => r.role) || []
        });

        return hasRole;
      }
    );
  } catch (error) {
    await logSecurityEvent('role_based_access_check_failed', {
      operation,
      requiredRole,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return false;
  }
}

/**
 * Validates invitation token security
 */
export async function validateInvitationToken(token: string): Promise<{
  isValid: boolean;
  organizationId?: string;
  email?: string;
  error?: string;
}> {
  try {
    const { data: invitation, error } = await supabase
      .from('employee_invitations')
      .select('organization_id, email, expires_at, status')
      .eq('token', token)
      .single();

    if (error) {
      await logSecurityEvent('invitation_token_validation_failed', {
        token: token.substring(0, 8) + '...',
        error: error.message
      }, false);
      return { isValid: false, error: 'Invalid invitation token' };
    }

    if (!invitation) {
      await logSecurityEvent('invitation_token_not_found', {
        token: token.substring(0, 8) + '...'
      }, false);
      return { isValid: false, error: 'Invitation not found' };
    }

    if (invitation.status !== 'pending') {
      await logSecurityEvent('invitation_token_not_pending', {
        token: token.substring(0, 8) + '...',
        status: invitation.status
      }, false);
      return { isValid: false, error: 'Invitation is no longer pending' };
    }

    if (new Date(invitation.expires_at) <= new Date()) {
      await logSecurityEvent('invitation_token_expired', {
        token: token.substring(0, 8) + '...',
        expiresAt: invitation.expires_at
      }, false);
      return { isValid: false, error: 'Invitation has expired' };
    }

    await logSecurityEvent('invitation_token_validated', {
      token: token.substring(0, 8) + '...',
      organizationId: invitation.organization_id,
      email: invitation.email
    });

    return {
      isValid: true,
      organizationId: invitation.organization_id,
      email: invitation.email
    };
  } catch (error) {
    await logSecurityEvent('invitation_validation_error', {
      token: token.substring(0, 8) + '...',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, false);
    return { isValid: false, error: 'Validation failed' };
  }
}