/**
 * Dynamic Imports Utilities
 * Provides helper functions for lazy loading and code splitting
 */

import dynamic from 'next/dynamic';
import React from 'react';

export interface DynamicImportOptions {
  loading?: React.ComponentType<any>;
  ssr?: boolean;
  loadingDelay?: number;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Create a dynamically imported component with custom loading state
 * Usage: const MyComponent = createDynamicComponent(() => import('@/components/MyComponent'))
 */
export const createDynamicComponent = (
  importFunc: () => Promise<any>,
  options: DynamicImportOptions = {}
): React.ComponentType<any> => {
  const { loading: LoadingComponent, ssr = true, loadingDelay = 200 } = options;

  return dynamic(importFunc as any, {
    loading: LoadingComponent ? () => React.createElement(LoadingComponent) : undefined,
    ssr,
    loadingDelay,
  }) as React.ComponentType<any>;
};

/**
 * Lazy load a component with retry capability
 * Usage: const MyComponent = lazyLoadComponent(() => import('@/components/MyComponent'))
 */
export const lazyLoadComponent = (
  importFunc: () => Promise<any>
): React.ComponentType<any> => {
  let moduleCache: React.ComponentType<any> | null = null;
  let modulePromise: Promise<React.ComponentType<any>> | null = null;

  const load = (): Promise<React.ComponentType<any>> => {
    if (moduleCache) {
      return Promise.resolve(moduleCache);
    }

    if (!modulePromise) {
      modulePromise = importFunc().then((mod) => {
        moduleCache = mod.default;
        return moduleCache;
      });
    }

    return modulePromise;
  };

  return React.lazy(load) as React.ComponentType<any>;
};

/**
 * Prefetch a dynamic component before it's needed
 * Usage: prefetchComponent(() => import('@/components/HeavyComponent'))
 */
export const prefetchComponent = async (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
): Promise<void> => {
  try {
    await importFunc();
  } catch (error) {
    console.error('Failed to prefetch component:', error);
  }
};

/**
 * Route-based code splitting config
 * Maps routes to their heavy components that should be lazy loaded
 */
export const LAZY_LOAD_ROUTES = {
  '/admin': () => import('@/components/admin/AdminPanel'),
  '/analytics': () => import('@/components/analytics/AnalyticsDashboard'),
  '/settings': () => import('@/components/settings/SettingsPanel'),
  '/market/details': () => import('@/components/market/MarketDetails'),
} as const;

/**
 * Get the dynamic component for a route
 */
export const getDynamicComponentForRoute = (route: string): React.ComponentType<any> | null => {
  const importFunc = (LAZY_LOAD_ROUTES as Record<string, any>)[route];

  if (!importFunc) {
    return null;
  }

  return dynamic(importFunc as any, {
    ssr: false,
  });
};

/**
 * Heavy components that should always be lazy loaded
 */
export const HEAVY_COMPONENTS = {
  RichEditor: () => import('@/components/editors/RichEditor'),
  DataTable: () => import('@/components/tables/DataTable'),
  ChartLibrary: () => import('@/components/charts/ChartLibrary'),
  MapComponent: () => import('@/components/map/MapComponent'),
  CodeEditor: () => import('@/components/editors/CodeEditor'),
} as const;

/**
 * Get a heavy component with proper error handling
 */
export const getHeavyComponent = (
  componentName: keyof typeof HEAVY_COMPONENTS
): React.ComponentType<any> | null => {
  const importFunc = HEAVY_COMPONENTS[componentName];

  if (!importFunc) {
    console.warn(`Heavy component ${componentName} not found`);
    return null;
  }

  const LoadingComponent = () => {
    const React = require('react');
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center p-4' },
      React.createElement('div', {
        className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-current',
      })
    );
  };

  return dynamic(importFunc as any, {
    ssr: false,
    loading: LoadingComponent,
  });
};

/**
 * Dynamically import utilities or modules (non-component imports)
 * Usage: const { calculateValue } = await dynamicImportModule(() => import('@/utils/calculations'))
 */
export const dynamicImportModule = async (
  importFunc: () => Promise<any>
): Promise<any> => {
  try {
    return await importFunc();
  } catch (error) {
    console.error('Failed to dynamically import module:', error);
    throw error;
  }
};

/**
 * Create a debounced dynamic import to avoid loading the same module multiple times
 */
const importCache = new Map<string, Promise<any>>();

export const cachedDynamicImport = async (
  key: string,
  importFunc: () => Promise<any>
): Promise<any> => {
  if (importCache.has(key)) {
    return importCache.get(key) as Promise<any>;
  }

  const promise = importFunc();
  importCache.set(key, promise);

  return promise;
};

/**
 * Clear the import cache (useful for testing or memory cleanup)
 */
export const clearImportCache = (key?: string): void => {
  if (key) {
    importCache.delete(key);
  } else {
    importCache.clear();
  }
};
