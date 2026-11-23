/**
 * AuthProvider — Wraps app with auth state management
 * - Initializes auth session on app load
 * - Sets up token refresh interval
 * - Provides auth context
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { analytics } from '../services/analytics';
import { i18nService } from '../i18n/service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { restoreSession, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Initialize i18n
    i18nService.initialize();

    // Restore session on app load
    restoreSession();

    // Initialize analytics
    analytics.initializeSession();
  }, []);

  // Update analytics when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      analytics.setUserId(user.id);
      analytics.setCustomProperties({
        email: user.email,
      });
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
