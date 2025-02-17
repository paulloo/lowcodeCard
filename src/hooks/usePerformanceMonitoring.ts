import { useEffect } from 'react';
import { PerformanceMonitor } from '../core/monitoring/PerformanceMonitor';
import { ErrorTracker } from '../core/monitoring/ErrorTracker';

export function usePerformanceMonitoring() {
  useEffect(() => {
    // 只在客户端运行
    if (typeof window === 'undefined') return;

    const performanceMonitor = new PerformanceMonitor({
      sampleInterval: 1000,
      enableMemoryMonitoring: true,
      enableResourceMonitoring: true
    });

    const errorTracker = new ErrorTracker({
      captureUnhandled: true,
      contextProvider: () => ({
        route: window.location.pathname,
        userAgent: navigator.userAgent
      })
    });

    performanceMonitor.start();
    errorTracker.start();

    return () => {
      performanceMonitor.stop();
      errorTracker.stop();
    };
  }, []);
} 