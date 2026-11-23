/**
 * Bundle Optimization Configuration
 * Strategies for code splitting and performance optimization
 */

/**
 * Code splitting strategies
 * Define which components and modules should be chunked separately
 */
export const CODE_SPLITTING_CONFIG = {
  // Route-level chunks
  routes: {
    admin: ['components/admin', 'utils/admin'],
    settings: ['components/settings', 'utils/settings'],
    analytics: ['components/analytics', 'utils/analytics'],
    market: ['components/market', 'utils/market'],
  },

  // Vendor chunks for third-party libraries
  vendors: {
    react: ['react', 'react-dom'],
    nextjs: ['next', 'next/link', 'next/image'],
    stellar: ['@stellar/stellar-sdk'],
    query: ['@tanstack/react-query'],
    animation: ['framer-motion', 'react-spring'],
    state: ['zustand'],
  },

  // Feature-based chunks
  features: {
    betting: ['components/bet', 'services/betting', 'utils/betting'],
    market: ['components/market', 'services/market', 'utils/market'],
    wallet: ['components/wallet', 'services/wallet', 'utils/wallet'],
    ui: ['components/ui', 'lib/theme'],
  },
} as const;

/**
 * Bundle analysis configuration
 * Helps identify large dependencies and optimization opportunities
 */
export const BUNDLE_ANALYSIS_CONFIG = {
  enabled: process.env.ANALYZE === 'true',
  outputDir: '.next/analyze',
  format: 'json' as const,
  excludeChunks: [
    'webpack-runtime',
    'main',
    '_app',
    '_document',
  ],
} as const;

/**
 * Dynamic import patterns to optimize
 */
export const DYNAMIC_IMPORT_PATTERNS = {
  // Always lazy load these component paths
  alwaysLazy: [
    /components\/(admin|settings|analytics)\//,
    /components\/market\/[^/]*Details/,
    /components\/(editor|table|chart|map)/,
  ],

  // Eagerly load these critical components
  alwaysEager: [
    /components\/(layout|ui)\//,
    /components\/common\//,
  ],

  // Load on route change
  routeChange: {
    '/admin': [
      'components/admin/AdminPanel',
      'components/admin/UserManagement',
    ],
    '/market': [
      'components/market/MarketList',
      'components/market/MarketCard',
    ],
    '/settings': [
      'components/settings/SettingsPanel',
      'components/settings/UserPreferences',
    ],
  },

  // Load on user interaction
  onDemand: [
    'components/modals/AdvancedModal',
    'components/drawers/FilterDrawer',
    'components/popups/HelpPopup',
  ],
} as const;

/**
 * Performance budgets for different bundle sizes
 */
export const PERFORMANCE_BUDGETS = {
  bundle: {
    js: 300, // KB
    css: 50, // KB
    images: 500, // KB
  },
  core_web_vitals: {
    lcp: 2500, // ms - Largest Contentful Paint
    fid: 100, // ms - First Input Delay
    cls: 0.1, // - Cumulative Layout Shift
    inp: 200, // ms - Interaction to Next Paint
    ttfb: 600, // ms - Time to First Byte
  },
} as const;

/**
 * Get bundle analysis command
 */
export const getBundleAnalysisCommand = (): string => {
  return 'ANALYZE=true next build';
};

/**
 * Check if a module should be lazy loaded based on patterns
 */
export const shouldLazyLoad = (modulePath: string): boolean => {
  const alwaysLazy = DYNAMIC_IMPORT_PATTERNS.alwaysLazy;
  const alwaysEager = DYNAMIC_IMPORT_PATTERNS.alwaysEager;

  // Check if should always load eagerly
  if (alwaysEager.some((pattern) => pattern.test(modulePath))) {
    return false;
  }

  // Check if should always lazy load
  if (alwaysLazy.some((pattern) => pattern.test(modulePath))) {
    return true;
  }

  // Default: lazy load heavy components
  return /components\/(modal|drawer|table|chart|map|editor)/.test(modulePath);
};

/**
 * Optimization strategies
 */
export const OPTIMIZATION_STRATEGIES = {
  // Tree-shaking configuration
  treeshaking: {
    enabled: true,
    sideEffects: false,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    sizes: [320, 640, 1024, 1280, 1920],
    quality: 75,
    cache: 86400, // 1 day
  },

  // Font optimization
  fonts: {
    display: 'swap' as const, // Prevent FOIT (Flash of Invisible Text)
    preload: ['Inter'],
    variable: true,
  },

  // Script optimization
  scripts: {
    defer: true,
    async: true,
    criticalChunks: ['main', 'shared'],
  },

  // CSS optimization
  css: {
    purge: true,
    minify: true,
    sourceMaps: process.env.NODE_ENV === 'development',
  },
} as const;

/**
 * Monitor performance and log warnings
 */
export const checkPerformanceBudget = (
  metric: string,
  value: number
): { passed: boolean; message: string } => {
  const budgets = PERFORMANCE_BUDGETS.bundle as Record<string, number>;
  const budget = budgets[metric];

  if (!budget) {
    return { passed: true, message: `No budget defined for ${metric}` };
  }

  if (value > budget) {
    return {
      passed: false,
      message: `⚠️  ${metric}: ${value}KB exceeds budget of ${budget}KB`,
    };
  }

  return { passed: true, message: `✅ ${metric}: ${value}KB (budget: ${budget}KB)` };
};

/**
 * Next.js configuration recommendations
 * Include these settings in your next.config.js
 */
export const NEXT_CONFIG_RECOMMENDATIONS = `
// Add to next.config.js for optimal performance:

const nextConfig = {
  // Enable SWCMinify for faster builds
  swcMinify: true,

  // Optimize compression
  compress: true,

  // Enable font optimization
  optimizeFonts: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack configuration for code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        default: false,
        vendors: false,
        // React vendor chunk
        react: {
          name: 'react',
          test: /[\\\\/]node_modules[\\\\/](react|react-dom)[\\\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Stellar SDK chunk
        stellar: {
          name: 'stellar',
          test: /[\\\\/]node_modules[\\\\/]@stellar[\\\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Common vendor chunk
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      };
    }
    return config;
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      '@stellar/stellar-sdk',
      '@tanstack/react-query',
      'zustand',
    ],
  },

  // Disable static generation for dynamic pages
  staticPageGenerationTimeout: 60,

  // Configure output
  output: 'standalone',
};
`;
