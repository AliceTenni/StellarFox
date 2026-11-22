/**
 * Web Vitals Monitoring Module
 * Tracks Core Web Vitals (LCP, FID, CLS) and sends to analytics
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

export interface AnalyticsEvent {
  type: 'web_vitals' | 'custom_metric' | 'error';
  metric: WebVitalsMetric | Record<string, unknown>;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Send analytics event to your analytics service
 * This is a placeholder that should be connected to your analytics backend
 */
export const sendAnalyticsEvent = (event: AnalyticsEvent): void => {
  // In production, send to your analytics service
  // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', event);
  }

  // Send to Sentry if available
  if (typeof window !== 'undefined' && window.__SENTRY__) {
    try {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry?.captureMessage) {
        Sentry.captureMessage(`Web Vital: ${event.metric.name}`, 'info');
      }
    } catch (error) {
      console.error('Failed to send to Sentry:', error);
    }
  }
};

/**
 * Track a web vitals metric
 */
const trackVital = (metric: WebVitalsMetric): void => {
  const event: AnalyticsEvent = {
    type: 'web_vitals',
    metric,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };

  sendAnalyticsEvent(event);
};

/**
 * Initialize web vitals monitoring
 * Call this once during app initialization
 */
export const initWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // Largest Contentful Paint - should be < 2.5s
    onLCP((metric) => {
      trackVital({
        name: 'LCP',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // First Input Delay - should be < 100ms
    onFID((metric) => {
      trackVital({
        name: 'FID',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // Cumulative Layout Shift - should be < 0.1
    onCLS((metric) => {
      trackVital({
        name: 'CLS',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // First Contentful Paint - should be < 1.8s
    onFCP((metric) => {
      trackVital({
        name: 'FCP',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // Interaction to Next Paint - should be < 200ms
    onINP((metric) => {
      trackVital({
        name: 'INP',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });

    // Time to First Byte - should be < 600ms
    onTTFB((metric) => {
      trackVital({
        name: 'TTFB',
        value: metric.value,
        rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      });
    });
  } catch (error) {
    console.error('Failed to initialize web vitals:', error);
  }
};

/**
 * Track custom performance metric
 */
export const trackCustomMetric = (
  name: string,
  value: number,
  metadata?: Record<string, unknown>
): void => {
  if (typeof window === 'undefined') return;

  const event: AnalyticsEvent = {
    type: 'custom_metric',
    metric: {
      name,
      value,
      metadata,
    },
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  sendAnalyticsEvent(event);
};

/**
 * Measure and track performance of a function
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    trackCustomMetric(name, duration, { status: 'success' });

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    trackCustomMetric(name, duration, {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

/**
 * Get performance entries for analysis
 */
export const getPerformanceEntries = (
  entryType?: string
): PerformanceEntry[] => {
  if (typeof window === 'undefined') return [];

  try {
    return entryType
      ? performance.getEntriesByType(entryType)
      : performance.getEntries();
  } catch (error) {
    console.error('Failed to get performance entries:', error);
    return [];
  }
};
