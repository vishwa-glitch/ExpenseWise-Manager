import {
  performanceMonitor,
  debounce,
  throttle,
  memoize,
  shallowEqual,
  deepEqual,
} from '../performanceUtils';

describe('performanceUtils', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('PerformanceMonitor', () => {
    it('should track render times', () => {
      performanceMonitor.startRender('TestComponent');
      
      // Simulate some work
      jest.advanceTimersByTime(20);
      
      performanceMonitor.endRender('TestComponent');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].componentName).toBe('TestComponent');
      expect(metrics[0].renderTime).toBeGreaterThan(0);
    });

    it('should calculate average render times', () => {
      // Record multiple renders
      for (let i = 0; i < 3; i++) {
        performanceMonitor.startRender('TestComponent');
        jest.advanceTimersByTime(10 + i * 5); // 10ms, 15ms, 20ms
        performanceMonitor.endRender('TestComponent');
      }

      const average = performanceMonitor.getAverageRenderTime('TestComponent');
      expect(average).toBeCloseTo(15, 1); // Average of 10, 15, 20
    });

    it('should return 0 for components with no metrics', () => {
      const average = performanceMonitor.getAverageRenderTime('NonExistentComponent');
      expect(average).toBe(0);
    });

    it('should clear metrics', () => {
      performanceMonitor.startRender('TestComponent');
      performanceMonitor.endRender('TestComponent');
      
      expect(performanceMonitor.getMetrics()).toHaveLength(1);
      
      performanceMonitor.clearMetrics();
      expect(performanceMonitor.getMetrics()).toHaveLength(0);
    });

    it('should handle missing start time gracefully', () => {
      // End render without starting
      performanceMonitor.endRender('TestComponent');
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics).toHaveLength(0);
    });
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1');
      debouncedFn('arg2');
      debouncedFn('arg3');

      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg3');
    });

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('throttle', () => {
    it('should limit function execution frequency', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');

      jest.advanceTimersByTime(100);

      throttledFn('arg4');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('arg4');
    });

    it('should execute immediately on first call', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('arg1');
      expect(mockFn).toHaveBeenCalledWith('arg1');
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const expensiveFn = jest.fn((x: number) => x * 2);
      const memoizedFn = memoize(expensiveFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('should use custom key function', () => {
      const expensiveFn = jest.fn((obj: { id: number; name: string }) => obj.id * 2);
      const memoizedFn = memoize(expensiveFn, (obj) => obj.id.toString());

      const obj1 = { id: 1, name: 'first' };
      const obj2 = { id: 1, name: 'second' }; // Same id, different name

      const result1 = memoizedFn(obj1);
      const result2 = memoizedFn(obj2);

      expect(result1).toBe(2);
      expect(result2).toBe(2);
      expect(expensiveFn).toHaveBeenCalledTimes(1); // Should use cached result
    });

    it('should handle different arguments', () => {
      const expensiveFn = jest.fn((x: number) => x * 2);
      const memoizedFn = memoize(expensiveFn);

      memoizedFn(5);
      memoizedFn(10);

      expect(expensiveFn).toHaveBeenCalledTimes(2);
      expect(expensiveFn).toHaveBeenCalledWith(5);
      expect(expensiveFn).toHaveBeenCalledWith(10);
    });
  });

  describe('shallowEqual', () => {
    it('should return true for equal objects', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };

      expect(shallowEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects with different values', () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 4 };

      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different keys', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2, c: 3 };

      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for nested objects with different references', () => {
      const obj1 = { a: 1, b: { nested: 1 } };
      const obj2 = { a: 1, b: { nested: 1 } };

      expect(shallowEqual(obj1, obj2)).toBe(false);
    });

    it('should return true for nested objects with same references', () => {
      const nested = { nested: 1 };
      const obj1 = { a: 1, b: nested };
      const obj2 = { a: 1, b: nested };

      expect(shallowEqual(obj1, obj2)).toBe(true);
    });
  });

  describe('deepEqual', () => {
    it('should return true for equal primitive values', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('test', 'test')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
    });

    it('should return false for different primitive values', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('test', 'different')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
    });

    it('should return true for deeply equal objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } } };

      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for deeply different objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 4 } } };

      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should handle arrays', () => {
      const arr1 = [1, 2, [3, 4]];
      const arr2 = [1, 2, [3, 4]];
      const arr3 = [1, 2, [3, 5]];

      expect(deepEqual(arr1, arr2)).toBe(true);
      expect(deepEqual(arr1, arr3)).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
    });

    it('should handle different types', () => {
      expect(deepEqual(1, '1')).toBe(false);
      expect(deepEqual({}, [])).toBe(false);
      expect(deepEqual(0, false)).toBe(false);
    });
  });
});