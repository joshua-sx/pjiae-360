import { logger } from '@/lib/logger';
import { sanitizeErrorMessage } from '@/lib/security';
import { toast } from 'sonner';

// Error types for better categorization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  IMPORT = 'import',
  SYSTEM = 'system',
  USER = 'user'
}

// Structured error interface
export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, any>;
  recoverable: boolean;
  retry?: () => Promise<void>;
}

// Error recovery strategies
export interface RecoveryStrategy {
  canRecover: (error: AppError) => boolean;
  recover: (error: AppError) => Promise<void>;
  description: string;
}

// Enhanced error class
export class EnhancedError extends Error {
  public readonly category: ErrorCategory;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly details: Record<string, any>;
  public readonly recoverable: boolean;
  public readonly retry?: () => Promise<void>;

  constructor(appError: AppError) {
    super(appError.message);
    this.name = 'EnhancedError';
    this.category = appError.category;
    this.code = appError.code;
    this.userMessage = appError.userMessage;
    this.details = appError.details || {};
    this.recoverable = appError.recoverable;
    this.retry = appError.retry;
  }
}

// Error factory for creating standardized errors
export class ErrorFactory {
  static authentication(code: string, message: string, userMessage?: string): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.AUTHENTICATION,
      code,
      message,
      userMessage: userMessage || 'Authentication failed. Please try again.',
      recoverable: true
    });
  }

  static authorization(code: string, message: string): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.AUTHORIZATION,
      code,
      message,
      userMessage: 'You do not have permission to perform this action.',
      recoverable: false
    });
  }

  static validation(code: string, message: string, details?: Record<string, any>): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.VALIDATION,
      code,
      message,
      userMessage: 'Please check your input and try again.',
      details,
      recoverable: true
    });
  }

  static network(code: string, message: string, retry?: () => Promise<void>): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.NETWORK,
      code,
      message,
      userMessage: 'Network error. Please check your connection and try again.',
      recoverable: true,
      retry
    });
  }

  static database(code: string, message: string, retry?: () => Promise<void>): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.DATABASE,
      code,
      message,
      userMessage: 'Database error. Please try again in a moment.',
      recoverable: true,
      retry
    });
  }

  static import(code: string, message: string, details?: Record<string, any>): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.IMPORT,
      code,
      message,
      userMessage: 'Import failed. Please check your data and try again.',
      details,
      recoverable: true
    });
  }

  static system(code: string, message: string): EnhancedError {
    return new EnhancedError({
      category: ErrorCategory.SYSTEM,
      code,
      message,
      userMessage: 'System error. Our team has been notified.',
      recoverable: false
    });
  }
}

// Recovery strategies
export const recoveryStrategies: RecoveryStrategy[] = [
  {
    canRecover: (error) => error.category === ErrorCategory.NETWORK && !!error.retry,
    recover: async (error) => {
      if (error.retry) {
        await error.retry();
      }
    },
    description: 'Retry network operation'
  },
  {
    canRecover: (error) => error.category === ErrorCategory.DATABASE && !!error.retry,
    recover: async (error) => {
      if (error.retry) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
        await error.retry();
      }
    },
    description: 'Retry database operation'
  },
  {
    canRecover: (error) => error.category === ErrorCategory.AUTHENTICATION,
    recover: async () => {
      // Clear auth state and redirect to login
      localStorage.removeItem('sb-auth-token');
      window.location.href = '/log-in';
    },
    description: 'Redirect to login'
  }
];

// Error handler with recovery options
export class ErrorHandler {
  private static instance: ErrorHandler;
  private recoveryStrategies: RecoveryStrategy[] = recoveryStrategies;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle error with recovery options
  async handleError(error: Error | EnhancedError, context?: string): Promise<void> {
    const enhancedError = error instanceof EnhancedError ? error : this.convertToEnhancedError(error);
    
    // Log error
    this.logError(enhancedError, context);
    
    // Show user notification
    this.showUserNotification(enhancedError);
    
    // Attempt recovery if possible
    if (enhancedError.recoverable) {
      await this.attemptRecovery(enhancedError);
    }
  }

  // Convert regular error to enhanced error
  private convertToEnhancedError(error: Error): EnhancedError {
    // Try to categorize based on error message
    if (error.message.includes('auth') || error.message.includes('login')) {
      return ErrorFactory.authentication('UNKNOWN_AUTH_ERROR', error.message);
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorFactory.network('UNKNOWN_NETWORK_ERROR', error.message);
    }
    
    if (error.message.includes('database') || error.message.includes('sql')) {
      return ErrorFactory.database('UNKNOWN_DB_ERROR', error.message);
    }
    
    return ErrorFactory.system('UNKNOWN_ERROR', error.message);
  }

  // Log error with context
  private logError(error: EnhancedError, context?: string): void {
    logger.auth.error('Enhanced error occurred', {
      category: error.category,
      code: error.code,
      message: error.message,
      context,
      details: error.details,
      recoverable: error.recoverable,
      stack: error.stack
    });
  }

  // Show user-friendly notification
  private showUserNotification(error: EnhancedError): void {
    const hasRecovery = this.canRecover(error);
    
    toast.error(error.userMessage, {
      description: hasRecovery ? 'Attempting to recover automatically...' : 'Please contact support if this continues.',
      duration: hasRecovery ? 3000 : 5000,
      action: error.retry ? {
        label: 'Retry',
        onClick: error.retry
      } : undefined
    });
  }

  // Check if error can be recovered
  private canRecover(error: EnhancedError): boolean {
    return this.recoveryStrategies.some(strategy => strategy.canRecover(error));
  }

  // Attempt automatic recovery
  private async attemptRecovery(error: EnhancedError): Promise<void> {
    const strategy = this.recoveryStrategies.find(s => s.canRecover(error));
    
    if (strategy) {
      try {
        logger.auth.info('Attempting error recovery', { 
          strategy: strategy.description,
          errorCode: error.code 
        });
        
        await strategy.recover(error);
        
        toast.success('Issue resolved automatically');
        logger.auth.info('Error recovery successful', { errorCode: error.code });
      } catch (recoveryError) {
        logger.auth.error('Error recovery failed', { 
          originalError: error.code,
          recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown'
        });
        
        toast.error('Automatic recovery failed. Please try again manually.');
      }
    }
  }

  // Add custom recovery strategy
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }
}

// Global error boundary for async operations
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      await ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        context
      );
      throw error; // Re-throw for component error boundaries
    }
  };
}

// Retry wrapper with exponential backoff
export async function withRetryAndErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    context?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, context } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries - 1) {
        await ErrorHandler.getInstance().handleError(lastError, context);
        throw lastError;
      }
      
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      logger.auth.debug('Operation failed, retrying', { 
        attempt: attempt + 1, 
        maxRetries, 
        delay,
        error: lastError.message 
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();