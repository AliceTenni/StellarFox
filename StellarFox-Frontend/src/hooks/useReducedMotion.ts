/**
 * Hook to detect and respect user's prefers-reduced-motion preference
 * This is critical for accessibility and user comfort
 */

import { useEffect, useState } from 'react';

/**
 * Check if user prefers reduced motion
 * This respects the CSS media query: prefers-reduced-motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the media query is supported
    if (!window.matchMedia) {
      return;
    }

    // Create a media query list for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial state
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Add listener (handle both old and new API)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Check if animations should be disabled
 * Considers both reduced motion preference and other factors
 */
export const useDisableAnimations = (): boolean => {
  const prefersReducedMotion = useReducedMotion();
  const [disableAnimations, setDisableAnimations] = useState(false);

  // Disable animations for accessibility
  useEffect(() => {
    setDisableAnimations(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Also check for high power saving mode (if available)
  useEffect(() => {
    if ('getBattery' in navigator) {
      const batteryPromise = (navigator as any).getBattery?.();
      if (batteryPromise) {
        batteryPromise.then((battery: any) => {
          if (battery.level < 0.2 && battery.discharging) {
            setDisableAnimations(true);
          }
        });
      }
    }
  }, []);

  return disableAnimations;
};

/**
 * Get animation duration based on preference
 */
export const getAnimationDuration = (
  normalDuration: number,
  reducedDuration: number = 0
): number => {
  if (typeof window === 'undefined') {
    return normalDuration;
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  return prefersReducedMotion ? reducedDuration : normalDuration;
};

/**
 * Transform animation config based on motion preference
 */
export const getMotionSafeAnimation = (
  animation: any,
  prefersReducedMotion: boolean
): any => {
  if (!prefersReducedMotion) {
    return animation;
  }

  // Return instant animation (no transition)
  return {
    ...animation,
    transition: {
      duration: 0,
    },
  };
};

/**
 * Check if animations are supported by the browser
 */
export const supportsAnimations = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }

  // Check for prefers-reduced-motion
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) {
    return false;
  }

  // Check for animation support in CSS
  const element = document.createElement('div');
  const animationEndEvent =
    'animationend' in element ? 'animationend' : 'webkitAnimationEnd';

  return !!animationEndEvent;
};
