/**
 * API Interceptor — Automatic token refresh and request/response handling
 * - Adds Authorization header to all requests
 * - Automatically refreshes token on 401
 * - Handles errors with proper messaging
 */

import { TokenManager } from './tokenManager';
import { AuthService } from './authService';

interface FetchOptions extends RequestInit {
  baseUrl?: string;
}

class ApiInterceptor {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  /**
   * Make authenticated API request with automatic token refresh
   */
  async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${options.baseUrl || this.baseUrl}${endpoint}`;
    const token = TokenManager.getAccessToken();

    // Add authorization header if token exists
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    // Handle 401 - token expired, try to refresh
    if (response.status === 401 && token) {
      // Prevent multiple refresh attempts
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        try {
          const newToken = await AuthService.refreshAccessToken();
          this.refreshPromise = Promise.resolve(newToken);

          // Retry original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } catch (err) {
          // Refresh failed - force logout
          TokenManager.clearAll();
          throw new AuthenticationError('Session expired. Please login again.');
        } finally {
          this.isRefreshing = false;
          this.refreshPromise = null;
        }
      } else if (this.refreshPromise) {
        // Wait for ongoing refresh
        const newToken = await this.refreshPromise;
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    // Handle errors
    if (!response.ok) {
      throw await this.handleError(response);
    }

    // Parse response
    const data = await this.parseResponse<T>(response);
    return data;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body: any,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!contentType) {
      return {} as T;
    }

    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    if (contentType.includes('text/')) {
      return response.text() as Promise<T>;
    }

    if (contentType.includes('application/octet-stream')) {
      return response.blob() as Promise<T>;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Handle API error responses
   */
  private async handleError(response: Response): Promise<ApiError> {
    let data: any;

    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    const error = new ApiError(
      data.message || response.statusText,
      response.status,
      data
    );

    return error;
  }
}

/**
 * Custom error classes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Request/Response logging for debugging
 */
export function enableRequestLogging() {
  const originalFetch = window.fetch;

  window.fetch = function (...args: any[]) {
    const [resource, config] = args;

    console.group(`📡 API Request: ${config?.method || 'GET'} ${resource}`);
    console.log('URL:', resource);
    if (config?.body) {
      try {
        console.log('Body:', JSON.parse(config.body));
      } catch {
        console.log('Body:', config.body);
      }
    }
    console.groupEnd();

    return originalFetch.apply(window, args).then((response: Response) => {
      console.group(`📡 API Response: ${response.status} ${response.statusText}`);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.groupEnd();

      return response;
    });
  };
}

export const apiInterceptor = new ApiInterceptor();
