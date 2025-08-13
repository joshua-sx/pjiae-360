import { useDemoMode } from '@/contexts/DemoModeContext';

export class DemoModeViolationError extends Error {
  constructor(operation: string) {
    super(`Attempted database operation "${operation}" while in demo mode. This is not allowed.`);
    this.name = 'DemoModeViolationError';
  }
}

/**
 * Throws an error if in demo mode and attempting a database operation
 */
export function guardAgainstDemoMode(operation: string) {
  // We can't use hooks here, so we check localStorage directly
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';
  
  if (isDemoMode) {
    console.error(`🚨 DEMO MODE VIOLATION: Attempted ${operation} while in demo mode`);
    throw new DemoModeViolationError(operation);
  }
}

/**
 * Wrapper for supabase operations that prevents execution in demo mode
 */
export function withDemoGuard<T extends (...args: any[]) => any>(
  operation: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    guardAgainstDemoMode(operationName);
    return operation(...args);
  }) as T;
}

/**
 * Hook to check if we're in demo mode and throw error for database operations
 */
export function useDemoGuard() {
  const { isDemoMode } = useDemoMode();
  
  return {
    guardDatabaseOperation: (operation: string) => {
      if (isDemoMode) {
        throw new DemoModeViolationError(operation);
      }
    },
    isDemoMode
  };
}