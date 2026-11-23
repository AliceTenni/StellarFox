/**
 * useAuth — React hook for authentication state and actions
 * - Provides user, login, logout, and other auth methods
 * - Automatically manages token lifecycle
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore, useAuthLifecycle } from '../store/authStore';
import { analytics } from '../services/analytics';

export function useAuth() {
  const auth = useAuthStore();
  const lifecycle = useAuthLifecycle();

  // Initialize auth on mount
  useEffect(() => {
    auth.restoreSession();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const tokenCheckInterval = setInterval(async () => {
      await lifecycle.checkAndRefreshToken();
      await lifecycle.checkSessionTimeout();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, [auth.isAuthenticated]);

  // Track login
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await auth.login(email, password);

        if (result && 'requires2FA' in result) {
          return result;
        }

        // Track successful login
        analytics.trackAuth('login', auth.user?.id);
        return undefined;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        analytics.trackError(message, { action: 'login' });
        throw err;
      }
    },
    [auth]
  );

  // Track logout
  const logout = useCallback(async () => {
    try {
      analytics.trackAuth('logout', auth.user?.id);
      await auth.logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      analytics.trackError(message, { action: 'logout' });
      throw err;
    }
  }, [auth]);

  // Track 2FA verification
  const verify2FA = useCallback(
    async (code: string, tempToken: string) => {
      try {
        await auth.verify2FA(code, tempToken);
        analytics.trackAuth('2fa_verified', auth.user?.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : '2FA verification failed';
        analytics.trackError(message, { action: '2fa_verify' });
        throw err;
      }
    },
    [auth]
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isLoadingUser: auth.isLoadingUser,
    isRefreshing: auth.isRefreshing,
    twoFARequired: auth.twoFARequired,
    error: auth.error,
    login,
    logout,
    verify2FA,
    clearError: auth.clearError,
    setLastActivity: auth.setLastActivity,
  };
}

/**
 * useRequireAuth — Redirect to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser && !isAuthenticated) {
      // Redirect to login (you'll need to implement routing)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, [isAuthenticated, isLoadingUser]);

  return { isAuthenticated, isLoadingUser };
}

/**
 * useGuardedRoute — Render children only if authenticated
 */
export function useGuardedRoute() {
  const { isAuthenticated, isLoadingUser } = useRequireAuth();

  return {
    canRender: isAuthenticated && !isLoadingUser,
    isLoading: isLoadingUser,
  };
}
