# Quick Start Guide: Feature Implementation

Copy-paste ready code snippets to get started on each feature immediately.

---

## Feature 4: Authentication State Management (Start Here!)

Backend is 95% done. Just implement the frontend layer.

### Step 1: Create Token Manager (5 min)

**frontend/src/services/tokenManager.ts**
```typescript
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'bankerchanger_access_token';
  private static readonly SESSION_ID_KEY = 'bankerchanger_session_id';

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  static clearAccessToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  static getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
```

### Step 2: Create Auth Service (10 min)

**frontend/src/services/authService.ts**
```typescript
import { TokenManager } from './tokenManager';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Login2FAResponse {
  requires2FA: true;
  tempToken: string;
}

export class AuthService {
  static async register(
    email: string,
    password: string,
  ): Promise<{ userId: string; message: string }> {
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

  static async login(
    email: string,
    password: string,
  ): Promise<LoginResponse | Login2FAResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await res.json();

    if ('requires2FA' in data) {
      return data;
    }

    TokenManager.setAccessToken(data.accessToken);
    return data;
  }

  static async refreshAccessToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await res.json();
    TokenManager.setAccessToken(accessToken);
    return accessToken;
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    TokenManager.clearAccessToken();
  }

  static async verify2FA(
    tempToken: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tempToken, otp }),
    });

    if (!res.ok) {
      throw new Error('2FA verification failed');
    }

    const { accessToken } = await res.json();
    TokenManager.setAccessToken(accessToken);
    return { accessToken, refreshToken: '' };
  }
}
```

### Step 3: Create Zustand Auth Store (8 min)

**frontend/src/store/authStore.ts**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  tempToken: string | null;

  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  set2FARequired: (tempToken: string) => void;
  clear2FA: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requires2FA: false,
      tempToken: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (value) => set({ isLoading: value }),
      setError: (error) => set({ error }),
      set2FARequired: (tempToken) => set({ requires2FA: true, tempToken }),
      clear2FA: () => set({ requires2FA: false, tempToken: null }),
      clearAuth: () => set({
        user: null,
        isAuthenticated: false,
        requires2FA: false,
        tempToken: null,
        error: null,
      }),
    }),
    { name: 'AuthStore' },
  ),
);
```

### Step 4: Create Axios Auth Interceptor (12 min)

**frontend/src/services/authMiddleware.ts**
```typescript
import axios, { AxiosInstance } from 'axios';
import { TokenManager } from './tokenManager';
import { AuthService } from './authService';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error?: any) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(TokenManager.getAccessToken() || '');
    }
  });
  failedQueue = [];
}

export function createAuthenticatedClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });

  // Request interceptor: Add token to headers
  client.interceptors.request.use((config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: Handle 401 and refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await AuthService.refreshAccessToken();
          processQueue();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (err) {
          processQueue(err);
          TokenManager.clearAccessToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const apiClient = createAuthenticatedClient();
```

### Step 5: Create Auth Provider (10 min)

**frontend/src/providers/AuthProvider.tsx**
```typescript
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { TokenManager } from '../services/tokenManager';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      try {
        const decoded = TokenManager.decodeToken(token);
        if (decoded?.sub) {
          setUser({
            id: decoded.sub,
            email: decoded.email || '',
            role: decoded.role || 'user',
          });
          setAuthenticated(true);
        }
      } catch (err) {
        TokenManager.clearAccessToken();
      }
    }
  }, [setUser, setAuthenticated]);

  return <>{children}</>;
}
```

### Step 6: Create useAuth Hook (8 min)

**frontend/src/hooks/useAuth.ts**
```typescript
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/authService';

export function useLogin() {
  const { setUser, setLoading, setError, set2FARequired, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      AuthService.login(credentials.email, credentials.password),
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      setLoading(false);
      if ('requires2FA' in data) {
        set2FARequired(data.tempToken);
      } else {
        setUser({
          id: 'temp-id', // Should fetch from /auth/me endpoint
          email: 'user@example.com',
          role: 'user',
        });
        setAuthenticated(true);
      }
    },
    onError: (error) => {
      setLoading(false);
      setError((error as Error).message);
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => clearAuth(),
  });
}

export function useVerify2FA() {
  const { setUser, clear2FA, setError, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: (data: { tempToken: string; otp: string }) =>
      AuthService.verify2FA(data.tempToken, data.otp),
    onSuccess: () => {
      clear2FA();
      setUser({ id: 'temp-id', email: 'user@example.com', role: 'user' });
      setAuthenticated(true);
    },
    onError: (error) => setError((error as Error).message),
  });
}
```

### Step 7: Update App Layout (5 min)

**frontend/src/app/layout.tsx** - Add AuthProvider
```typescript
import { AuthProvider } from '../providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 8: Create Login Form Component (12 min)

**frontend/src/components/forms/LoginForm.tsx**
```typescript
'use client';

import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login } = useLogin();
  const { error, isLoading } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Feature 2: Validation System (Medium Priority)

### Quick Setup (30 min)

**frontend/src/schemas/auth.schemas.ts**
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email').min(5).max(254),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email').min(5).max(254),
  password: z.string()
    .min(12, 'At least 12 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[a-z]/, 'One lowercase letter')
    .regex(/[0-9]/, 'One number')
    .regex(/[^A-Za-z0-9]/, 'One special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**frontend/src/hooks/useValidation.ts**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

export function useValidation<T>(schema: ZodSchema) {
  return useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
}
```

**frontend/src/components/forms/FormField.tsx**
```typescript
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: FieldError;
  register: UseFormRegisterReturn;
  type?: string;
}

export function FormField({ label, error, register, type = 'text' }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <input
        {...register}
        type={type}
        className={`w-full px-3 py-2 border rounded ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <span className="text-red-600 text-sm">{error.message}</span>}
    </div>
  );
}
```

---

## Feature 1: Multi-Language Support (Nice to Have)

### Quick i18n Setup (40 min)

**frontend/src/i18n/config.ts**
```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18next;
```

**frontend/src/i18n/locales/en.json**
```json
{
  "login": "Login",
  "register": "Register",
  "logout": "Logout",
  "email": "Email",
  "password": "Password",
  "submit": "Submit",
  "home": {
    "welcome": "Welcome to BANKERCHANGER"
  }
}
```

**frontend/src/i18n/locales/es.json**
```json
{
  "login": "Iniciar sesión",
  "register": "Registrarse",
  "logout": "Cerrar sesión",
  "email": "Correo",
  "password": "Contraseña",
  "submit": "Enviar",
  "home": {
    "welcome": "Bienvenido a BANKERCHANGER"
  }
}
```

**frontend/src/components/LanguageSwitcher.tsx**
```typescript
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="px-3 py-2 border rounded"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

---

## Feature 3: Analytics (Advanced - Last)

### Simple Event Tracker (45 min)

**frontend/src/services/analytics.ts**
```typescript
import { TokenManager } from './tokenManager';

export interface AnalyticsEvent {
  type: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

export class AnalyticsService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static async track(eventType: string, properties?: Record<string, any>): Promise<void> {
    const token = TokenManager.getAccessToken();
    
    const event: AnalyticsEvent = {
      type: eventType,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: TokenManager.getSessionId(),
    };

    try {
      await fetch(`${this.API_BASE}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(event),
      });
    } catch (err) {
      console.error('Analytics tracking failed:', err);
    }
  }
}
```

**frontend/src/hooks/useAnalytics.ts**
```typescript
import { useEffect } from 'react';
import { AnalyticsService } from '../services/analytics';

export function usePageTracking(page: string) {
  useEffect(() => {
    AnalyticsService.track('page_viewed', { page });
  }, [page]);
}

export function useEventTracking() {
  return (event: string, properties?: Record<string, any>) => {
    AnalyticsService.track(event, properties);
  };
}
```

---

## Implementation Order

```
1. Feature 4 (Auth)        → Days 1-5
   └─ TokenManager
   └─ AuthService  
   └─ AuthStore
   └─ AuthProvider
   └─ useAuth hooks
   └─ Login/Logout forms

2. Feature 2 (Validation)  → Days 6-13
   └─ Zod schemas
   └─ FormField component
   └─ useValidation hook
   └─ Integrate with forms

3. Feature 1 (i18n)        → Days 14-21
   └─ i18n config
   └─ Translation files
   └─ LanguageSwitcher
   └─ Update all components

4. Feature 3 (Analytics)   → Days 22-29
   └─ AnalyticsService
   └─ Event tracking
   └─ Backend endpoints
```

---

## Testing Commands

```bash
# Install dependencies
npm install react-hook-form @hookform/resolvers zod axios

# Run dev server
npm run dev

# Test auth flow
# 1. Go to /login
# 2. Enter test@example.com / TestPassword123!
# 3. Should redirect to dashboard

# Test validation
# 1. Submit empty form
# 2. See field errors

# Test token refresh
# 1. Wait 15+ minutes
# 2. Make API call
# 3. Should auto-refresh token
```

---

## Production Checklist Before Deployment

- [ ] All tokens cleared on logout
- [ ] Refresh token in httpOnly cookie with Secure flag
- [ ] CORS allows credentials
- [ ] No token logging in console
- [ ] All forms use react-hook-form with validation
- [ ] Error messages don't leak sensitive info
- [ ] Analytics doesn't track passwords/amounts
- [ ] i18n strings 95%+ translated

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Token not sent to API" | Check `credentials: 'include'` in fetch/axios |
| "401 infinite loop" | Add `_retry` flag to prevent duplicate refresh |
| "Translations not loading" | Check JSON file syntax, run `npm run dev` |
| "Form not validating" | Ensure schema is passed to zodResolver |
| "Session lost on refresh" | Add AuthProvider.useEffect to restore token |

---

Good luck! 🚀 Start with Feature 4, everything else builds on it.
