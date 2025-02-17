export interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  timing: {
    [key: string]: number;
  };
  resources: {
    name: string;
    duration: number;
    size: number;
    type: string;
  }[];
  errors: {
    message: string;
    stack?: string;
    timestamp: number;
  }[];
}

export interface MonitorOptions {
  sampleInterval?: number;
  maxSamples?: number;
  enableMemoryMonitoring?: boolean;
  enableResourceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  reportingEndpoint?: string;
  enabled?: boolean;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private options: Required<MonitorOptions>;
  private samples: PerformanceMetrics[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private monitoringInterval: number | null = null;
  private isClient: boolean;

  constructor(options: MonitorOptions = {}) {
    this.isClient = typeof window !== 'undefined';
    
    this.options = {
      sampleInterval: 1000,
      maxSamples: 100,
      enableMemoryMonitoring: true,
      enableResourceMonitoring: true,
      enableErrorTracking: true,
      reportingEndpoint: '',
      ...options
    };

    this.metrics = this.initializeMetrics();
    
    if (this.isClient) {
      this.setupErrorHandling();
    }
  }

  // 开始监控
  start(): void {
    if (!this.isClient || !this.options.enabled) return;
    
    this.monitoringInterval = window.setInterval(
      () => this.collectMetrics(),
      this.options.sampleInterval
    );
    this.startFrameMonitoring();
  }

  // 停止监控
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // 获取当前指标
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // 获取历史数据
  getHistoricalData(): PerformanceMetrics[] {
    return [...this.samples];
  }

  // 手动记录时间
  measureTime(label: string, callback: () => void): void {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;
    this.metrics.timing[label] = duration;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      memory: { used: 0, total: 0, limit: 0 },
      timing: {},
      resources: [],
      errors: []
    };
  }

  private collectMetrics(): void {
    if (!this.isClient) return;

    // 收集FPS
    this.metrics.fps = this.calculateFPS();

    // 收集内存使用
    if (this.options.enableMemoryMonitoring) {
      this.collectMemoryMetrics();
    }

    // 收集资源加载信息
    if (this.options.enableResourceMonitoring) {
      this.collectResourceMetrics();
    }

    // 保存样本
    this.saveSample();

    // 上报数据
    this.reportMetrics();
  }

  private calculateFPS(): number {
    const fps = this.frameCount * 1000 / this.options.sampleInterval;
    this.frameCount = 0;
    return Math.round(fps);
  }

  private startFrameMonitoring(): void {
    const countFrame = () => {
      this.frameCount++;
      requestAnimationFrame(countFrame);
    };
    requestAnimationFrame(countFrame);
  }

  private collectMemoryMetrics(): void {
    if (performance.memory) {
      this.metrics.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
  }

  private collectResourceMetrics(): void {
    const resources = performance.getEntriesByType('resource');
    this.metrics.resources = resources.map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as any).transferSize || 0,
      type: entry.initiatorType
    }));
  }

  private setupErrorHandling(): void {
    if (this.options.enableErrorTracking) {
      window.addEventListener('error', (event) => {
        this.metrics.errors.push({
          message: event.message,
          stack: event.error?.stack,
          timestamp: Date.now()
        });
      });
    }
  }

  private saveSample(): void {
    this.samples.push({ ...this.metrics });
    if (this.samples.length > this.options.maxSamples) {
      this.samples.shift();
    }
  }

  private async reportMetrics(): Promise<void> {
    if (!this.options.reportingEndpoint) return;

    try {
      await fetch(this.options.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.metrics)
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }
} 