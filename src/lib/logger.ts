/**
 * Centralized logging system for the application
 * Allows control over log levels and can be disabled in production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

class Logger {
  private level: LogLevel;
  private enabled: boolean;

  constructor() {
    // In production, only show warnings and errors
    this.level =
      process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;
    this.enabled = true;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  debug(message: string, ...args: any[]) {
    if (this.enabled && this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.enabled && this.level <= LogLevel.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.enabled && this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.enabled && this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
