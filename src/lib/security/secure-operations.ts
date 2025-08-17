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
  enableRateLimit?: boolean;
  maxOperationsPerMinute?: number;
  trackPerformance?: boolean;
}

// Rate limiting storage (in-memory for client-side)
const operationCounts = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (operationName: string, maxOps: number): boolean => {
  const now = Date.now();
  const key = `${operationName}_${Math.floor(now / 60000)}`; // Per minute buckets
  
  const current = operationCounts.get(key) || { count: 0, resetTime: now + 60000 };
  
  if (now > current.resetTime) {
    operationCounts.delete(key);
    return true;
  }
  
  if (current.count >= maxOps) {
    return false;
  }
  
  operationCounts.set(key, { ...current, count: current.count + 1 });
  return true;
};

/**
 * Wrap database mutations with security checks, rate limiting, and audit logging
 */
export const secureWriteOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  options: SecureOperationOptions = {}
): Promise<T> => {
  const {
    requireOrganization = true,
    allowDuringOnboarding = false,
    skipLogging = false,
    enableRateLimit = true,
    maxOperationsPerMinute = 60,
    trackPerformance = true
  } = options;

  const startTime = trackPerformance ? performance.now() : 0;
  
  try {
    // Rate limiting check
    if (enableRateLimit && !checkRateLimit(operationName, maxOperationsPerMinute)) {
      const error = new Error(`Rate limit exceeded for operation: ${operationName}`);
      await logSecurityEvent('rate_limit_exceeded', {
        operation: operationName,
        max_operations: maxOperationsPerMinute,
        timestamp: new Date().toISOString()
      }, false);
      throw error;
    }

    // Use the existing multi-tenant guard for session and organization validation
    const result = await guardMultiTenantOperation(
      operationName,
      operation,
      { requireOrganization, allowDuringOnboarding }
    );

    // Calculate performance metrics
    const duration = trackPerformance ? performance.now() - startTime : undefined;

    // Log successful operation (unless skipped)
    if (!skipLogging) {
      await logSecurityEvent('secure_write_operation_success', {
        operation: operationName,
        timestamp: new Date().toISOString(),
        ...(duration !== undefined && { duration_ms: Math.round(duration) })
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