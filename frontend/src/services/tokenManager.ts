/**
 * TokenManager — Secure token storage and retrieval
 * - Access tokens: sessionStorage (cleared on logout, lost on tab close)
 * - Refresh tokens: httpOnly cookies (automatic, server-managed)
 * - Session IDs: sessionStorage (for analytics)
 */

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'bankerchanger_access_token';
  private static readonly SESSION_ID_KEY = 'bankerchanger_session_id';

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Store access token (called after successful login/refresh)
   */
  static setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  /**
   * Clear access token (called on logout)
   */
  static clearAccessToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  /**
   * Get or create session ID for analytics
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Clear session ID
   */
  static clearSessionId(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.SESSION_ID_KEY);
    }
  }

  /**
   * Check if JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const decoded = JSON.parse(atob(parts[1]));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Decode JWT token (without verification)
   */
  static decodeToken(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  static isTokenExpiringSoon(token: string, thresholdMs = 5 * 60 * 1000): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.exp) return true;
      
      const expiresAt = decoded.exp * 1000;
      const now = Date.now();
      return expiresAt - now < thresholdMs;
    } catch {
      return true;
    }
  }

  /**
   * Clear all auth-related storage
   */
  static clearAll(): void {
    this.clearAccessToken();
    this.clearSessionId();
  }
}
