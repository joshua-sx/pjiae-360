/**
 * Centralized logging system with different levels and contexts
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  userId?: string;
  organizationId?: string;
  route?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: Date;
  error?: Error;
}

class Logger {
  private level: LogLevel = LogLevel.INFO;
  private isDev = import.meta.env?.NODE_ENV === 'development';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    
    if (this.isDev) {
      return `[${timestamp}] ${levelStr}: ${message}${context ? ` | Context: ${JSON.stringify(context)}` : ''}`;
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      error
    };

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, error);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, error);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, error);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, error);
        break;
    }

    // In production, you might want to send logs to external service
    if (!this.isDev && level >= LogLevel.WARN) {
      this.sendToExternalLogger(entry);
    }
  }

  private sendToExternalLogger(entry: LogEntry) {
    // TODO: Implement external logging service integration
    // e.g., Sentry, LogRocket, DataDog, etc.
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Specialized logging methods with backward compatibility
  auth = {
    debug: (message: string, context?: LogContext) => this.debug(message, { ...context, action: 'authentication' }),
    info: (message: string, context?: LogContext) => this.info(message, { ...context, action: 'authentication' }),
    error: (message: string, context?: LogContext, error?: Error) => this.error(message, { ...context, action: 'authentication' }, error)
  };

  authError(message: string, error?: Error, userId?: string) {
    this.error(message, { 
      action: 'authentication',
      userId 
    }, error);
  }

  apiError(message: string, error?: Error, endpoint?: string) {
    this.error(message, { 
      action: 'api_call',
      endpoint 
    }, error);
  }

  securityEvent(message: string, context?: LogContext) {
    this.warn(`[SECURITY] ${message}`, {
      ...context,
      action: 'security_event'
    });
  }

  performanceLog(message: string, duration: number, context?: LogContext) {
    this.info(`[PERFORMANCE] ${message} (${duration}ms)`, {
      ...context,
      action: 'performance',
      duration
    });
  }
}

export const logger = new Logger();

// Performance logging helper
export function withPerformanceLogging<T>(
  fn: () => T | Promise<T>,
  operationName: string,
  context?: LogContext
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.performanceLog(`${operationName} completed`, duration, context);
      resolve(result);
    } catch (error) {
      const duration = performance.now() - start;
      logger.performanceLog(`${operationName} failed`, duration, context);
      reject(error);
    }
  });
}