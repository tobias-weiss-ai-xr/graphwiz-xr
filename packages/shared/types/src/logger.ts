/**
 * Logger Utility for GraphWiz-XR
 *
 * Provides centralized logging with environment-based log levels.
 * Reduces console.log pollution in production.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (import.meta.env?.DEV == 'true') {
      return true;
    }

    // In production, only log warnings and errors
    if (import.meta.env?.MODE === 'production') {
      return level === LogLevel.WARN || level === LogLevel.ERROR;
    }

    // Default: log everything
    return true;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, data), data);
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, data), data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, data), data);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, error), error);
    }
  }
}

/**
 * Create a logger instance for a specific context
 *
 * @example
 * ```ts
 * const logger = createLogger('MyComponent');
 * logger.info('Component mounted');
 * logger.debug('State updated', { state: 'ready' });
 * logger.error('Failed to fetch data', error);
 * ```
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Default logger for quick use
 */
export const defaultLogger = createLogger('App');
