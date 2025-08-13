/**
 * Production mode validation utilities
 * Ensures that production operations are properly scoped and secured
 */

import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from '@/contexts/DemoModeContext';

export class ProductionModeViolationError extends Error {
  constructor(operation: string, reason: string) {
    super(`Production operation "${operation}" violated security constraints: ${reason}`);
    this.name = 'ProductionModeViolationError';
  }
}

/**
 * Validates that a database operation is properly scoped to the current user's organization
 */
export async function validateOrganizationScope(operation: string): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new ProductionModeViolationError(operation, 'User not authenticated');
  }

  const { data: employeeInfo, error: employeeError } = await supabase
    .from('employee_info')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (employeeError || !employeeInfo?.organization_id) {
    throw new ProductionModeViolationError(operation, 'User not associated with any organization');
  }

  return employeeInfo.organization_id;
}

/**
 * Ensures that an operation cannot affect data outside the user's organization
 */
export async function guardOrganizationData(
  operation: string,
  dataOrgId?: string
): Promise<void> {
  const userOrgId = await validateOrganizationScope(operation);
  
  if (dataOrgId && dataOrgId !== userOrgId) {
    throw new ProductionModeViolationError(
      operation, 
      `Attempted to access data from organization ${dataOrgId} while user belongs to ${userOrgId}`
    );
  }
}

/**
 * Validates that import operations only affect the user's organization
 */
export async function validateImportScope(operation: string): Promise<string> {
  const orgId = await validateOrganizationScope(operation);
  
  // Additional validation for import operations
  const { data: orgData, error } = await supabase
    .from('organizations')
    .select('id, status')
    .eq('id', orgId)
    .single();

  if (error || !orgData) {
    throw new ProductionModeViolationError(operation, 'Organization not found or inaccessible');
  }

  if (orgData.status !== 'active') {
    throw new ProductionModeViolationError(operation, 'Organization is not active');
  }

  return orgId;
}

/**
 * Ensures that production operations are not called in demo mode
 */
export function ensureProductionMode(operation: string): void {
  // This is a runtime check that should only be used in production contexts
  // In demo mode, operations should be handled by demo data providers
  if (typeof window !== 'undefined') {
    const demoMode = localStorage.getItem('demo-mode');
    if (demoMode === 'true') {
      throw new ProductionModeViolationError(operation, 'Production database operations are not allowed in demo mode');
    }
  }
}