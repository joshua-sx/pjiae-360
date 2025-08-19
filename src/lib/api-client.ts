
/**
 * Centralized API client with error handling, retries, and logging
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { performanceMonitor } from './performance-monitor';

export interface ApiOptions {
  retries?: number;
  timeout?: number;
  abortSignal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private defaultOptions: Required<Omit<ApiOptions, 'abortSignal'>> = {
    retries: 3,
    timeout: 30000,
  };

  async withRetry<T>(
    operation: () => Promise<T>,
    options: ApiOptions = {}
  ): Promise<T> {
    const { retries, timeout } = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        const result = await Promise.race([
          operation(),
          timeoutPromise
        ]);

        if (attempt > 0) {
          logger.info(`Operation succeeded on attempt ${attempt + 1}`);
        }

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === retries) {
          logger.error(`Operation failed after ${retries + 1} attempts`, {
            action: 'api_retry_exhausted'
          }, lastError);
          break;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.warn(`Operation failed on attempt ${attempt + 1}, retrying in ${delay}ms`, {
          action: 'api_retry'
        }, lastError);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new ApiError(
      `Operation failed after ${retries + 1} attempts: ${lastError.message}`,
      undefined,
      lastError
    );
  }

  // Supabase query wrapper with error handling and performance tracking
  async query<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context?: { operation: string; table?: string }
  ): Promise<T> {
    const queryName = context ? `${context.operation}_${context.table || 'unknown'}` : 'unknown_query';
    
    return performanceMonitor.trackQuery(queryName, async () => {
      const startTime = performance.now();
      
      try {
        const result = await this.withRetry(queryFn);
        
        if (result.error) {
          throw new ApiError(
            result.error.message || 'Database query failed',
            result.error.code,
            result.error
          );
        }

        const duration = performance.now() - startTime;
        logger.performanceLog(
          `Database query completed: ${context?.operation || 'unknown'}`,
          duration,
          { table: context?.table }
        );

        return result.data as T;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error(
          `Database query failed: ${context?.operation || 'unknown'}`,
          {
            table: context?.table,
            duration
          },
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    }, {
      table: context?.table,
      operation: context?.operation
    });
  }

  // Edge function wrapper with error handling and performance tracking
  async callFunction<T = any>(
    functionName: string,
    payload?: any,
    options?: ApiOptions
  ): Promise<T> {
    const context = {
      action: 'edge_function_call',
      function: functionName
    };

    return performanceMonitor.trackQuery(`edge_function_${functionName}`, async () => {
      try {
        const result = await this.withRetry(async () => {
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: payload
          });

          if (error) {
            throw new ApiError(
              `Edge function ${functionName} failed: ${error.message}`,
              undefined,
              error
            );
          }

          return data;
        }, options);

        logger.info(`Edge function call succeeded: ${functionName}`, context);
        return result;
      } catch (error) {
        logger.error(`Edge function call failed: ${functionName}`, context, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    }, {
      functionName,
      payload: payload ? Object.keys(payload) : undefined
    });
  }
}

export const apiClient = new ApiClient();

// Convenience methods for common operations with performance tracking
export const db = {
  select: <T>(query: () => Promise<{ data: T | null; error: any }>, table?: string) =>
    apiClient.query(query, { operation: 'SELECT', table }),
    
  insert: <T>(query: () => Promise<{ data: T | null; error: any }>, table?: string) =>
    apiClient.query(query, { operation: 'INSERT', table }),
    
  update: <T>(query: () => Promise<{ data: T | null; error: any }>, table?: string) =>
    apiClient.query(query, { operation: 'UPDATE', table }),
    
  delete: <T>(query: () => Promise<{ data: T | null; error: any }>, table?: string) =>
    apiClient.query(query, { operation: 'DELETE', table }),
    
  rpc: <T>(query: () => Promise<{ data: T | null; error: any }>, functionName?: string) =>
    apiClient.query(query, { operation: 'RPC', table: functionName }),
};
