/**
 * Analytics Provider
 * Wraps the app to initialize and manage analytics tracking
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { initWebVitals } from '@/lib/vitals';

interface AnalyticsProviderProps {
  children: ReactNode;
  enableWebVitals?: boolean;
  enableSentry?: boolean;
  sentryDSN?: string;
}

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
const initializeSentry = (dsn?: string): void => {
  if (!dsn || typeof window === 'undefined') return;

  try {
    import('@sentry/react').then(({ init }) => {
      init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
          new (require('@sentry/react')).Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * Analytics Provider Component
 * Initializes web vitals and Sentry monitoring
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  enableWebVitals = true,
  enableSentry = process.env.NODE_ENV === 'production',
  sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN,
}) => {
  useEffect(() => {
    // Initialize web vitals monitoring
    if (enableWebVitals) {
      initWebVitals();
    }

    // Initialize Sentry error tracking
    if (enableSentry) {
      initializeSentry(sentryDSN);
    }

    // Track page view
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', () => {
        if (window.__SENTRY__) {
          try {
            (window as any).__SENTRY__.captureMessage('Page viewed', 'info');
          } catch (error) {
            console.error('Failed to capture page view:', error);
          }
        }
      });
    }
  }, [enableWebVitals, enableSentry, sentryDSN]);

  return <>{children}</>;
};

export default AnalyticsProvider;
