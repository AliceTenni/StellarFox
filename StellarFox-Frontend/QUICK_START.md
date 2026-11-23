# Quick Start Guide - Four Fixes Implementation

## Installation

```bash
# Navigate to project directory
cd /workspaces/StellarFox/StellarFox-Frontend

# Install dependencies (with legacy peer deps for compatibility)
npm install --legacy-peer-deps

# Start development server
npm run dev

# In another terminal, view components in Storybook
npm run storybook
```

## Issue 1: Web Vitals Monitoring

**What it does**: Automatically tracks page performance metrics and sends them to analytics.

**Quick Start**:
```typescript
// Already integrated in layout.tsx via AnalyticsProvider
// Just use the hook in any component:

import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

export function MyComponent() {
  usePerformanceMetrics('MyComponent');
  return <div>Content</div>;
}
```

**Files**:
- `src/lib/vitals.ts` - Core monitoring
- `src/hooks/usePerformanceMetrics.ts` - React hook
- `src/providers/AnalyticsProvider.tsx` - Provider wrapper
- `src/app/layout.tsx` - Already integrated

**Configure**: Set `NEXT_PUBLIC_SENTRY_DSN` env variable for error tracking

---

## Issue 2: Bundle Size Optimization

**What it does**: Automatically splits code into smaller chunks and lazy loads heavy components.

**Quick Start**:
```typescript
// Lazy load heavy components
import { createDynamicComponent } from '@/lib/dynamicImports';

const DataTable = createDynamicComponent(
  () => import('@/components/DataTable'),
  { loading: LoadingSpinner }
);

// Analyze bundle size
npm run analyze
```

**Files**:
- `src/lib/dynamicImports.ts` - Import utilities
- `src/lib/bundleOptimization.ts` - Configuration
- `next.config.js` - Webpack optimization

**Key Features**:
- Automatic React vendor chunking
- Stellar SDK chunking
- Animation library chunking
- Route-based code splitting
- Performance budgets defined

---

## Issue 3: Storybook Component Library

**What it does**: Provides a visual component library with documentation and examples.

**Quick Start**:
```bash
# Start Storybook
npm run storybook

# Browse components at http://localhost:6006
# View Button, Card, and Animation components
# Check accessibility features and responsive design
```

**Files**:
- `.storybook/main.ts` - Storybook config
- `.storybook/preview.ts` - Preview config
- `src/stories/Button.stories.tsx` - Button examples
- `src/stories/Card.stories.tsx` - Card examples
- `src/stories/Animations.stories.tsx` - Animation examples
- `docs/DESIGN_SYSTEM.md` - Design system guide

**Components**:
- **Button**: Primary interactive element
- **Card**: Content container
- **Animations**: Page transitions, loading spinners, hover effects

---

## Issue 4: Framer Motion Animations

**What it does**: Adds smooth, accessible animations throughout the app.

**Quick Start**:
```typescript
// Page transitions
import { PageTransition } from '@/components/animations/PageTransition';

export default function Page() {
  return (
    <PageTransition variant="slideInFromLeft">
      <div>Your content</div>
    </PageTransition>
  );
}

// Card hover effects
import { CardHover } from '@/components/animations/CardHover';

export function Card() {
  return (
    <CardHover effect="lift">
      <div>Hover me!</div>
    </CardHover>
  );
}

// Loading animation
import { LoadingAnimation } from '@/components/animations/LoadingAnimation';

export function Loading() {
  return <LoadingAnimation variant="spinner" size="md" />;
}

// Respect user motion preferences
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Custom() {
  const prefersReducedMotion = useReducedMotion();
  // Use this to conditionally disable animations
}
```

**Files**:
- `src/lib/animationConfig.ts` - Animation presets
- `src/hooks/useReducedMotion.ts` - Accessibility hook
- `src/components/animations/PageTransition.tsx` - Page animations
- `src/components/animations/LoadingAnimation.tsx` - Loading spinner
- `src/components/animations/CardHover.tsx` - Hover effects
- `src/stories/Animations.stories.tsx` - Examples in Storybook

**Animation Variants**:

PageTransition:
- `fadeIn` - Fade in and out
- `slideInFromLeft` - Slide from left
- `slideInFromRight` - Slide from right
- `slideInFromTop` - Slide from top
- `slideInFromBottom` - Slide from bottom
- `scaleIn` - Scale from small to full
- `expandIn` - Expand effect

CardHover:
- `lift` - Card lifts on hover
- `scale` - Card scales up
- `glow` - Card gets glow effect
- `brighten` - Card brightens
- `shimmer` - Shimmer effect

LoadingAnimation:
- `spinner` - Spinning loader
- `pulse` - Pulsing animation
- `bounce` - Bouncing dots
- `dots` - Three bouncing dots
- `shimmer` - Shimmer skeleton

---

## Development Workflow

### 1. Creating New Components

```typescript
// Use Button.stories.tsx as template
// Create component in src/components/
// Add TypeScript types
// Create Storybook story in src/stories/
// Test accessibility in Storybook
```

### 2. Adding Animations

```typescript
// Use existing animation presets from animationConfig.ts
// Wrap with PageTransition for page-level animations
// Use CardHover for interactive elements
// Always wrap with motion preference hook for accessibility
```

### 3. Performance Monitoring

```typescript
// Add usePerformanceMetrics hook to track render time
// Check analytics events in browser console (dev mode)
// Monitor with npm run analyze for bundle size
// Check Core Web Vitals metrics
```

### 4. Lazy Loading Heavy Components

```typescript
// Use createDynamicComponent for components > 50KB
// Or lazyLoadComponent for simpler lazy loading
// Storybook stories work with lazy components automatically
```

---

## Common Tasks

### Check Bundle Size
```bash
npm run analyze
```

### View Components
```bash
npm run storybook
```

### Build for Production
```bash
npm run build
npm run start
```

### Build Storybook
```bash
npm run build:storybook
```

### Format Code
```bash
npm run format
```

### Run Tests
```bash
npm test
```

### Run E2E Tests
```bash
npm run test:e2e
```

---

## Accessibility Checklist

- [x] All interactive elements keyboard accessible
- [x] Proper ARIA labels for screen readers
- [x] Color contrast WCAG AA compliant
- [x] Motion preferences respected
- [x] Focus indicators visible
- [x] Skip links for navigation
- [x] Semantic HTML used throughout

---

## Performance Targets

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms
- JavaScript bundle: < 300 KB
- CSS bundle: < 50 KB

---

## Documentation

- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Checklist**: `IMPLEMENTATION_CHECKLIST.md`
- **This Guide**: `QUICK_START.md`

---

## Troubleshooting

### Dependencies not installing
```bash
npm install --legacy-peer-deps --force
```

### Storybook won't start
```bash
npm install --legacy-peer-deps
npm run storybook
```

### TypeScript errors in components
- Ensure files use `.tsx` extension for JSX components
- Use `.ts` for utility files without JSX
- Check `tsconfig.json` settings

### Animations not showing
- Check if `prefers-reduced-motion` is enabled
- Verify Framer Motion is installed
- Check browser console for errors

### Performance metrics not showing
- Check if Sentry DSN is configured
- Look in browser DevTools Network tab
- Check console for analytics events (dev mode)

---

## Support

Refer to individual file JSDoc comments for detailed API documentation.

Each component has Storybook examples showing all variants and usage patterns.

---

## Next Steps

1. [x] Install dependencies
2. [x] Start Storybook: `npm run storybook`
3. [x] Explore components
4. [x] Review Design System: `docs/DESIGN_SYSTEM.md`
5. [x] Start development server: `npm run dev`
6. [x] Add components to pages using lazy loading
7. [x] Monitor performance with web vitals
8. [ ] Configure Sentry for error tracking
9. [ ] Deploy to production

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-22  
**Status**: Production Ready ✅
