# Feature Implementation Checklist

Quick reference for implementing the four features. Use alongside FEATURE_IMPLEMENTATION_ROADMAP.md.

---

## Feature 1: Multi-Language Support (i18n)

### Dependencies
- [ ] Install `next-intl` or `i18next`
- [ ] Install `date-fns` for date formatting
- [ ] Install `numeral` or Intl.NumberFormat for currency

### Frontend Files to Create
- [ ] `frontend/src/i18n/config.ts` - i18n initialization
- [ ] `frontend/src/i18n/locales/en.json` - English strings
- [ ] `frontend/src/i18n/locales/es.json` - Spanish strings
- [ ] `frontend/src/i18n/locales/fr.json` - French strings
- [ ] `frontend/src/i18n/locales/ar.json` - Arabic (RTL)
- [ ] `frontend/src/i18n/dateFormatter.ts` - Locale-aware dates
- [ ] `frontend/src/i18n/currencyFormatter.ts` - Locale-aware currency
- [ ] `frontend/src/providers/LanguageProvider.tsx` - Language context
- [ ] `frontend/src/components/LanguageSwitcher.tsx` - UI component
- [ ] `frontend/src/hooks/useLanguage.ts` - Language hook
- [ ] `frontend/src/utils/rtlSupport.ts` - RTL CSS utilities

### Frontend Files to Modify
- [ ] `frontend/src/app/layout.tsx` - Wrap with LanguageProvider, add lang/dir
- [ ] `frontend/src/app/page.tsx` - Replace hardcoded strings with t()
- [ ] All component files - Replace strings with translations
- [ ] `frontend/src/services/api.ts` - Add Accept-Language header

### Backend Files to Modify
- [ ] `backend/src/db/schema.ts` - Add `preferred_language` to users table
- [ ] `backend/src/services/auth.service.ts` - Save language on signup
- [ ] Error response formatters - Localize error messages

### Testing
- [ ] Unit test: Date formatting for different locales
- [ ] Unit test: Currency formatting for different locales
- [ ] Integration test: Language switching
- [ ] E2E test: Page renders correctly in RTL

### Deployment
- [ ] Add `NEXT_PUBLIC_SUPPORTED_LANGUAGES` env var
- [ ] Add `NEXT_PUBLIC_FALLBACK_LANGUAGE` env var
- [ ] Add translation files to build output

---

## Feature 2: Comprehensive Validation System

### Dependencies
- [ ] Install `react-hook-form`
- [ ] Install `zod` (already in backend)
- [ ] Install `@hookform/resolvers`

### Frontend Files to Create
- [ ] `frontend/src/schemas/auth.schemas.ts` - Auth form schemas
- [ ] `frontend/src/schemas/market.schemas.ts` - Market form schemas
- [ ] `frontend/src/hooks/useValidation.ts` - Form validation hook
- [ ] `frontend/src/hooks/useAsyncValidation.ts` - Async validator hook
- [ ] `frontend/src/components/forms/FormField.tsx` - Reusable field
- [ ] `frontend/src/components/forms/FormError.tsx` - Error display
- [ ] `frontend/src/utils/validationUtils.ts` - Custom validators

### Frontend Files to Modify
- [ ] `frontend/src/components/forms/LoginForm.tsx` - Add react-hook-form
- [ ] `frontend/src/components/forms/RegisterForm.tsx` - Add react-hook-form
- [ ] `frontend/src/components/bet/BetForm.tsx` - Add react-hook-form
- [ ] Any form component - Use FormField wrapper

### Backend Files to Create
- [ ] `backend/src/validators/customRules.ts` - Custom validation rules
- [ ] `backend/src/validators/asyncValidators.ts` - Async validation functions
- [ ] `backend/src/validators/errorMessages.ts` - Localized error messages

### Backend Files to Modify
- [ ] `backend/src/schemas/validation.schemas.ts` - Enhance schemas
- [ ] `backend/src/middleware/validation.middleware.ts` - Improve errors
- [ ] `backend/src/routes/auth.routes.ts` - Return structured errors

### Async Validators to Implement
- [ ] Email uniqueness check
- [ ] Username availability check
- [ ] Stellar address validation
- [ ] Password strength check

### Testing
- [ ] Unit test: Each custom validator
- [ ] Unit test: Password strength rules
- [ ] Integration test: Form with valid/invalid data
- [ ] Integration test: Async validators (email uniqueness)
- [ ] E2E test: Real form submission

### Deployment
- [ ] No new env vars needed
- [ ] Error messages correctly localized

---

## Feature 3: Event-Based Analytics Tracking

### Dependencies
- [ ] Install `@segment/analytics-next` (or Amplitude/PostHog)
- [ ] (Backend) Already has pino logger and winston

### Frontend Files to Create
- [ ] `frontend/src/services/analytics.ts` - Analytics service wrapper
- [ ] `frontend/src/services/eventTracker.ts` - Event emission system
- [ ] `frontend/src/services/sessionManager.ts` - Session lifecycle
- [ ] `frontend/src/providers/AnalyticsProvider.tsx` - Analytics wrapper
- [ ] `frontend/src/providers/SessionProvider.tsx` - Session context
- [ ] `frontend/src/hooks/useAnalytics.ts` - Track events hook
- [ ] `frontend/src/hooks/useSessionTracking.ts` - Auto-track hook
- [ ] `frontend/src/config/analytics.config.ts` - Configuration

### Backend Files to Create
- [ ] `backend/src/services/analytics.service.ts` - Backend analytics
- [ ] `backend/src/routes/analytics.routes.ts` - Analytics endpoints
- [ ] `backend/src/schemas/analytics.schemas.ts` - Event schemas

### Backend Database Tables to Create
```sql
CREATE TABLE user_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_sessions_analytics (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  total_events INTEGER DEFAULT 0,
  pages_visited INTEGER DEFAULT 0
);
```

### Events to Track
- [ ] User auth events (login, logout, signup, 2FA)
- [ ] Market events (viewed, searched, filtered)
- [ ] Bet events (placed, error)
- [ ] Portfolio events (viewed, claim winnings)
- [ ] Social events (referral shared, achievement unlocked)
- [ ] Page views
- [ ] Errors (component, API, validation)

### Integration Points
- [ ] Analytics initialization in app layout
- [ ] Event tracking in key components
- [ ] Session ID generation and tracking
- [ ] Error logging integration

### Analytics Platforms (Choose 1+)
- [ ] Google Analytics 4
- [ ] Mixpanel
- [ ] Amplitude
- [ ] PostHog
- [ ] Backend database (always log)

### Testing
- [ ] Unit test: Event serialization
- [ ] Integration test: Event tracking in components
- [ ] Integration test: Session lifecycle
- [ ] E2E test: Events sent to backend

### Deployment
- [ ] Add `NEXT_PUBLIC_ANALYTICS_KEY` for chosen platform
- [ ] Add `NEXT_PUBLIC_SEGMENT_WRITE_KEY` if using Segment
- [ ] Configure backend event retention policy
- [ ] Set up event archival process

---

## Feature 4: Secure Authentication State Management

### Dependencies
- [ ] Install `js-cookie`
- [ ] Install `axios`
- [ ] Install `axios-retry` (optional, for retry logic)

### Frontend Files to Create
- [ ] `frontend/src/services/tokenManager.ts` - Token storage/retrieval
- [ ] `frontend/src/services/authService.ts` - Auth API calls
- [ ] `frontend/src/store/authStore.ts` - Zustand auth state
- [ ] `frontend/src/providers/AuthProvider.tsx` - Auth context
- [ ] `frontend/src/hooks/useAuth.ts` - Auth state hook
- [ ] `frontend/src/hooks/useLogin.ts` - Login mutation
- [ ] `frontend/src/hooks/useRegister.ts` - Register mutation
- [ ] `frontend/src/hooks/useLogout.ts` - Logout mutation
- [ ] `frontend/src/hooks/useRefreshToken.ts` - Token refresh hook
- [ ] `frontend/src/hooks/use2FA.ts` - 2FA flow hook
- [ ] `frontend/src/middleware/authMiddleware.ts` - Axios interceptors
- [ ] `frontend/src/components/LogoutButton.tsx` - Logout UI
- [ ] `frontend/src/components/auth/2FASetup.tsx` - 2FA setup modal
- [ ] `frontend/src/components/auth/2FAVerify.tsx` - 2FA verify modal

### Frontend Files to Modify
- [ ] `frontend/src/app/layout.tsx` - Wrap with AuthProvider
- [ ] `frontend/src/app/page.tsx` - Add login/register links
- [ ] `frontend/src/services/api.ts` - Use auth-enabled axios client
- [ ] `frontend/src/components/layout/Header.tsx` - Add user menu
- [ ] `frontend/src/components/layout/WalletButton.tsx` - Integrate auth

### Backend Files Already Complete ✅
- [x] `backend/src/services/auth.service.ts` - Full implementation
- [x] `backend/src/routes/auth.routes.ts` - All endpoints
- [x] `backend/src/middleware/auth.middleware.ts` - JWT verification

### Backend Enhancements (Optional)
- [ ] `backend/src/routes/auth.routes.ts` - Add `/auth/me` endpoint
- [ ] `backend/src/middleware/auth.middleware.ts` - Add session revocation check
- [ ] Rate limiting on auth endpoints

### Token Strategy
- [ ] Access token: sessionStorage (cleared on logout)
- [ ] Refresh token: httpOnly cookie (automatically managed)
- [ ] Session ID: sessionStorage (for analytics)

### Authentication Flows to Implement
- [ ] Email/password login
- [ ] Email/password registration
- [ ] 2FA setup (QR code + verification)
- [ ] 2FA verification at login
- [ ] Token refresh on 401
- [ ] Logout
- [ ] Password reset flow
- [ ] Session persistence

### Protected Routes
- [ ] `/portfolio` - Requires auth
- [ ] `/transactions` - Requires auth
- [ ] `/watchlist` - Requires auth
- [ ] `/account` - Requires auth
- [ ] `/admin/*` - Requires admin role

### Session Management
- [ ] Auto-logout after 15 min inactivity
- [ ] Session sync across tabs
- [ ] Logout on password change
- [ ] Clear tokens on logout

### Testing
- [ ] Unit test: TokenManager storage/retrieval
- [ ] Unit test: authStore mutations
- [ ] Integration test: Login → protected route
- [ ] Integration test: Token refresh on 401
- [ ] Integration test: Logout
- [ ] Integration test: 2FA flow
- [ ] E2E test: Full auth lifecycle

### Deployment
- [ ] Set `NEXT_PUBLIC_API_URL` correctly
- [ ] Backend sets `httpOnly` cookies
- [ ] Backend sets `Secure` flag on cookies (HTTPS only)
- [ ] Backend sets `SameSite=Strict` on cookies
- [ ] CORS allows credentials

### Security Checklist
- [ ] Refresh token in httpOnly cookie ✓
- [ ] Access token not persisted long-term ✓
- [ ] Session timeout after inactivity ✓
- [ ] CSRF protection via SameSite cookies ✓
- [ ] XSS protection: no token in localStorage ✓
- [ ] Token validation on every request ✓
- [ ] Session version bump on password reset ✓

---

## Cross-Feature Integration Checklist

### Feature 2 + Feature 4 (Validation + Auth)
- [ ] Auth form validation works
- [ ] Async validators check email uniqueness
- [ ] Error messages display correctly
- [ ] Form rejects invalid input before API call

### Feature 1 + Feature 2 (i18n + Validation)
- [ ] Error messages are translated
- [ ] Form labels are translated
- [ ] Validation rules respect locale (email, phone format)

### Feature 1 + Feature 4 (i18n + Auth)
- [ ] Language preference saved to backend user record
- [ ] Language preference persisted across sessions
- [ ] Auth pages render in selected language

### Feature 3 + Feature 4 (Analytics + Auth)
- [ ] Auth events tracked (login, logout, 2FA)
- [ ] User ID attached to all analytics events
- [ ] Sessions tracked correctly

### All Features Together
- [ ] User can login (Feature 4)
- [ ] Form validates (Feature 2)
- [ ] Events are tracked (Feature 3)
- [ ] UI is translated (Feature 1)
- [ ] User language preference persists (Features 1 + 4)

---

## Implementation Tips

### Quick Wins (Start Here)
1. **Feature 4:** Copy tokenManager.ts code from ROADMAP
2. **Feature 4:** Use existing auth.service.ts as template
3. **Feature 2:** Reuse existing backend Zod schemas
4. **Feature 1:** Start with just English + 1 other language

### Avoid These Mistakes
- ❌ Store tokens in localStorage (use sessionStorage or cookies)
- ❌ Hardcode API URLs in components (use env vars)
- ❌ Skip testing for auth (security critical)
- ❌ Translate strings without key structure (use i18n keys)
- ❌ Track sensitive data in analytics (passwords, amounts)

### Testing Priorities
1. Auth flow (security critical)
2. Token refresh (reliability)
3. Logout (security)
4. Async validation (UX critical)
5. i18n rendering (global reach)

### Git Workflow
```bash
# Feature branch per feature
git checkout -b feature/auth-state-management
git checkout -b feature/validation-system
git checkout -b feature/analytics-tracking
git checkout -b feature/i18n-support

# Commit frequently with meaningful messages
git commit -m "feat(auth): add token manager service"
git commit -m "feat(validation): add react-hook-form integration"
```

### Code Review Focus Areas
- **Auth:** Token security, CORS, cookie settings
- **Validation:** Schema coverage, error messages
- **Analytics:** No sensitive data, batch efficiency
- **i18n:** String coverage, RTL rendering

---

## Timeline Estimate

| Feature | Effort | Days | Start |
|---------|--------|------|-------|
| **Feature 4: Auth State** | 20 hrs | 5-6 | Day 1 |
| **Feature 2: Validation** | 25 hrs | 6-8 | Day 7 |
| **Feature 1: i18n** | 20 hrs | 5-7 | Day 15 |
| **Feature 3: Analytics** | 25 hrs | 6-8 | Day 22 |
| **Testing & QA** | 15 hrs | 3-4 | Ongoing |
| **Documentation** | 10 hrs | 2-3 | Ongoing |
| **TOTAL** | 115 hrs | 28-36 days | — |

**With parallel work:** 20-25 days  
**With full-time team:** 2-3 weeks per feature

---

## Success Criteria

- [ ] All 4 features fully implemented
- [ ] 100% test coverage for auth (security critical)
- [ ] 95%+ strings translated (at least 3 languages)
- [ ] 0% silent auth failures
- [ ] <100ms token refresh
- [ ] <200ms async validation response
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities
- [ ] All PRs reviewed and merged
- [ ] Documentation complete
