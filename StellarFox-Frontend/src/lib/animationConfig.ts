/**
 * Animation Configuration
 * Centralized animation config with accessibility and performance optimization
 */

export interface AnimationPreset {
  duration: number;
  delay?: number;
  ease: string | number[];
  transition?: {
    type?: 'spring' | 'tween';
    stiffness?: number;
    damping?: number;
  };
}

/**
 * Animation presets for consistent animations across the app
 */
export const ANIMATION_PRESETS = {
  // Fast interactions
  fast: {
    duration: 0.15,
    ease: 'easeInOut',
  } as AnimationPreset,

  // Standard interactions
  standard: {
    duration: 0.3,
    ease: 'easeInOut',
  } as AnimationPreset,

  // Slower animations
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  } as AnimationPreset,

  // Extra slow for emphasis
  slowest: {
    duration: 0.8,
    ease: 'easeInOut',
  } as AnimationPreset,

  // Spring animations
  spring: {
    duration: 0.6,
    ease: 'easeOut',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  } as AnimationPreset,

  // Bouncy spring
  bouncy: {
    duration: 0.6,
    ease: 'easeOut',
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 10,
    },
  } as AnimationPreset,

  // Smooth elastic
  elastic: {
    duration: 0.8,
    ease: 'easeOut',
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 20,
    },
  } as AnimationPreset,
} as const;

/**
 * Page transition presets
 */
export const PAGE_TRANSITION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  slideInFromTop: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  slideInFromBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  expandIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const;

/**
 * Hover animation presets
 */
export const HOVER_VARIANTS = {
  lift: {
    initial: { y: 0 },
    hover: { y: -4 },
    transition: { duration: 0.2 },
  },

  scale: {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    transition: { duration: 0.2 },
  },

  glow: {
    initial: { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
    hover: { boxShadow: '0 0 20px 0 rgba(59, 130, 246, 0.3)' },
    transition: { duration: 0.2 },
  },

  brighten: {
    initial: { opacity: 1 },
    hover: { opacity: 0.8 },
    transition: { duration: 0.2 },
  },

  shimmer: {
    initial: { backgroundPosition: '200% 0' },
    hover: { backgroundPosition: '-200% 0' },
    transition: { duration: 0.6 },
  },
} as const;

/**
 * Loading animation presets
 */
export const LOADING_VARIANTS = {
  spinner: {
    rotate: 360,
  },

  pulse: {
    opacity: [1, 0.5, 1],
    scale: [1, 1.1, 1],
  },

  bounce: {
    y: [0, -20, 0],
  },

  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },

  dots: [
    { opacity: 0, y: 0 },
    { opacity: 1, y: -10 },
    { opacity: 0, y: 0 },
  ],
} as const;

/**
 * Get animation with reduced motion applied
 */
export const getAnimationWithMotionPreference = (
  animation: AnimationPreset,
  prefersReducedMotion: boolean
): AnimationPreset => {
  if (!prefersReducedMotion) {
    return animation;
  }

  // Reduce motion by setting duration to 0
  return {
    ...animation,
    duration: 0,
  };
};

/**
 * Stagger children animations
 */
export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
} as const;

/**
 * Animation timing constants
 */
export const ANIMATION_TIMING = {
  MICRO: 100, // milliseconds
  FAST: 150,
  STANDARD: 300,
  SLOW: 500,
  SLOWEST: 800,
} as const;

/**
 * Easing functions
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'easeIn',
  easeOut: 'easeOut',
  easeInOut: 'easeInOut',
  circIn: 'circIn',
  circOut: 'circOut',
  circInOut: 'circInOut',
  backIn: 'backIn',
  backOut: 'backOut',
  backInOut: 'backInOut',
  anticipate: 'anticipate',
} as const;

/**
 * Keyframe animations for complex motion
 */
export const KEYFRAMES = {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },

  slideInLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },

  slideInRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' },
  },

  slideInUp: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },

  slideInDown: {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },

  scaleIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },

  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
  },

  spin: {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },

  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },

  shimmer: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
} as const;

/**
 * Configuration for animation performance
 */
export const ANIMATION_PERFORMANCE = {
  // Use GPU acceleration for transforms
  useTransforms: true,

  // Reduce animation complexity on low-end devices
  reducedComplexity: false,

  // Disable animations in reduced motion preference
  respectReducedMotion: true,

  // Maximum concurrent animations
  maxConcurrentAnimations: 5,

  // Animation frame rate (fps)
  targetFPS: 60,

  // Enable will-change CSS
  useWillChange: true,
} as const;
