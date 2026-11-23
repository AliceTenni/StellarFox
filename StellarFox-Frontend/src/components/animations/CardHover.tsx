/**
 * Card Hover Effects Component
 * Provides sophisticated hover animations for cards
 */

'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HOVER_VARIANTS, ANIMATION_PRESETS } from '@/lib/animationConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CardHoverProps {
  children: ReactNode;
  effect?: keyof typeof HOVER_VARIANTS;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Card Hover Component
 * Wraps card content to add hover animations
 *
 * @example
 * <CardHover effect="lift">
 *   <div className="card">Card content</div>
 * </CardHover>
 */
export const CardHover: React.FC<CardHoverProps> = ({
  children,
  effect = 'lift',
  onClick,
  className = '',
  ariaLabel,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const selectedEffect = HOVER_VARIANTS[effect];

  if (prefersReducedMotion) {
    return (
      <div
        className={`cursor-pointer transition-all duration-200 ${className}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={ariaLabel}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      transition={{ duration: ANIMATION_PRESETS.fast.duration }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      className={`cursor-pointer ${className}`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {effect === 'lift' && (
        <motion.div
          initial={{ y: 0 }}
          whileHover={{ y: -4 }}
          transition={{
            duration: ANIMATION_PRESETS.fast.duration,
          }}
        >
          {children}
        </motion.div>
      )}

      {effect === 'scale' && (
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{
            duration: ANIMATION_PRESETS.fast.duration,
          }}
        >
          {children}
        </motion.div>
      )}

      {effect === 'glow' && (
        <motion.div
          initial={{
            boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
          }}
          whileHover={{
            boxShadow: '0 0 20px 0 rgba(59, 130, 246, 0.3)',
          }}
          transition={{
            duration: ANIMATION_PRESETS.fast.duration,
          }}
        >
          {children}
        </motion.div>
      )}

      {effect === 'brighten' && (
        <motion.div
          initial={{ opacity: 1 }}
          whileHover={{ opacity: 0.8 }}
          transition={{
            duration: ANIMATION_PRESETS.fast.duration,
          }}
        >
          {children}
        </motion.div>
      )}

      {effect === 'shimmer' && (
        <motion.div
          initial={{ backgroundPosition: '200% 0' }}
          whileHover={{ backgroundPosition: '-200% 0' }}
          transition={{
            duration: 0.6,
          }}
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CardHover;
