interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

type LogLevelKey = keyof LogLevel;

interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private currentLevel: number;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.currentLevel = this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;
  }

  private shouldLog(level: number): boolean {
    return level <= this.currentLevel;
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'api_key', 'secret', 'credentials'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  private formatMessage(level: LogLevelKey, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context.component || 'App'}${context.action ? `:${context.action}` : ''}]` : '';
    return `[${timestamp}] ${level}${contextStr}: ${message}`;
  }

  error(message: string, error?: any, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.ERROR)) return;

    const formattedMessage = this.formatMessage('ERROR', message, context);
    const sanitizedError = error ? this.sanitizeData(error) : undefined;

    console.error(formattedMessage, sanitizedError);

    // In production, you might want to send errors to a logging service
    if (!this.isDevelopment && error) {
      // Example: Send to error tracking service
      // this.sendToErrorService(formattedMessage, sanitizedError, context);
    }
  }

  warn(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.WARN)) return;

    const formattedMessage = this.formatMessage('WARN', message, context);
    const sanitizedData = data ? this.sanitizeData(data) : undefined;

    console.warn(formattedMessage, sanitizedData);
  }

  info(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.INFO)) return;

    const formattedMessage = this.formatMessage('INFO', message, context);
    const sanitizedData = data ? this.sanitizeData(data) : undefined;

    if (this.isDevelopment) {
      console.info(formattedMessage, sanitizedData);
    }
  }

  debug(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LOG_LEVELS.DEBUG)) return;

    const formattedMessage = this.formatMessage('DEBUG', message, context);
    const sanitizedData = data ? this.sanitizeData(data) : undefined;

    if (this.isDevelopment) {
      console.debug(formattedMessage, sanitizedData);
    }
  }

  // Convenience methods for specific contexts
  auth = {
    info: (message: string, data?: any) => 
      this.info(message, data, { component: 'Auth' }),
    error: (message: string, error?: any) => 
      this.error(message, error, { component: 'Auth' }),
    debug: (message: string, data?: any) => 
      this.debug(message, data, { component: 'Auth' }),
  };

  onboarding = {
    info: (message: string, data?: any) => 
      this.info(message, data, { component: 'Onboarding' }),
    error: (message: string, error?: any) => 
      this.error(message, error, { component: 'Onboarding' }),
    debug: (message: string, data?: any) => 
      this.debug(message, data, { component: 'Onboarding' }),
  };

  admin = {
    info: (message: string, data?: any) => 
      this.info(message, data, { component: 'Admin' }),
    error: (message: string, error?: any) => 
      this.error(message, error, { component: 'Admin' }),
    debug: (message: string, data?: any) => 
      this.debug(message, data, { component: 'Admin' }),
  };
}

export const logger = new Logger();