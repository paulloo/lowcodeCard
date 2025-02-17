export interface OptimizationOptions {
  cacheSize?: number;
  debounceTime?: number;
  throttleTime?: number;
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enableBatchUpdates?: boolean;
}

export class RenderOptimizer {
  private cache: Map<string, {
    result: any;
    timestamp: number;
    hits: number;
  }>;
  private maxCacheSize: number;
  private updateQueue: Set<string>;
  private isUpdating: boolean = false;
  private options: Required<OptimizationOptions>;

  constructor(options: OptimizationOptions = {}) {
    this.options = {
      cacheSize: 100,
      debounceTime: 16,
      throttleTime: 16,
      enableVirtualization: true,
      enableLazyLoading: true,
      enableBatchUpdates: true,
      ...options
    };

    this.cache = new Map();
    this.maxCacheSize = this.options.cacheSize;
    this.updateQueue = new Set();
  }

  // 缓存渲染结果
  cacheResult(key: string, result: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      this.evictCache();
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 0
    });
  }

  // 获取缓存的渲染结果
  getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached) {
      cached.hits++;
      cached.timestamp = Date.now();
      return cached.result;
    }
    return null;
  }

  // 批量更新处理
  queueUpdate(key: string): void {
    if (!this.options.enableBatchUpdates) {
      this.processUpdate(key);
      return;
    }

    this.updateQueue.add(key);
    if (!this.isUpdating) {
      this.isUpdating = true;
      requestAnimationFrame(() => this.processBatchUpdates());
    }
  }

  // 虚拟化列表渲染
  getVisibleRange(
    totalItems: number,
    viewportHeight: number,
    itemHeight: number,
    scrollTop: number
  ): { start: number; end: number } {
    if (!this.options.enableVirtualization) {
      return { start: 0, end: totalItems };
    }

    const buffer = Math.ceil(viewportHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(
      totalItems,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer
    );

    return { start, end };
  }

  // 防抖包装器
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = this.options.debounceTime
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 节流包装器
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number = this.options.throttleTime
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= wait) {
        func(...args);
        lastCall = now;
      }
    };
  }

  private processBatchUpdates(): void {
    this.updateQueue.forEach(key => this.processUpdate(key));
    this.updateQueue.clear();
    this.isUpdating = false;
  }

  private processUpdate(key: string): void {
    // 实际更新逻辑
    this.cache.delete(key);
  }

  private evictCache(): void {
    // LRU缓存淘汰策略
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      // 优先考虑访问次数，其次是最近访问时间
      const hitsDiff = a[1].hits - b[1].hits;
      if (hitsDiff !== 0) return hitsDiff;
      return a[1].timestamp - b[1].timestamp;
    });

    // 移除最不常用的条目
    const toRemove = Math.ceil(this.maxCacheSize * 0.2); // 每次清除20%
    entries.slice(0, toRemove).forEach(([key]) => this.cache.delete(key));
  }
} 