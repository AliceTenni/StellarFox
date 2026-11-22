/**
 * Loading Animation Component
 * Various loading spinner animations
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_TIMING, LOADING_VARIANTS } from '@/lib/animationConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LoadingAnimationProps {
  variant?: 'spinner' | 'pulse' | 'bounce' | 'dots' | 'shimmer';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

/**
 * Spinner animation
 */
const Spinner: React.FC<{ size: string; color: string }> = ({
  size,
  color,
}) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
    className={`${size} border-4 border-gray-200 border-t-${color} rounded-full`}
  />
);

/**
 * Pulse animation
 */
const Pulse: React.FC<{ size: string; color: string }> = ({
  size,
  color,
}) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`${size} bg-${color} rounded-full`}
  />
);

/**
 * Bounce animation
 */
const Bounce: React.FC<{ size: string; color: string }> = ({
  size,
  color,
}) => (
  <motion.div
    animate={{ y: [0, -20, 0] }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`${size} bg-${color} rounded-full`}
  />
);

/**
 * Dots animation
 */
const Dots: React.FC<{ color: string }> = ({ color }) => (
  <div className="flex items-center justify-center space-x-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -10, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
        className={`w-2 h-2 bg-${color} rounded-full`}
      />
    ))}
  </div>
);

/**
 * Shimmer animation
 */
const Shimmer: React.FC<{ size: string }> = ({ size }) => (
  <motion.div
    animate={{
      backgroundPosition: ['200% 0', '-200% 0'],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }}
    className={`${size} rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200`}
    style={{
      backgroundSize: '200% 100%',
    }}
  />
);

/**
 * Loading Animation Component
 * Shows a loading indicator with various animation styles
 *
 * @example
 * <LoadingAnimation variant="spinner" size="md" color="blue-600" />
 */
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'blue-600',
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Map sizes to Tailwind classes
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const selectedSize = sizeMap[size];

  if (prefersReducedMotion) {
    return (
      <div
        className={`${selectedSize} bg-${color} rounded-full opacity-50 ${className}`}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return (
    <div
      className={className}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {variant === 'spinner' && <Spinner size={selectedSize} color={color} />}
      {variant === 'pulse' && <Pulse size={selectedSize} color={color} />}
      {variant === 'bounce' && <Bounce size={selectedSize} color={color} />}
      {variant === 'dots' && <Dots color={color} />}
      {variant === 'shimmer' && <Shimmer size={selectedSize} />}
    </div>
  );
};

export default LoadingAnimation;
