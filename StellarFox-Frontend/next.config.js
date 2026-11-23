/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWCMinify for faster builds
  swcMinify: true,

  // Optimize compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://horizon-testnet.stellar.org https://horizon.stellar.org https://soroban-testnet.stellar.org https://soroban-rpc.stellar.org;
      frame-ancestors 'none';
      object-src 'none';
    `.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin',
          },
        ],
      },
    ];
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
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Stellar SDK chunk
        stellar: {
          name: 'stellar',
          test: /[\\/]node_modules[\\/]@stellar[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
        },
        // Animation libraries chunk
        animation: {
          name: 'animation',
          test: /[\\/]node_modules[\\/](framer-motion|react-spring)[\\/]/,
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
      'framer-motion',
    ],
  },

  output: 'standalone',
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
