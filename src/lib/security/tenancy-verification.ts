/**
 * Comprehensive tenancy verification utilities
 * These functions verify that the tenancy model is properly enforced
 */

import { supabase } from '@/integrations/supabase/client';

export interface TenancyVerificationResult {
  isSecure: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * Verify that all user data is properly scoped to organizations
 */
export const verifyDataIsolation = async (): Promise<TenancyVerificationResult> => {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test 1: Verify user can only see their organization's data
    const { data: currentUserData } = await supabase.rpc('get_current_user_profile_data');
    if (!currentUserData?.[0]?.organization_id) {
      violations.push('Current user has no organization context');
    }

    // Test 2: Verify goals are organization-scoped
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('organization_id')
      .limit(5);

    if (goalsError) {
      warnings.push(`Goals query failed: ${goalsError.message}`);
    } else if (goals) {
      const orgIds = new Set(goals.map(g => g.organization_id));
      if (orgIds.size > 1) {
        violations.push('Goals from multiple organizations visible');
      }
    }

    // Test 3: Verify appraisals are organization-scoped
    const { data: appraisals, error: appraisalsError } = await supabase
      .from('appraisals')
      .select('organization_id')
      .limit(5);

    if (appraisalsError) {
      warnings.push(`Appraisals query failed: ${appraisalsError.message}`);
    } else if (appraisals) {
      const orgIds = new Set(appraisals.map(a => a.organization_id));
      if (orgIds.size > 1) {
        violations.push('Appraisals from multiple organizations visible');
      }
    }

    // Test 4: Verify employee_info is organization-scoped
    const { data: employees, error: employeesError } = await supabase
      .from('employee_info')
      .select('organization_id')
      .limit(10);

    if (employeesError) {
      warnings.push(`Employee info query failed: ${employeesError.message}`);
    } else if (employees) {
      const orgIds = new Set(employees.map(e => e.organization_id));
      if (orgIds.size > 1) {
        violations.push('Employee info from multiple organizations visible');
      }
    }

    // Test 5: Check for proper role scoping
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('organization_id')
      .limit(5);

    if (rolesError) {
      warnings.push(`Roles query failed: ${rolesError.message}`);
    } else if (roles) {
      const orgIds = new Set(roles.map(r => r.organization_id));
      if (orgIds.size > 1) {
        violations.push('User roles from multiple organizations visible');
      }
    }

    // Recommendations
    if (violations.length === 0) {
      recommendations.push('All data appears properly isolated');
    }
    recommendations.push('Regularly run this verification in production');
    recommendations.push('Monitor security audit logs for cross-org access attempts');

  } catch (error) {
    violations.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isSecure: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
};

/**
 * Verify that security audit logging is working properly
 */
export const verifyAuditLogging = async (): Promise<TenancyVerificationResult> => {
  const violations: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  try {
    // Test audit log insertion
    const testEventType = `verification_test_${Date.now()}`;
    
    // Try to log a test event
    const { error: logError } = await supabase.functions.invoke('secure-audit-log', {
      body: {
        eventType: testEventType,
        eventDetails: { test: true },
        success: true
      }
    });

    if (logError) {
      violations.push(`Audit logging failed: ${logError.message}`);
    } else {
      // Verify the log was created (admin only)
      const { data: auditLogs, error: readError } = await supabase
        .from('security_audit_log')
        .select('event_type')
        .eq('event_type', testEventType)
        .limit(1);

      if (readError) {
        warnings.push(`Could not verify audit log creation: ${readError.message}`);
      } else if (!auditLogs || auditLogs.length === 0) {
        violations.push('Test audit log was not created or not visible');
      }
    }

    recommendations.push('Monitor audit logs regularly for security events');
    recommendations.push('Set up alerts for suspicious patterns in audit logs');

  } catch (error) {
    violations.push(`Audit verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isSecure: violations.length === 0,
    violations,
    warnings,
    recommendations
  };
};

/**
 * Run comprehensive tenancy verification
 */
export const verifyTenancyModel = async (): Promise<TenancyVerificationResult> => {
  const dataResult = await verifyDataIsolation();
  const auditResult = await verifyAuditLogging();

  return {
    isSecure: dataResult.isSecure && auditResult.isSecure,
    violations: [...dataResult.violations, ...auditResult.violations],
    warnings: [...dataResult.warnings, ...auditResult.warnings],
    recommendations: [...dataResult.recommendations, ...auditResult.recommendations]
  };
};