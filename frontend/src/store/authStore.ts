/**
 * AuthStore — Secure authentication state management (Zustand)
 * - User login/logout/session state
 * - Token expiration tracking
 * - 2FA flow
 * - Automatic token refresh
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthService, LoginResponse, Verify2FAResponse } from '../services/authService';
import { TokenManager } from '../services/tokenManager';

export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
}

export interface Auth2FAState {
  requires2FA: true;
  tempToken: string;
}

export interface AuthState {
  // User info
  user: AuthUser | null;
  isAuthenticated: boolean;

  // Loading states
  isLoading: boolean;
  isLoadingUser: boolean;
  isRefreshing: boolean;

  // 2FA
  twoFARequired: Auth2FAState | null;

  // Error state
  error: string | null;

  // Session
  sessionStartedAt: number | null;
  lastActivityAt: number | null;

  // Actions
  login: (email: string, password: string) => Promise<void | Auth2FAState>;
  verify2FA: (code: string, tempToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  setLastActivity: () => void;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isLoadingUser: false,
      isRefreshing: false,
      twoFARequired: null,
      error: null,
      sessionStartedAt: null,
      lastActivityAt: null,

      /**
       * Login user
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await AuthService.login(email, password);

          // 2FA required
          if ('requires2FA' in result && result.requires2FA) {
            set({
              twoFARequired: {
                requires2FA: true,
                tempToken: result.tempToken,
              },
              isLoading: false,
            });
            return { requires2FA: true, tempToken: result.tempToken };
          }

          // Successfully logged in
          const typedResult = result as LoginResponse;
          set({
            user: typedResult.user,
            isAuthenticated: true,
            isLoading: false,
            twoFARequired: null,
            sessionStartedAt: Date.now(),
            lastActivityAt: Date.now(),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      /**
       * Verify 2FA code
       */
      verify2FA: async (code: string, tempToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await AuthService.verify2FA(code, tempToken);
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            twoFARequired: null,
            sessionStartedAt: Date.now(),
            lastActivityAt: Date.now(),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : '2FA verification failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          await AuthService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            twoFARequired: null,
            error: null,
            sessionStartedAt: null,
            lastActivityAt: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Logout failed';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      /**
       * Restore session on app load
       * - Validate stored token
       * - Refresh if needed
       * - Load user profile
       */
      restoreSession: async () => {
        set({ isLoadingUser: true });
        try {
          const token = TokenManager.getAccessToken();

          if (!token) {
            set({ isLoadingUser: false });
            return;
          }

          // Check if token is expired
          if (TokenManager.isTokenExpired(token)) {
            // Try to refresh
            const refreshed = await get().refreshToken();
            if (!refreshed) {
              set({ isLoadingUser: false });
              return;
            }
          }

          // Fetch current user
          const user = await AuthService.getCurrentUser(token);
          set({
            user,
            isAuthenticated: true,
            isLoadingUser: false,
            sessionStartedAt: Date.now(),
            lastActivityAt: Date.now(),
          });
        } catch (err) {
          // Session restoration failed
          TokenManager.clearAll();
          set({
            user: null,
            isAuthenticated: false,
            isLoadingUser: false,
            error: null, // Don't show error on startup
          });
        }
      },

      /**
       * Refresh access token
       * Returns true if successful, false otherwise
       */
      refreshToken: async () => {
        set({ isRefreshing: true });
        try {
          const newToken = await AuthService.refreshAccessToken();
          set({ isRefreshing: false, error: null });
          return true;
        } catch (err) {
          // Refresh failed - force logout
          TokenManager.clearAll();
          set({
            user: null,
            isAuthenticated: false,
            isRefreshing: false,
            error: null, // Silent failure
          });
          return false;
        }
      },

      /**
       * Clear error message
       */
      clearError: () => set({ error: null }),

      /**
       * Update last activity time (used for session timeout)
       */
      setLastActivity: () => set({ lastActivityAt: Date.now() }),
    }),
    { name: 'AuthStore' }
  )
);

/**
 * Hook to handle token refresh and session timeout
 * Call this in your app's useEffect to manage token lifecycle
 */
export function useAuthLifecycle() {
  const { isAuthenticated, lastActivityAt, sessionStartedAt, refreshToken, logout } = useAuthStore();

  return {
    /**
     * Check token expiration and refresh if needed
     */
    checkAndRefreshToken: async () => {
      if (!isAuthenticated) return;

      const token = TokenManager.getAccessToken();
      if (!token) return;

      // Refresh if token is expiring soon
      if (TokenManager.isTokenExpiringSoon(token, TOKEN_REFRESH_THRESHOLD_MS)) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          await logout();
        }
      }
    },

    /**
     * Check if session has timed out due to inactivity
     */
    checkSessionTimeout: async () => {
      if (!isAuthenticated || !lastActivityAt || !sessionStartedAt) return;

      const now = Date.now();
      if (now - lastActivityAt > SESSION_TIMEOUT_MS) {
        await logout();
      }
    },
  };
}
