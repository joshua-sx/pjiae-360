/**
 * Secure data access utilities that enforce proper demo/production separation
 */

import { useDemoMode } from '@/contexts/DemoModeContext';
import { guardAgainstDemoMode } from '@/lib/demo-mode-guard';
import { validateOrganizationScope } from '@/lib/production-mode-guard';

/**
 * Wrapper for data hooks that ensures proper demo/production separation
 */
export function useSecureDataAccess() {
  const { isDemoMode } = useDemoMode();

  return {
    isDemoMode,
    
    /**
     * Validates that a database operation can proceed
     */
    async validateDatabaseAccess(operation: string): Promise<string | null> {
      if (isDemoMode) {
        guardAgainstDemoMode(operation);
        return null; // This line should never be reached
      }
      
      return await validateOrganizationScope(operation);
    },

    /**
     * Guards against demo mode violations
     */
    guardDemo(operation: string): void {
      if (isDemoMode) {
        guardAgainstDemoMode(operation);
      }
    }
  };
}

/**
 * Runtime validation to ensure data separation is maintained
 */
export function validateDataSeparation(): {
  violations: string[];
  isSecure: boolean;
} {
  const violations: string[] = [];
  
  // Check if demo mode is properly isolated
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';
  
  if (isDemoMode) {
    // In demo mode, we should never have real organization data
    if (localStorage.getItem('current-org-id')) {
      violations.push('Demo mode has real organization ID stored');
    }
    
    // Check for authentication tokens in demo mode
    const authTokens = Object.keys(localStorage).filter(key => 
      key.includes('supabase.auth') || key.includes('sb-')
    );
    
    if (authTokens.length > 0) {
      violations.push('Demo mode has authentication tokens present');
    }
  }
  
  return {
    violations,
    isSecure: violations.length === 0
  };
}