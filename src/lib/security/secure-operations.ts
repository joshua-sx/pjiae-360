import { guardMultiTenantOperation } from '@/lib/auth/multi-tenant-guard';
import { logSecurityEvent } from './events';
import { handleTenancyError, extractErrorContext } from './tenancy-errors';

/**
 * Secure wrapper for all write operations to ensure tenancy isolation
 * This should be used for all mutations (INSERT, UPDATE, DELETE) in the frontend
 */

export interface SecureOperationOptions {
  requireOrganization?: boolean;
  allowDuringOnboarding?: boolean;
  skipLogging?: boolean;
}

/**
 * Wrap database mutations with security checks and audit logging
 */
export const secureWriteOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  options: SecureOperationOptions = {}
): Promise<T> => {
  const {
    requireOrganization = true,
    allowDuringOnboarding = false,
    skipLogging = false
  } = options;

  try {
    // Use the existing multi-tenant guard for session and organization validation
    const result = await guardMultiTenantOperation(
      operationName,
      operation,
      { requireOrganization, allowDuringOnboarding }
    );

    // Log successful operation (unless skipped)
    if (!skipLogging) {
      await logSecurityEvent('secure_write_operation_success', {
        operation: operationName,
        timestamp: new Date().toISOString()
      }, true);
    }

    return result;
  } catch (error: any) {
    // Extract context for comprehensive error logging
    const errorContext = extractErrorContext(error, operationName);
    
    // Handle tenancy-specific errors with user-friendly messages
    await handleTenancyError(error, operationName, errorContext);
    
    // Re-throw the error for the calling code to handle
    throw error;
  }
};

/**
 * Secure wrapper for read operations that need organization validation
 */
export const secureReadOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  options: SecureOperationOptions = {}
): Promise<T> => {
  try {
    const result = await guardMultiTenantOperation(
      operationName,
      operation,
      options
    );

    return result;
  } catch (error: any) {
    const errorContext = extractErrorContext(error, operationName);
    await handleTenancyError(error, operationName, errorContext);
    throw error;
  }
};

/**
 * Batch secure operations - useful for multiple related writes
 */
export const secureBatchOperation = async <T>(
  operationName: string,
  operations: (() => Promise<any>)[],
  options: SecureOperationOptions = {}
): Promise<T[]> => {
  return secureWriteOperation(
    `batch_${operationName}`,
    async () => {
      const results = await Promise.all(operations.map(op => op()));
      return results;
    },
    options
  );
};

/**
 * Quick helper for common Supabase mutation patterns
 */
export const secureSupabaseWrite = async <T>(
  tableName: string,
  operation: () => Promise<{ data: T; error: any }>,
  options: SecureOperationOptions = {}
): Promise<T> => {
  return secureWriteOperation(
    `${tableName}_write`,
    async () => {
      const { data, error } = await operation();
      if (error) throw error;
      return data;
    },
    options
  );
};

/**
 * Quick helper for common Supabase read patterns  
 */
export const secureSupabaseRead = async <T>(
  tableName: string,
  operation: () => Promise<{ data: T; error: any }>,
  options: SecureOperationOptions = {}
): Promise<T> => {
  return secureReadOperation(
    `${tableName}_read`,
    async () => {
      const { data, error } = await operation();
      if (error) throw error;
      return data;
    },
    options
  );
};