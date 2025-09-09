// Debug logger for tracking app crashes and issues
class DebugLogger {
  private static instance: DebugLogger;
  private logs: string[] = [];
  private isEnabled = __DEV__;

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  log(component: string, message: string, data?: any) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${component}: ${message}`;
    
    console.log(logEntry, data || '');
    this.logs.push(logEntry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  error(component: string, error: Error | string, data?: any) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : error;
    const logEntry = `[${timestamp}] ERROR ${component}: ${errorMessage}`;
    
    console.error(logEntry, data || '');
    this.logs.push(logEntry);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

export const debugLogger = DebugLogger.getInstance();
