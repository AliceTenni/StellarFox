/**
 * Hook for tracking performance metrics
 * Usage: usePerformanceMetrics('component-name')
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackCustomMetric, measurePerformance } from '@/lib/vitals';

export interface PerformanceMetricsConfig {
  enabled?: boolean;
  trackRender?: boolean;
  trackMemory?: boolean;
  trackInteractions?: boolean;
  customLabel?: string;
}

/**
 * Hook to track component performance metrics
 */
export const usePerformanceMetrics = (
  componentName: string,
  config: PerformanceMetricsConfig = {}
): void => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    trackRender = true,
    trackMemory = false,
    trackInteractions = true,
    customLabel,
  } = config;

  const renderStartRef = useRef<number>(0);
  const metricsRef = useRef<Map<string, number>>(new Map());
  const label = customLabel || componentName;

  // Track initial render
  useEffect(() => {
    if (!enabled || !trackRender) return;

    renderStartRef.current = performance.now();

    return () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStartRef.current;

      trackCustomMetric(`render_${label}`, renderTime, {
        component: componentName,
        type: 'render',
      });
    };
  }, [enabled, trackRender, componentName, label]);

  // Track memory usage if available
  useEffect(() => {
    if (!enabled || !trackMemory) return;

    const trackMemory = () => {
      if ((performance as any).memory) {
        const memMetrics = (performance as any).memory;
        trackCustomMetric(`memory_${label}`, memMetrics.usedJSHeapSize, {
          component: componentName,
          type: 'memory',
          totalHeapSize: memMetrics.totalJSHeapSize,
          heapLimit: memMetrics.jsHeapSizeLimit,
        });
      }
    };

    // Track memory every 5 seconds
    const interval = setInterval(trackMemory, 5000);

    return () => clearInterval(interval);
  }, [enabled, trackMemory, componentName, label]);

  // Track user interactions
  useEffect(() => {
    if (!enabled || !trackInteractions) return;

    const handleInteraction = (event: Event) => {
      const eventType = event.type;
      const key = `interaction_${eventType}`;
      const count = (metricsRef.current.get(key) || 0) + 1;
      metricsRef.current.set(key, count);

      trackCustomMetric(`${key}_${label}`, count, {
        component: componentName,
        type: 'interaction',
        eventType,
      });
    };

    const interactions = ['click', 'keydown', 'scroll', 'resize'];
    interactions.forEach((interaction) => {
      window.addEventListener(interaction, handleInteraction, true);
    });

    return () => {
      interactions.forEach((interaction) => {
        window.removeEventListener(interaction, handleInteraction, true);
      });
    };
  }, [enabled, trackInteractions, componentName, label]);
};

/**
 * Hook to measure async operation performance
 */
export const useMeasureAsync = (enabled: boolean = true) => {
  const measure = useCallback(
    async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
      if (!enabled) {
        return fn();
      }

      return measurePerformance(name, fn);
    },
    [enabled]
  );

  return { measure };
};

/**
 * Hook to track render count and performance
 */
export const useRenderCount = (componentName: string): number => {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `🔄 ${componentName} rendered ${renderCountRef.current} times`
      );
    }

    trackCustomMetric(`render_count_${componentName}`, renderCountRef.current, {
      component: componentName,
      type: 'render_count',
    });
  });

  return renderCountRef.current;
};

/**
 * Hook to track when a component becomes visible (intersection observer)
 */
export const useVisibilityTracking = (componentName: string): void => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackCustomMetric(`component_visible_${componentName}`, 1, {
            component: componentName,
            type: 'visibility',
          });

          // Only track once
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [componentName]);
};
