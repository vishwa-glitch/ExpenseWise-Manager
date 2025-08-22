/**
 * Performance utilities for monitoring and optimization
 */

import React from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private renderStartTimes: Map<string, number> = new Map();

  /**
   * Start measuring render time for a component
   */
  startRender(componentName: string): void {
    this.renderStartTimes.set(componentName, performance.now());
  }

  /**
   * End measuring render time for a component
   */
  endRender(componentName: string): void {
    const startTime = this.renderStartTimes.get(componentName);
    if (startTime) {
      const renderTime = performance.now() - startTime;
      this.metrics.push({
        renderTime,
        componentName,
        timestamp: Date.now(),
      });
      this.renderStartTimes.delete(componentName);
      
      // Log slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Get performance metrics for analysis
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get average render time for a component
   */
  getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const totalTime = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return totalTime / componentMetrics.length;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC for measuring component render performance
 */
export function withPerformanceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceWrappedComponent: React.FC<T> = (props) => {
    React.useEffect(() => {
      performanceMonitor.startRender(displayName);
      return () => {
        performanceMonitor.endRender(displayName);
      };
    });

    return React.createElement(WrappedComponent, props);
  };

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return PerformanceWrappedComponent;
}

/**
 * Hook for measuring render performance
 */
export function useRenderPerformance(componentName: string): void {
  React.useEffect(() => {
    performanceMonitor.startRender(componentName);
    return () => {
      performanceMonitor.endRender(componentName);
    };
  });
}

/**
 * Hook for cleanup operations and memory management
 */
export function useCleanup(): () => void {
  const cleanupFunctions = React.useRef<(() => void)[]>([]);

  const addCleanup = React.useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  const runCleanup = React.useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup function error:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  React.useEffect(() => {
    return () => {
      runCleanup();
    };
  }, [runCleanup]);

  return addCleanup;
}

/**
 * Hook for memoized expensive calculations
 */
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList,
  options?: {
    enableProfiling?: boolean;
    calculationName?: string;
  }
): T {
  const { enableProfiling = false, calculationName = 'calculation' } = options || {};

  return React.useMemo(() => {
    if (enableProfiling) {
      const start = performance.now();
      const result = calculation();
      const end = performance.now();
      console.log(`${calculationName} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    
    return calculation();
  }, dependencies);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoization utility for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Check if two objects are shallowly equal (for React.memo comparisons)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep comparison for complex objects (use sparingly)
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 == null || obj2 == null) {
    return false;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}