# Quick Start Guide - StellarFox Frontend Optimizations

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd /workspaces/StellarFox/StellarFox-Frontend
npm install --legacy-peer-deps
```

### Step 2: Start Storybook (Optional but Recommended)
```bash
npm run storybook
# Opens at http://localhost:6006
# Browse all components and animations
```

### Step 3: Start Development
```bash
npm run dev
# Opens at http://localhost:3000
```

---

## 📊 Issue 1: Web Vitals & Analytics

### Quick Integration
Add to your root layout:

```typescript
// src/app/layout.tsx
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
```

### Track Metrics in Components
```typescript
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

function MyComponent() {
  const { metrics, startAsyncOperation } = usePerformanceMetrics();
  
  useEffect(() => {
    const timer = startAsyncOperation('fetch-data');
    // ... your async code
    timer.end(); // Auto-logs metric
  }, []);
  
  return <div>Component</div>;
}
```

### View Collected Metrics
Metrics are logged to console in development. Configure Sentry for production:

```bash
# Set in .env.local or environment
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

---

## 📦 Issue 2: Bundle Optimization

### Use Dynamic Imports
```typescript
import { dynamicImport } from '@/lib/dynamicImports';

// Instead of:
// import HeavyComponent from '@/components/Heavy';

// Do this:
const HeavyComponent = dynamicImport(() => 
  import('@/components/Heavy')
);

// Use in JSX - same as regular component
<HeavyComponent prop="value" />
```

### Prefetch on Hover
```typescript
import { prefetchComponent } from '@/lib/dynamicImports';

<button 
  onMouseEnter={() => prefetchComponent(() => 
    import('@/components/Modal')
  )}
>
  Open Modal
</button>
```

### Analyze Bundle Size
```bash
npm run analyze
# Creates bundle analysis in .next folder
```

---

## 🎨 Issue 3: Storybook Component Library

### View Components
```bash
npm run storybook
# Browse at http://localhost:6006
```

### Create New Story
Create `/src/stories/MyComponent.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '@/components/MyComponent';

const meta: Meta<typeof MyComponent> = {
  component: MyComponent,
  title: 'Components/MyComponent',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Click me' },
};

export const Disabled: Story = {
  args: { label: 'Disabled', disabled: true },
};
```

### Design System
Read `/docs/DESIGN_SYSTEM.md` for:
- Color palette
- Typography system
- Spacing scale
- Component patterns
- Accessibility guidelines

---

## ✨ Issue 4: Framer Motion Animations

### Add Page Transitions
```typescript
import { PageTransition } from '@/components/animations/PageTransition';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function Page() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <PageTransition 
      variant="slideIn"  // or 'fadeIn', 'scaleIn', etc.
      reduced={shouldReduceMotion}
    >
      <h1>Welcome</h1>
    </PageTransition>
  );
}
```

### Add Hover Effects
```typescript
import { CardHover } from '@/components/animations/CardHover';

export function ProductCard() {
  return (
    <CardHover variant="lift">  // or 'scale', 'glow', 'brighten', 'shimmer'
      <div className="p-4">
        <h3>Product Name</h3>
        <p>Description</p>
      </div>
    </CardHover>
  );
}
```

### Add Loading Animations
```typescript
import { LoadingAnimation } from '@/components/animations/LoadingAnimation';

function DataFetcher() {
  const [isLoading, setIsLoading] = useState(true);
  
  if (isLoading) {
    return <LoadingAnimation variant="spinner" />;
  }
  
  return <div>Data loaded</div>;
}
```

### Available Animations

#### Page Transitions
- `fadeIn` - Fade in
- `slideIn` - Slide from side
- `scaleIn` - Scale from center
- `expandIn` - Expand from center
- `rotateIn` - Rotate in
- `stretchIn` - Stretch effect
- `popIn` - Pop in effect

#### Hover Effects
- `lift` - Lift with shadow
- `scale` - Subtle scale
- `glow` - Glow effect
- `brighten` - Brightness increase
- `shimmer` - Shimmer effect

#### Loading Animations
- `spinner` - Rotating spinner
- `pulse` - Pulse effect
- `bounce` - Bouncing dots
- `dots` - Animated dots
- `shimmer` - Shimmer skeleton

---

## 🛠️ Common Tasks

### Add a New Component to Storybook
```bash
# 1. Create component in /src/components/
# 2. Create story in /src/stories/ComponentName.stories.tsx
# 3. Run npm run storybook
# 4. View at http://localhost:6006
```

### Create a New Page with Optimization
```typescript
// src/app/my-page/page.tsx
import { PageTransition } from '@/components/animations/PageTransition';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { dynamicImport } from '@/lib/dynamicImports';

// Lazy load heavy components
const HeavyChart = dynamicImport(() => import('@/components/Chart'));
const DataTable = dynamicImport(() => import('@/components/Table'));

export default function MyPage() {
  const { startAsyncOperation } = usePerformanceMetrics();
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    const timer = startAsyncOperation('page-load');
    // ... your code
    timer.end();
  }, []);
  
  return (
    <PageTransition variant="slideIn" reduced={shouldReduceMotion}>
      <h1>My Page</h1>
      <HeavyChart />
      <DataTable />
    </PageTransition>
  );
}
```

### Monitor Performance in Console
Metrics are logged to console automatically:
```
[Performance] LCP: 1234ms
[Performance] FID: 45ms
[Performance] CLS: 0.05
[AsyncOperation] fetch-data: 567ms
```

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Accessibility
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Respects prefers-reduced-motion

---

## 🐛 Troubleshooting

### Storybook won't start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install --legacy-peer-deps
npm run storybook
```

### Animations too fast/slow
Adjust in `/src/lib/animationConfig.ts`:
```typescript
export const animationConfig = {
  fast: { duration: 100 },      // Faster
  standard: { duration: 500 },  // Slower
  // ... etc
};
```

### Web Vitals not tracking
Ensure AnalyticsProvider is at root:
```typescript
// src/app/layout.tsx
import { AnalyticsProvider } from '@/providers/AnalyticsProvider';

export default function RootLayout({ children }) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `/IMPLEMENTATION_SUMMARY.md` | Complete implementation details |
| `/docs/DESIGN_SYSTEM.md` | Component library & design tokens |
| `/src/lib/vitals.ts` | Web Vitals tracking code |
| `/src/lib/animationConfig.ts` | Animation presets |
| `/src/lib/dynamicImports.ts` | Bundle optimization utilities |

---

## ✅ Verification Checklist

After installation, verify:

- [ ] `npm run storybook` works
- [ ] Components load in Storybook
- [ ] `npm run dev` starts without errors
- [ ] No console errors on page load
- [ ] Performance metrics in console
- [ ] Animations work smoothly
- [ ] Keyboard navigation works
- [ ] `npm run analyze` completes

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install --legacy-peer-deps`
2. ✅ Explore Storybook: `npm run storybook`
3. ✅ Read design system: `/docs/DESIGN_SYSTEM.md`
4. ✅ Integrate analytics: Configure Sentry DSN
5. ✅ Start development: `npm run dev`
6. ✅ Build for production: `npm run build`

---

## 🚀 Ready to Deploy

All implementations are production-ready. To deploy:

```bash
# Build with optimizations
npm run build

# Start production server
npm start

# Or deploy to your platform
# (Vercel, Netlify, etc.)
```

---

## 📞 Support

For issues or questions about:
- **Web Vitals:** See `/src/lib/vitals.ts`
- **Bundle Optimization:** See `/src/lib/bundleOptimization.ts`
- **Animations:** See `/src/lib/animationConfig.ts`
- **Components:** Browse Storybook at http://localhost:6006

**All features are fully documented in source code with TypeScript types.**
