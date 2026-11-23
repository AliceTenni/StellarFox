# StellarFox Feature Implementation Roadmap

Comprehensive analysis and implementation plan for four critical features based on the current codebase state.

---

## Executive Summary

The StellarFox repository is a **Next.js + React** frontend paired with an **Express + TypeScript** backend, featuring Stellar Soroban smart contract integration for a boxing prediction market platform. 

**Current State:**
- ✅ Robust JWT-based authentication with 2FA support (backend)
- ✅ Zod-based validation middleware exists (backend)
- ✅ Zustand for state management (frontend)
- ❌ No multi-language (i18n) support
- ❌ No real-time form validation or async validation
- ❌ No analytics/event tracking system
- ❌ No frontend auth state management or token refresh

---

## Feature 1: Multi-Language Support with Dynamic Language Switching

### Current State Assessment

**What Exists:**
- English-only interface
- Hard-coded strings throughout components
- `localStorage` for theme persistence (layout.tsx uses `bankerchanger_theme`)
- No locale context or provider
- No i18n library

**What's Missing:**
- Translation management system (i18n library integration)
- Language switcher UI component
- RTL layout support (CSS/styling)
- Locale-aware date/time formatting
- Currency formatting with locale-specific symbols
- Language persistence in local storage
- Pluralization support
- Context API or provider pattern for language state

### Dependencies to Add

**Frontend (package.json):**
```json
{
  "next-intl": "^3.0.0",
  "intl-messageformat": "^10.5.0",
  "date-fns": "^3.0.0",
  "numeral": "^2.0.6"
}
```

**Alternative (simpler):**
```json
{
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0",
  "i18next-browser-languagedetector": "^7.2.0",
  "i18next-http-backend": "^4.5.0"
}
```

### Key Files to Create/Modify

**Frontend Structure:**
```
frontend/src/
├── i18n/
│   ├── config.ts                 # i18next configuration
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   ├── es.json              # Spanish translations
│   │   ├── fr.json              # French translations
│   │   └── ar.json              # Arabic (RTL support)
│   ├── dateFormatter.ts          # Locale-aware date formatting
│   └── currencyFormatter.ts      # Locale-aware currency formatting
├── providers/
│   ├── QueryProvider.tsx         # (existing)
│   └── LanguageProvider.tsx      # NEW: i18n context provider
├── components/
│   └── LanguageSwitcher.tsx      # NEW: Language selection dropdown
├── hooks/
│   ├── useLanguage.ts            # NEW: Get current language
│   └── useTranslation.ts         # NEW: Wrapper for t() function
└── utils/
    ├── formatDate.ts            # NEW: Date formatting utilities
    ├── formatCurrency.ts        # NEW: Currency formatting utilities
    └── rtlSupport.ts            # NEW: RTL CSS utilities
```

**Backend Updates:**
- Add language preference to `users` table:
```sql
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en';
```

### Integration Points

1. **Layout (app/layout.tsx):**
   - Wrap with `LanguageProvider`
   - Add `LanguageSwitcher` component in Header
   - Set `lang` and `dir` attributes on `<html>`

2. **Components:**
   - Replace all hard-coded strings with `t('key')` calls
   - Use `formatDate()` and `formatCurrency()` utilities
   - Apply RTL classes where needed

3. **API Service:**
   - Add optional `accept-language` header
   - Backend returns locale-specific error messages

4. **Storage:**
   - Save language preference to `localStorage`
   - Sync with backend user profile on login

### Implementation Priority: **HIGH**
- Affects all UI strings and user-facing content
- Relatively straightforward with i18next
- Expected effort: **5-7 days**

---

## Feature 2: Comprehensive Validation System

### Current State Assessment

**What Exists:**
- ✅ **Backend:** Zod-based validation middleware (`validation.middleware.ts`)
- ✅ Existing schemas: `registerBody`, `emailLoginBody`, `loginBody`, `refreshBody`, etc.
- ✅ Error handling with `AppError` class
- ✅ Validation for body, query, and params
- ❌ **Frontend:** No real-time validation
- ❌ No async validation (email uniqueness, username availability)
- ❌ No custom validation rules or error messages
- ❌ No field-level error display in forms
- ❌ No validation state management

**What Works:**
- Server-side validation catches invalid data
- Errors returned as 422 status with field-level details
- Zod `parse()` and `refine()` for custom rules

### Dependencies to Add

**Frontend (package.json):**
```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  "@hookform/error-message": "^2.0.1"
}
```

### Key Files to Create/Modify

**Frontend:**
```
frontend/src/
├── schemas/
│   ├── auth.schemas.ts           # NEW: Zod schemas for auth forms
│   ├── market.schemas.ts         # NEW: Zod schemas for market creation
│   └── validation.ts             # NEW: Shared validation utilities
├── hooks/
│   ├── useValidation.ts          # NEW: Wrapper for form validation
│   ├── useAsyncValidation.ts     # NEW: Handle server-side async checks
│   └── useFormState.ts           # NEW: Form state management
├── components/
│   └── forms/
│       ├── FormField.tsx         # NEW: Reusable field wrapper with errors
│       ├── FormError.tsx         # NEW: Error message display
│       ├── RegisterForm.tsx      # MODIFY: Add react-hook-form
│       ├── LoginForm.tsx         # MODIFY: Add react-hook-form
│       └── BetForm.tsx           # MODIFY: Add react-hook-form
└── utils/
    └── validationUtils.ts        # NEW: Custom validators and rules
```

**Backend (new schemas and validators):**
```
backend/src/
├── validators/
│   ├── customRules.ts            # NEW: Custom validation rules
│   ├── asyncValidators.ts        # NEW: Server-side async checks
│   └── errorMessages.ts          # NEW: Localized error messages
├── schemas/
│   └── validation.schemas.ts     # MODIFY: Enhance existing schemas
└── middleware/
    └── validation.middleware.ts  # MODIFY: Improve error formatting
```

### Integration Points

1. **Frontend Forms:**
   - Use `react-hook-form` with Zod resolver
   - Display field errors in real-time
   - Show validation states (pending, success, error)
   - Disable submit until all fields valid

2. **Async Validation:**
   - Check email uniqueness on blur
   - Check username availability
   - Validate Stellar address format
   - Backend returns `409 Conflict` for duplicates

3. **Custom Rules Examples:**
   ```typescript
   // Frontend
   passwordStrength: z.string().refine(async (val) => {
     const strength = calculateStrength(val);
     return strength >= 3; // 0-4 scale
   }, { message: "Password too weak" });

   // Backend
   passwordSchema.refine(
     async (password) => !await isCommonPassword(password),
     { message: "Password is too common" }
   );
   ```

4. **Error Messaging:**
   - Localized messages via i18n system
   - Field-specific vs. form-level errors
   - Helpful hints and suggestions

### Implementation Priority: **CRITICAL**
- Form validation is fundamental UX
- Zod already in backend, can share schemas
- Expected effort: **6-8 days**

---

## Feature 3: Event-Based Analytics Tracking

### Current State Assessment

**What Exists:**
- ✅ Zustand store for app state
- ✅ React Query for data fetching
- ✅ WebSocket service for real-time updates
- ✅ Error logging middleware
- ❌ No analytics/tracking system
- ❌ No event emitter or analytics service
- ❌ No user session tracking
- ❌ No integration with analytics platforms (Google Analytics, Mixpanel, etc.)
- ❌ No event-driven architecture

**Current Logging:**
- Server-side: Pino logger (with request ID tracking)
- Client-side: Console logs only

### Dependencies to Add

**Frontend (package.json):**
```json
{
  "@segment/analytics-next": "^1.60.0",
  "amplitude-js": "^8.17.0",
  "posthog": "^3.0.0",
  "pino-logger": "^0.42.0"
}
```

**Backend (optional enhancements):**
```json
{
  "@sentry/node": "^7.80.0",
  "@sentry/tracing": "^7.80.0"
}
```

### Key Files to Create/Modify

**Frontend:**
```
frontend/src/
├── services/
│   ├── analytics.ts              # NEW: Analytics service wrapper
│   ├── eventTracker.ts           # NEW: Event emission system
│   └── sessionManager.ts         # NEW: User session tracking
├── hooks/
│   ├── useAnalytics.ts           # NEW: Hook to track events
│   └── useSessionTracking.ts     # NEW: Auto-track page views
├── providers/
│   ├── QueryProvider.tsx         # (existing)
│   ├── AnalyticsProvider.tsx     # NEW: Analytics initialization
│   └── SessionProvider.tsx       # NEW: Session context
└── config/
    └── analytics.config.ts       # NEW: Analytics platform config
```

**Backend:**
```
backend/src/
├── services/
│   ├── analytics.service.ts      # NEW: Backend analytics events
│   └── sessionService.ts         # NEW: Session tracking
├── schemas/
│   └── analytics.schemas.ts      # NEW: Event schemas
├── routes/
│   └── analytics.routes.ts       # NEW: Event endpoints
└── db/
    └── schema.ts                 # MODIFY: Add analytics tables
```

### Database Schema Additions

**Backend (new tables for event storage):**
```typescript
export const user_events = pgTable('user_events', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  event_type: text('event_type').notNull(), // 'bet_placed', 'market_viewed', etc.
  event_data: jsonb('event_data').default('{}'),
  session_id: text('session_id'),
  page_path: text('page_path'),
  referrer: text('referrer'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
});

export const user_sessions_analytics = pgTable('user_sessions_analytics', {
  id: serial('id').primaryKey(),
  session_id: text('session_id').notNull().unique(),
  user_id: text('user_id').references(() => users.id),
  started_at: timestamp('started_at').notNull().defaultNow(),
  ended_at: timestamp('ended_at'),
  total_events: integer('total_events').default(0),
  pages_visited: integer('pages_visited').default(0),
});
```

### Integration Points

1. **Frontend Events to Track:**
   ```typescript
   // User actions
   - user_login (email/wallet)
   - user_logout
   - user_signup
   - email_verified
   - 2fa_enabled
   - 2fa_verified
   
   // Market interactions
   - market_viewed
   - market_searched
   - bet_placed
   - bet_attempted (with error type)
   - market_filtered
   - market_sorted
   
   // Portfolio
   - portfolio_viewed
   - winnings_claimed
   - transaction_history_viewed
   
   // Social
   - referral_code_shared
   - achievement_unlocked
   - leaderboard_viewed
   
   // Content
   - page_viewed
   - component_error
   - api_error (with error code)
   ```

2. **Analytics Service Pattern:**
   ```typescript
   // Frontend analytics.ts
   export class AnalyticsService {
     private static instance: AnalyticsService;
     private sessionId: string;

     static getInstance() {
       if (!this.instance) {
         this.instance = new AnalyticsService();
       }
       return this.instance;
     }

     track(eventType: string, properties?: Record<string, any>) {
       const event = {
         type: eventType,
         timestamp: new Date().toISOString(),
         sessionId: this.sessionId,
         properties: properties || {},
       };
       
       // Send to multiple platforms
       this.sendToSegment(event);
       this.sendToAmplitude(event);
       this.sendToBackend(event);
     }

     private async sendToBackend(event: Event) {
       fetch(`${API_BASE}/analytics/events`, {
         method: 'POST',
         body: JSON.stringify(event),
         headers: { 'Authorization': `Bearer ${token}` },
       });
     }
   }

   // Usage in components
   const analytics = AnalyticsService.getInstance();
   analytics.track('bet_placed', { marketId, amount, odds });
   ```

3. **Session Management:**
   - Generate session ID on app load
   - Store in `sessionStorage` (cleared on tab close)
   - Track page duration, bounce rate, flow
   - Send summary to backend on logout

4. **Platform Integrations:**
   - **Google Analytics 4:** Page views, events, e-commerce
   - **Mixpanel/Amplitude:** Funnel analysis, user cohorts, retention
   - **PostHog:** Session recording, feature flags, experiments
   - **Backend:** Direct database storage for internal dashboards

### Implementation Priority: **HIGH**
- Required for understanding user behavior
- Can be implemented incrementally (platform by platform)
- Expected effort: **8-10 days** (depends on platform count)

---

## Feature 4: Secure Authentication State Management

### Current State Assessment

**What Exists (Backend):**
- ✅ JWT-based auth service with access + refresh tokens
- ✅ 2FA support (TOTP) with encryption
- ✅ Password reset with single-use tokens
- ✅ Email verification flow
- ✅ Session revocation (session_version tracking)
- ✅ Refresh token stored in Redis (revocation on logout)
- ✅ Token type separation (access, refresh, temp_2fa, password_reset)

**What Exists (Frontend):**
- ❌ No token storage strategy (no localStorage/sessionStorage access shown)
- ❌ No token refresh mechanism
- ❌ No auth context or provider
- ❌ No logout handling
- ❌ No session persistence
- ❌ No token expiration handling
- ❌ No 2FA flow on client side
- ❌ Wallet integration but no session management

### Dependencies to Add

**Frontend (package.json):**
```json
{
  "js-cookie": "^3.0.5",
  "axios": "^1.6.0",
  "axios-retry": "^3.8.0"
}
```

### Key Files to Create/Modify

**Frontend:**
```
frontend/src/
├── services/
│   ├── authService.ts            # NEW: Auth API calls
│   ├── tokenManager.ts           # NEW: Token storage and refresh
│   └── sessionManager.ts         # NEW: Session lifecycle
├── store/
│   ├── index.ts                  # (existing - Zustand)
│   └── authStore.ts              # NEW: Auth state slice
├── providers/
│   ├── AuthProvider.tsx          # NEW: Auth context wrapper
│   └── ProtectedRoute.tsx        # NEW: Route guard component
├── hooks/
│   ├── useAuth.ts                # NEW: Auth state hook
│   ├── useLogin.ts               # NEW: Login mutation
│   ├── useRegister.ts            # NEW: Register mutation
│   ├── useRefreshToken.ts        # NEW: Token refresh hook
│   ├── useLogout.ts              # NEW: Logout mutation
│   └── use2FA.ts                 # NEW: 2FA flow hook
├── components/
│   ├── LoginPage.tsx             # MODIFY: Integrate auth flow
│   ├── RegisterPage.tsx          # MODIFY: Integrate auth flow
│   ├── 2FASetup.tsx              # NEW: 2FA setup modal
│   ├── 2FAVerify.tsx             # NEW: 2FA verification modal
│   └── LogoutButton.tsx          # NEW: Logout UI
└── middleware/
    └── authMiddleware.ts         # NEW: Axios interceptors
```

**Backend (modifications):**
```
backend/src/
├── routes/
│   └── auth.routes.ts            # MODIFY: Add endpoints
├── services/
│   └── auth.service.ts           # (already exists - excellent!)
└── middleware/
    └── auth.middleware.ts        # MODIFY: Enhance token handling
```

### Implementation: Token Management Strategy

**Store Locations:**
```typescript
// SECURE STRATEGY:
// - accessToken: memory (lost on page refresh - requires re-login)
// - refreshToken: httpOnly cookie (automatically sent with requests)
// - sessionId: sessionStorage (cleared on tab close)

// ALTERNATIVE (less secure):
// - both tokens: sessionStorage (cleared on tab close)
// - DO NOT use localStorage for tokens (persistent = more risk)

// Recommended: HYBRID
// - accessToken: memory + sessionStorage as backup
// - refreshToken: httpOnly cookie (backend sets on login)
// - sessionId: sessionStorage for tracking
```

### Key Files to Create

**frontend/src/services/tokenManager.ts:**
```typescript
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'bankerchanger_access_token';
  private static readonly SESSION_ID_KEY = 'bankerchanger_session_id';

  static getAccessToken(): string | null {
    // Try memory first (if available)
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
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

  // Refresh token is handled by httpOnly cookie - no JS access needed
  // This is set by backend in Set-Cookie header

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
}
```

**frontend/src/store/authStore.ts:**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthState {
  // Auth state
  user: { id: string; email: string; role: 'user' | 'admin' } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 2FA state
  requires2FA: boolean;
  tempToken: string | null;

  // Actions
  setUser: (user: AuthState['user']) => void;
  setAuthenticated: (value: boolean) => void;
  clearAuth: () => void;
  setError: (error: string | null) => void;
  set2FARequired: (tempToken: string) => void;
  clear2FA: () => void;
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
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      setError: (error) => set({ error }),
      set2FARequired: (tempToken) => set({ requires2FA: true, tempToken }),
      clear2FA: () => set({ requires2FA: false, tempToken: null }),
    }),
    { name: 'AuthStore' },
  ),
);
```

**frontend/src/services/authService.ts:**
```typescript
import { TokenManager } from './tokenManager';

export class AuthService {
  static async register(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> {
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
  ): Promise<{ accessToken: string; refreshToken: string } | { requires2FA: true; tempToken: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies (refresh token)
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }

    const data = await res.json();

    if ('requires2FA' in data) {
      return data;
    }

    // Store access token in sessionStorage
    TokenManager.setAccessToken(data.accessToken);
    // refreshToken is in httpOnly cookie, handled by browser

    return data;
  }

  static async refreshAccessToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Include refresh token cookie
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const { accessToken } = await res.json();
    TokenManager.setAccessToken(accessToken);
    return accessToken;
  }

  static async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send refresh token cookie
    });

    TokenManager.clearAccessToken();
  }

  static async verify2FA(tempToken: string, otp: string): Promise<{ accessToken: string }> {
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
    return { accessToken };
  }
}
```

**frontend/src/middleware/authMiddleware.ts (Axios Interceptors):**
```typescript
import axios from 'axios';
import { TokenManager } from '../services/tokenManager';
import { AuthService } from '../services/authService';

export function setupAuthInterceptors() {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // Include cookies
  });

  // Request interceptor: Add access token to headers
  client.interceptors.request.use((config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: Handle 401 and refresh token
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If 401 and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await AuthService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - redirect to login
          window.location.href = '/login';
          throw refreshError;
        }
      }

      throw error;
    },
  );

  return client;
}
```

**frontend/src/providers/AuthProvider.tsx:**
```typescript
'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { TokenManager } from '../services/tokenManager';
import { AuthService } from '../services/authService';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setAuthenticated, setError } = useAuthStore();

  useEffect(() => {
    // On app load, check if token exists and is valid
    const token = TokenManager.getAccessToken();
    if (token && !TokenManager.isTokenExpired(token)) {
      // User session restored - decode token to get user info
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: decoded.sub, email: decoded.email, role: decoded.role });
        setAuthenticated(true);
      } catch (err) {
        setError('Failed to restore session');
        TokenManager.clearAccessToken();
      }
    }
  }, []);

  return <>{children}</>;
}
```

**frontend/src/hooks/useAuth.ts:**
```typescript
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../services/authService';

export function useLogin() {
  const { setUser, setAuthenticated, set2FARequired, setError } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      AuthService.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      if ('requires2FA' in data) {
        set2FARequired(data.tempToken);
      } else {
        // Normally we'd fetch user details from token or /auth/me endpoint
        setUser({ id: '', email: '', role: 'user' });
        setAuthenticated(true);
      }
    },
    onError: (error) => setError((error as Error).message),
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => clearAuth(),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: () => AuthService.refreshAccessToken(),
  });
}
```

### Backend Endpoints (Already Exist - Reference)

```typescript
// auth.routes.ts - Already fully implemented!
POST   /auth/register              → register()
POST   /auth/login                 → login()
POST   /auth/refresh               → refreshAccessToken()
POST   /auth/logout                → logout()
POST   /auth/forgot-password       → forgotPassword()
POST   /auth/reset-password        → resetPassword()
POST   /auth/2fa/setup             → setup2FA()
POST   /auth/2fa/enable            → enable2FA()
POST   /auth/2fa/disable           → disable2FA()
POST   /auth/2fa/verify            → verify2FA()
```

### Integration Points

1. **Protected Routes:**
   ```typescript
   // app/middleware.ts (Next.js middleware)
   import { NextRequest, NextResponse } from 'next/server';

   const protectedPaths = ['/portfolio', '/transactions', '/watchlist'];

   export function middleware(req: NextRequest) {
     const token = req.cookies.get('accessToken');
     
     if (protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
       if (!token) {
         return NextResponse.redirect(new URL('/login', req.url));
       }
     }

     return NextResponse.next();
   }
   ```

2. **API Service Integration:**
   - Use axios client from authMiddleware
   - Automatically includes auth token in all requests
   - Handles token refresh transparently

3. **Logout on Multiple Tabs:**
   ```typescript
   // Listen for logout from other tabs
   window.addEventListener('storage', (e) => {
     if (e.key === 'bankerchanger_logout') {
       useAuthStore.getState().clearAuth();
       window.location.href = '/login';
     }
   });
   ```

4. **Session Timeout:**
   ```typescript
   // Auto-logout after inactivity
   let timeoutId: NodeJS.Timeout;

   function resetInactivityTimer() {
     clearTimeout(timeoutId);
     timeoutId = setTimeout(() => {
       AuthService.logout();
       useAuthStore.getState().clearAuth();
     }, 15 * 60 * 1000); // 15 minutes
   }

   // Reset on user activity
   ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
     document.addEventListener(event, resetInactivityTimer);
   });
   ```

### Implementation Priority: **CRITICAL**
- Foundational for security and user experience
- Already 90% implemented on backend
- Expected effort: **5-6 days**

---

## Implementation Timeline & Sequencing

### Phase 1: Foundation (Days 1-6)
**Priority:** Auth State Management
- Backend is ready; focus on frontend
- Needed before features 2 and 3
- Deliverable: Login/logout flow, token refresh, 2FA

### Phase 2: Data Validation (Days 7-14)
**Priority:** Validation System
- Build on top of Phase 1 auth
- Required for secure user interactions
- Deliverable: Form validation, async validators, error handling

### Phase 3: User Experience (Days 15-25)
**Priority:** Multi-Language & Analytics
- Phase 1 (auth) provides user context for analytics
- Phase 2 (validation) provides form feedback for localization
- Deliverable: i18n system, event tracking, session management

---

## Cross-Feature Integration Map

```
┌─────────────────────────────────────────────────────────┐
│          FEATURE DEPENDENCY GRAPH                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  AUTH STATE MANAGEMENT (Feature 4)                      │
│         ↓                                                │
│  ┌──────────────────────────────────────┐               │
│  │ Required by:                          │               │
│  ├──────────────────────────────────────┤               │
│  │ • Feature 2: Validation               │               │
│  │   (needs user context for async      │               │
│  │    validation like email uniqueness) │               │
│  │                                      │               │
│  │ • Feature 3: Analytics               │               │
│  │   (needs userId for event tracking)  │               │
│  │                                      │               │
│  │ • Feature 1: i18n                    │               │
│  │   (optional: saves language pref     │               │
│  │    to backend user record)           │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  VALIDATION SYSTEM (Feature 2)                          │
│         ↓                                                │
│  ┌──────────────────────────────────────┐               │
│  │ Integrates with:                      │               │
│  ├──────────────────────────────────────┤               │
│  │ • i18n (Feature 1)                   │               │
│  │   (error messages in chosen language)│               │
│  │                                      │               │
│  │ • Analytics (Feature 3)              │               │
│  │   (track validation failures)        │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  ANALYTICS & i18n (Features 3 & 1)                      │
│         ↓                                                │
│  Standalone (after Phase 1 & 2)                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Recommended Implementation Order:
1. **Feature 4 (Auth)** → Foundation for everything
2. **Feature 2 (Validation)** → Better UX, works with auth
3. **Feature 1 (i18n)** → For global reach, strings are many
4. **Feature 3 (Analytics)** → Measure impact of improvements

---

## Risk Assessment & Mitigation

| Feature | Risk | Mitigation |
|---------|------|-----------|
| **Auth State** | Token theft via XSS | Use httpOnly cookies for refresh token, sessionStorage for access token (cleared on logout) |
| **Auth State** | Race conditions on token refresh | Use Axios interceptor queue to serialize refresh requests |
| **Validation** | Breaking existing forms | Implement gradually; keep old validation until new system ready |
| **i18n** | String count explosion | Start with English + Spanish, use key-based translation (not full translation upfront) |
| **Analytics** | Privacy concerns | Don't track sensitive data (passwords, amounts), use aggregate analytics |
| **Analytics** | Excessive data bloat | Archive old events, implement retention policies |

---

## Testing Strategy

### Auth State Management
- Unit tests: TokenManager, authStore
- Integration tests: Login flow with mock API
- E2E tests: Full login → refresh → logout cycle

### Validation System
- Unit tests: Each custom validator
- Integration tests: Form submission with errors
- E2E tests: Invalid input handling

### i18n
- Unit tests: Date/currency formatting
- Integration tests: Language switching
- Visual regression: RTL layout

### Analytics
- Unit tests: Event serialization
- Integration tests: Event queuing and batching
- E2E tests: Session tracking across pages

---

## Deployment Considerations

### Environment Variables to Add

**Frontend (.env.local):**
```bash
# Auth
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_TIMEOUT=15m

# i18n
NEXT_PUBLIC_FALLBACK_LANGUAGE=en
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,es,fr,ar

# Analytics
NEXT_PUBLIC_ANALYTICS_KEY=...
NEXT_PUBLIC_SEGMENT_WRITE_KEY=...
NEXT_PUBLIC_AMPLITUDE_KEY=...
```

**Backend (.env):**
```bash
# Auth
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_TEMP_SECRET=...
JWT_RESET_SECRET=...
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d

# i18n
SUPPORTED_LANGUAGES=en,es,fr,ar
FALLBACK_LANGUAGE=en

# Analytics
ANALYTICS_DATABASE_ENABLED=true
EVENT_RETENTION_DAYS=90
```

---

## Success Metrics

- **Auth State:** <100ms token refresh, 0% silent auth failures
- **Validation:** <200ms async validator response, 100% coverage
- **i18n:** 95%+ strings translated, support 4+ languages
- **Analytics:** 99% event delivery, <5s delay

---

## Appendix: File Structure Summary

```
StellarFox/
├── frontend/
│   └── src/
│       ├── i18n/                    # Feature 1
│       ├── schemas/                 # Feature 2
│       ├── services/
│       │   ├── analytics.ts         # Feature 3
│       │   ├── authService.ts       # Feature 4
│       │   ├── eventTracker.ts      # Feature 3
│       │   ├── sessionManager.ts    # Features 3 & 4
│       │   └── tokenManager.ts      # Feature 4
│       ├── store/
│       │   ├── authStore.ts         # Feature 4
│       │   └── analyticsStore.ts    # Feature 3
│       ├── hooks/
│       │   ├── useAuth.ts           # Feature 4
│       │   ├── useValidation.ts     # Feature 2
│       │   ├── useLanguage.ts       # Feature 1
│       │   └── useAnalytics.ts      # Feature 3
│       ├── providers/
│       │   ├── AuthProvider.tsx     # Feature 4
│       │   ├── LanguageProvider.tsx # Feature 1
│       │   └── AnalyticsProvider.tsx# Feature 3
│       └── middleware/
│           └── authMiddleware.ts    # Feature 4
│
└── backend/
    └── src/
        ├── i18n/                    # Feature 1
        ├── validators/              # Feature 2
        ├── services/
        │   ├── analytics.service.ts # Feature 3
        │   └── auth.service.ts      # Feature 4 (already exists)
        ├── schemas/
        │   ├── auth.schemas.ts      # Feature 2 & 4
        │   └── validation.schemas.ts# Feature 2
        └── routes/
            └── analytics.routes.ts  # Feature 3
```

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Prepared for:** StellarFox Development Team
