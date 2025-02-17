export interface ErrorInfo {
  message: string;
  stack?: string;
  type: string;
  timestamp: number;
  context?: {
    url: string;
    userAgent: string;
    platform: string;
    component?: string;
    action?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
  handled: boolean;
}

export interface ErrorTrackerOptions {
  enabled?: boolean;
  captureUnhandled?: boolean;
  ignorePatterns?: RegExp[];
  maxErrors?: number;
  reportingEndpoint?: string;
  reportingInterval?: number;
  contextProvider?: () => Record<string, any>;
  onError?: (error: ErrorInfo) => void;
}

export class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private options: Required<ErrorTrackerOptions>;
  private reportingTimer: number | null = null;
  private isClient: boolean;

  constructor(options: ErrorTrackerOptions = {}) {
    this.isClient = typeof window !== 'undefined';
    
    this.options = {
      enabled: true,
      captureUnhandled: true,
      ignorePatterns: [],
      maxErrors: 100,
      reportingEndpoint: '',
      reportingInterval: 5000,
      contextProvider: () => ({}),
      onError: () => {},
      ...options
    };

    if (this.isClient && this.options.enabled) {
      this.setupErrorHandlers();
    }
  }

  // 手动捕获错误
  captureError(error: Error | string, metadata?: Record<string, any>): void {
    if (!this.options.enabled) return;

    const errorInfo = this.createErrorInfo(error, metadata, true);
    if (this.shouldCaptureError(errorInfo)) {
      this.processError(errorInfo);
    }
  }

  // 获取错误历史
  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // 清除错误历史
  clearErrors(): void {
    this.errors = [];
  }

  // 启动错误追踪
  start(): void {
    if (!this.isClient || !this.options.enabled) return;
    
    this.reportingTimer = window.setInterval(
      () => this.reportErrors(),
      this.options.reportingInterval
    );
  }

  // 停止错误追踪
  stop(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
      this.reportingTimer = null;
    }
  }

  private setupErrorHandlers(): void {
    if (this.options.captureUnhandled) {
      // 捕获未处理的错误
      window.addEventListener('error', (event) => {
        this.handleUnhandledError(event);
      });

      // 捕获未处理的Promise错误
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledRejection(event);
      });
    }
  }

  private handleUnhandledError(event: ErrorEvent): void {
    const errorInfo = this.createErrorInfo(event.error || event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, false);

    if (this.shouldCaptureError(errorInfo)) {
      this.processError(errorInfo);
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const errorInfo = this.createErrorInfo(
      event.reason || 'Unhandled Promise Rejection',
      {},
      false
    );

    if (this.shouldCaptureError(errorInfo)) {
      this.processError(errorInfo);
    }
  }

  private createErrorInfo(
    error: Error | string,
    metadata?: Record<string, any>,
    handled: boolean = true
  ): ErrorInfo {
    const isError = error instanceof Error;

    return {
      message: isError ? error.message : String(error),
      stack: isError ? error.stack : undefined,
      type: isError ? error.name : 'Error',
      timestamp: Date.now(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        ...this.options.contextProvider()
      },
      metadata,
      severity: 'error',
      handled
    };
  }

  private shouldCaptureError(error: ErrorInfo): boolean {
    return !this.options.ignorePatterns.some(pattern => 
      pattern.test(error.message)
    );
  }

  private processError(error: ErrorInfo): void {
    this.errors.push(error);
    if (this.errors.length > this.options.maxErrors) {
      this.errors.shift();
    }

    this.options.onError(error);
  }

  private async reportErrors(): Promise<void> {
    if (!this.options.reportingEndpoint || this.errors.length === 0) return;

    try {
      await fetch(this.options.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: this.errors,
          timestamp: Date.now()
        })
      });

      // 成功上报后清除已上报的错误
      this.clearErrors();
    } catch (error) {
      console.error('Failed to report errors:', error);
    }
  }
} 