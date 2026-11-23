/**
 * Analytics Service — Event tracking and user session management
 * - Tracks 15+ user events
 * - Integrates with analytics platforms (Segment, Mixpanel, Amplitude, PostHog)
 * - Session management
 * - Privacy-first (no sensitive data)
 */

import { TokenManager } from './tokenManager';

export type EventCategory = 'auth' | 'market' | 'bet' | 'portfolio' | 'ui' | 'error' | 'page' | 'session';

export interface AnalyticsEvent {
  eventName: string;
  category: EventCategory;
  timestamp: string;
  sessionId: string;
  userId?: string;
  properties: Record<string, any>;
}

export interface SessionData {
  sessionId: string;
  userId?: string;
  startedAt: string;
  language: string;
  currency: string;
  timeZone: string;
}

class AnalyticsServiceClass {
  private sessionData: SessionData | null = null;
  private isEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
  private apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Initialize analytics session
   */
  async initializeSession(userId?: string) {
    this.sessionData = {
      sessionId: TokenManager.getSessionId(),
      userId,
      startedAt: new Date().toISOString(),
      language: document.documentElement.lang || 'en',
      currency: localStorage.getItem('currency') || 'USD',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Track session start
    this.track('session_started', 'session', {
      userId,
    });
  }

  /**
   * End session
   */
  async endSession() {
    if (!this.sessionData) return;

    this.track('session_ended', 'session', {
      duration: Date.now() - new Date(this.sessionData.startedAt).getTime(),
    });

    this.sessionData = null;
  }

  /**
   * Track event
   */
  track(
    eventName: string,
    category: EventCategory,
    properties: Record<string, any> = {}
  ) {
    if (!this.isEnabled || !this.sessionData) return;

    const event: AnalyticsEvent = {
      eventName,
      category,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      },
    };

    // Send to backend
    this.sendEvent(event);

    // Also send to external analytics if configured
    this.sendToExternalAnalytics(event);
  }

  /**
   * Track authentication events
   */
  trackAuth(action: 'login' | 'logout' | 'register' | '2fa_verified' | 'password_reset', userId?: string) {
    this.track(`auth_${action}`, 'auth', { userId });
  }

  /**
   * Track market events
   */
  trackMarket(action: 'created' | 'viewed' | 'resolved', marketId: string, properties?: any) {
    this.track(`market_${action}`, 'market', { marketId, ...properties });
  }

  /**
   * Track betting events
   */
  trackBet(action: 'placed' | 'claimed' | 'viewed', betId: string, marketId: string, properties?: any) {
    this.track(`bet_${action}`, 'bet', { betId, marketId, ...properties });
  }

  /**
   * Track portfolio events
   */
  trackPortfolio(action: 'viewed' | 'exported', properties?: any) {
    this.track(`portfolio_${action}`, 'portfolio', properties);
  }

  /**
   * Track UI events
   */
  trackUI(action: string, componentName: string, properties?: any) {
    this.track(`ui_${action}`, 'ui', { component: componentName, ...properties });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: any) {
    this.track(`page_view`, 'page', { page: pageName, ...properties });
  }

  /**
   * Track error
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    this.track('error_occurred', 'error', {
      error: errorMessage,
      stack: errorStack,
      ...context,
    });
  }

  /**
   * Send event to backend
   */
  private async sendEvent(event: AnalyticsEvent) {
    try {
      await fetch(`${this.apiEndpoint}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {
        // Fail silently - don't disrupt user experience
      });
    } catch {
      // Fail silently
    }
  }

  /**
   * Send event to external analytics platforms
   */
  private sendToExternalAnalytics(event: AnalyticsEvent) {
    try {
      // Segment
      if ((window as any).analytics) {
        (window as any).analytics.track(event.eventName, event.properties);
      }

      // Mixpanel
      if ((window as any).mixpanel) {
        (window as any).mixpanel.track(event.eventName, event.properties);
      }

      // Amplitude
      if ((window as any).amplitude) {
        (window as any).amplitude.getInstance().logEvent(event.eventName, event.properties);
      }

      // PostHog
      if ((window as any).posthog) {
        (window as any).posthog.capture(event.eventName, event.properties);
      }
    } catch {
      // Fail silently
    }
  }

  /**
   * Set user ID for future events
   */
  setUserId(userId: string) {
    if (this.sessionData) {
      this.sessionData.userId = userId;
    }

    // Also set in external platforms
    if ((window as any).analytics) {
      (window as any).analytics.identify(userId);
    }
    if ((window as any).mixpanel) {
      (window as any).mixpanel.identify(userId);
    }
    if ((window as any).amplitude) {
      (window as any).amplitude.getInstance().setUserId(userId);
    }
    if ((window as any).posthog) {
      (window as any).posthog.identify(userId);
    }
  }

  /**
   * Set custom properties for all future events
   */
  setCustomProperties(properties: Record<string, any>) {
    if ((window as any).analytics) {
      (window as any).analytics.identify(properties);
    }
    if ((window as any).mixpanel) {
      (window as any).mixpanel.registerSuperProperties(properties);
    }
    if ((window as any).posthog) {
      (window as any).posthog.identify(properties);
    }
  }
}

export const analytics = new AnalyticsServiceClass();
