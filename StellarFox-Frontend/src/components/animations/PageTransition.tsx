/**
 * Page Transition Component
 * Handles page-level animations for navigation
 */

'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  PAGE_TRANSITION_VARIANTS,
  ANIMATION_PRESETS,
} from '@/lib/animationConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PageTransitionProps {
  children: ReactNode;
  variant?: keyof typeof PAGE_TRANSITION_VARIANTS;
  delay?: number;
  className?: string;
}

/**
 * Page Transition Component
 * Wraps page content to add smooth animations on route change
 *
 * @example
 * <PageTransition variant="slideInFromLeft">
 *   <YourPageContent />
 * </PageTransition>
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fadeIn',
  delay = 0,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const selectedVariant = PAGE_TRANSITION_VARIANTS[variant];
  const animation = ANIMATION_PRESETS.standard;

  // Respect user's motion preferences
  const finalVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : selectedVariant;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={finalVariants as any}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: animation.duration,
              delay,
              ease: animation.ease as any,
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
