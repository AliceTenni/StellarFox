/**
 * AuthService — API calls for authentication
 * - Login, register, logout, token refresh
 * - 2FA flow support
 * - Session management
 */

import { TokenManager } from './tokenManager';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface Register2FAResponse {
  requires2FA: true;
  tempToken: string;
}

export interface Verify2FARequest {
  code: string;
  tempToken: string;
}

export interface Verify2FAResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export class AuthService {
  /**
   * Register new user account
   */
  static async register(email: string, password: string): Promise<{ userId: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }

    return res.json();
  }

  /**
   * Login user (may require 2FA)
   */
  static async login(email: string, password: string): Promise<LoginResponse | Register2FAResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await res.json();

    // If 2FA is required, return temp token
    if ('requires2FA' in data && data.requires2FA) {
      return data;
    }

    // Store access token
    TokenManager.setAccessToken(data.accessToken);
    return data;
  }

  /**
   * Verify 2FA code and get tokens
   */
  static async verify2FA(code: string, tempToken: string): Promise<Verify2FAResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, tempToken }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || '2FA verification failed');
    }

    const data = await res.json();
    TokenManager.setAccessToken(data.accessToken);
    return data;
  }

  /**
   * Refresh access token using refresh token (httpOnly cookie)
   */
  static async refreshAccessToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include refresh token cookie
    });

    if (!res.ok) {
      // Refresh failed - user is logged out
      TokenManager.clearAll();
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await res.json();
    TokenManager.setAccessToken(accessToken);
    return accessToken;
  }

  /**
   * Logout user (clears tokens and invalidates session)
   */
  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Even if the request fails, clear local state
      console.error('Logout request failed:', err);
    } finally {
      TokenManager.clearAll();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(token: string): Promise<{ id: string; email: string; created_at: string }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return res.json();
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/password-reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Password reset request failed');
    }

    return res.json();
  }

  /**
   * Confirm password reset with token
   */
  static async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/password-reset-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Password reset confirmation failed');
    }

    return res.json();
  }

  /**
   * Check if session is valid
   */
  static async validateSession(token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/validate-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
