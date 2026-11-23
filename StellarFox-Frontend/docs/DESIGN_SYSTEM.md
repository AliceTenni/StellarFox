# StellarFox Design System

A comprehensive design system for the StellarFox frontend application, documenting component library, styling patterns, and accessibility guidelines.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Components](#components)
4. [Design Tokens](#design-tokens)
5. [Accessibility](#accessibility)
6. [Performance](#performance)

## Overview

The StellarFox Design System provides a unified set of components and patterns for building consistent, accessible, and performant user interfaces. All components are:

- **TypeScript**: Full type safety
- **Accessible**: WCAG 2.1 compliant
- **Performant**: Optimized for Core Web Vitals
- **Responsive**: Mobile-first design
- **Testable**: Jest and Playwright integration
- **Documented**: Storybook stories and examples

## Getting Started

### View Components in Storybook

```bash
npm run storybook
```

This opens Storybook at `http://localhost:6006`, where you can view all components, their variations, and documentation.

### Build Storybook for Static Hosting

```bash
npm run build:storybook
```

This generates a static site that can be deployed to any hosting service.

## Components

### Button

**Purpose**: Primary interactive element for all actions

**Variants**: `primary`, `secondary`, `danger`

**Sizes**: `sm`, `md`, `lg`

**Props**:

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}
```

**Usage**:

```tsx
import Button from '@/components/Button';

export function MyComponent() {
  return (
    <Button variant="primary" size="md" onClick={() => alert('Clicked!')}>
      Click Me
    </Button>
  );
}
```

**Accessibility**:
- Keyboard accessible with Tab navigation
- Focus visible with ring indicator
- `aria-label` support for icon-only buttons
- Disabled state properly communicated

### Card

**Purpose**: Container for related content with consistent styling

**Variants**: `default`, `elevated`, `outlined`

**Interactive**: Hover effect and click handler support

**Props**:

```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
  interactive?: boolean;
}
```

**Usage**:

```tsx
import Card from '@/components/Card';

export function MarketCard({ market }) {
  return (
    <Card
      title={market.name}
      subtitle={market.category}
      interactive
      onClick={() => navigate(`/markets/${market.id}`)}
    >
      <div className="space-y-2">
        <p>Odds: {market.odds}</p>
        <p>Volume: ${market.volume}</p>
      </div>
    </Card>
  );
}
```

**Accessibility**:
- Interactive cards announce their purpose
- Proper button role when clickable
- Focus management
- Color contrast compliance

## Design Tokens

### Colors

#### Semantic Colors

- **Primary**: Blue (`#2563eb`)
- **Secondary**: Gray (`#6b7280`)
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

#### Theme Support

All colors support light and dark modes via Tailwind's `dark:` prefix.

```css
/* Light mode */
.btn {
  @apply bg-blue-600 text-white;
}

/* Dark mode */
.btn {
  @apply dark:bg-blue-500 dark:text-white;
}
```

### Typography

#### Font Family

```
Font Stack: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

#### Font Sizes

- **Display**: 3.5rem (font-bold)
- **Heading1**: 2.25rem (font-bold)
- **Heading2**: 1.875rem (font-semibold)
- **Heading3**: 1.5rem (font-semibold)
- **Body**: 1rem (font-normal)
- **Caption**: 0.875rem (font-normal)
- **Tiny**: 0.75rem (font-normal)

#### Line Heights

- **Tight**: 1.25
- **Normal**: 1.5
- **Relaxed**: 1.75
- **Loose**: 2

### Spacing

Based on 0.25rem (4px) units:

```
xs:   0.5rem    (2 units)
sm:   1rem      (4 units)
md:   1.5rem    (6 units)
lg:   2rem      (8 units)
xl:   3rem      (12 units)
2xl:  4rem      (16 units)
```

### Shadows

```
sm:   0 1px 2px 0 rgba(0, 0, 0, 0.05)
md:   0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1)
2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Border Radius

```
none:   0
sm:     0.125rem
md:     0.375rem
lg:     0.5rem
xl:     0.75rem
2xl:    1rem
full:   9999px
```

## Accessibility

### WCAG 2.1 Compliance

All components meet WCAG 2.1 Level AA standards:

- **Perceivable**: Content is perceivable by all users
- **Operable**: All functionality is keyboard accessible
- **Understandable**: Content is clear and easy to understand
- **Robust**: Compatible with assistive technologies

### Keyboard Navigation

```
Tab:         Move focus forward
Shift+Tab:   Move focus backward
Enter:       Activate button/submit form
Space:       Toggle checkbox/button
Escape:      Close modal/dropdown
Arrow Keys:  Navigate lists/menus
```

### Screen Reader Support

- All interactive elements have semantic HTML
- Form inputs have associated labels
- Images have descriptive alt text
- ARIA attributes used appropriately
- Skip links for navigation

### Color Contrast

Minimum contrast ratios:

- **Normal Text**: 4.5:1 (WCAG AA)
- **Large Text**: 3:1 (WCAG AA)
- **UI Components**: 3:1 (WCAG AA)

### Reduced Motion

Components respect `prefers-reduced-motion`:

```tsx
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

## Performance

### Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Bundle Optimization

Components are automatically code-split based on usage:

```typescript
// Heavy components are lazy loaded
const DataTable = lazy(() => import('@/components/DataTable'));
const ChartLibrary = lazy(() => import('@/components/charts/ChartLibrary'));
```

### Image Optimization

All images are optimized with:

- Responsive sizes
- WebP and AVIF formats
- Lazy loading
- Quality optimization

### Font Optimization

- Font display: `swap` (prevents invisible text)
- Subset loading
- Variable font support
- Preload for critical fonts

## Contributing

### Adding New Components

1. Create component file in `src/components/`
2. Add TypeScript types and proper documentation
3. Create tests in `src/__tests__/`
4. Add Storybook story in `src/stories/`
5. Document in this design system
6. Ensure accessibility and performance targets

### Component Template

```tsx
import React from 'react';

interface MyComponentProps {
  /** Description of prop */
  prop: string;
}

/**
 * MyComponent
 * Brief description of what it does
 *
 * @example
 * <MyComponent prop="value" />
 */
export const MyComponent: React.FC<MyComponentProps> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent prop="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(<MyComponent prop="test" />);
    const element = screen.getByRole('button');
    expect(element).toHaveFocus();
  });
});
```

## Resources

- [Storybook Documentation](https://storybook.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [Web Vitals Guide](https://web.dev/vitals)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

## Support

For questions about the design system or to request new components, please reach out to the design team.
