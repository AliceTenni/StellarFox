import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CardHover } from '@/components/animations/CardHover';
import { PageTransition } from '@/components/animations/PageTransition';
import { LoadingAnimation } from '@/components/animations/LoadingAnimation';
import { HOVER_VARIANTS, PAGE_TRANSITION_VARIANTS } from '@/lib/animationConfig';

/**
 * Animation Stories
 * Showcase of Framer Motion animations and performance optimizations
 */

// CardHover Stories
const CardHoverMeta = {
  title: 'Components/Animations/CardHover',
  component: CardHover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    effect: {
      control: 'select',
      options: Object.keys(HOVER_VARIANTS),
    },
  },
} satisfies Meta<typeof CardHover>;

export default CardHoverMeta;

type CardHoverStory = StoryObj<typeof CardHoverMeta>;

export const LiftEffect: CardHoverStory = {
  args: {
    effect: 'lift',
  },
  render: (args) => (
    <CardHover {...args}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm w-64">
        <h3 className="text-lg font-semibold mb-2">Hover to Lift</h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card lifts when you hover over it.
        </p>
      </div>
    </CardHover>
  ),
};

export const ScaleEffect: CardHoverStory = {
  args: {
    effect: 'scale',
  },
  render: (args) => (
    <CardHover {...args}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm w-64">
        <h3 className="text-lg font-semibold mb-2">Hover to Scale</h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card scales up when you hover over it.
        </p>
      </div>
    </CardHover>
  ),
};

export const GlowEffect: CardHoverStory = {
  args: {
    effect: 'glow',
  },
  render: (args) => (
    <CardHover {...args}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm w-64">
        <h3 className="text-lg font-semibold mb-2">Hover to Glow</h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card glows when you hover over it.
        </p>
      </div>
    </CardHover>
  ),
};

export const BrightenEffect: CardHoverStory = {
  args: {
    effect: 'brighten',
  },
  render: (args) => (
    <CardHover {...args}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm w-64 opacity-100 transition-opacity">
        <h3 className="text-lg font-semibold mb-2">Hover to Brighten</h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card brightens when you hover over it.
        </p>
      </div>
    </CardHover>
  ),
};

export const AllCardHoverEffects: CardHoverStory = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {Object.keys(HOVER_VARIANTS).map((effectName) => (
        <CardHover key={effectName} effect={effectName as any}>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold capitalize">{effectName}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Hover effect
            </p>
          </div>
        </CardHover>
      ))}
    </div>
  ),
};

// PageTransition Stories
const PageTransitionMeta = {
  title: 'Components/Animations/PageTransition',
  component: PageTransition,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.keys(PAGE_TRANSITION_VARIANTS),
    },
  },
} satisfies Meta<typeof PageTransition>;

export const PageTransitionDefault = {
  args: {
    variant: 'fadeIn',
  },
  render: (args: any) => (
    <PageTransition {...args}>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold mb-4">Page Content</h2>
        <p>This page animates in when navigated to.</p>
      </div>
    </PageTransition>
  ),
} satisfies StoryObj<typeof PageTransitionMeta>;

export const PageTransitionSlideLeft = {
  args: {
    variant: 'slideInFromLeft',
  },
  render: (args: any) => (
    <PageTransition {...args}>
      <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h2 className="text-2xl font-bold mb-4">Slide from Left</h2>
        <p>This page slides in from the left.</p>
      </div>
    </PageTransition>
  ),
} satisfies StoryObj<typeof PageTransitionMeta>;

export const PageTransitionScaleIn = {
  args: {
    variant: 'scaleIn',
  },
  render: (args: any) => (
    <PageTransition {...args}>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h2 className="text-2xl font-bold mb-4">Scale In</h2>
        <p>This page scales in from smaller to full size.</p>
      </div>
    </PageTransition>
  ),
} satisfies StoryObj<typeof PageTransitionMeta>;

// LoadingAnimation Stories
const LoadingAnimationMeta = {
  title: 'Components/Animations/LoadingAnimation',
  component: LoadingAnimation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'pulse', 'bounce', 'dots', 'shimmer'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof LoadingAnimation>;

export const LoadingSpinner = {
  args: {
    variant: 'spinner',
    size: 'md',
  },
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingPulse = {
  args: {
    variant: 'pulse',
    size: 'md',
  },
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingBounce = {
  args: {
    variant: 'bounce',
    size: 'md',
  },
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingDots = {
  args: {
    variant: 'dots',
    size: 'md',
  },
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingShimmer = {
  args: {
    variant: 'shimmer',
    size: 'md',
  },
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingAllVariants = {
  render: () => (
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <p className="text-sm font-semibold mb-4">Spinner</p>
        <LoadingAnimation variant="spinner" size="md" color="blue-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold mb-4">Pulse</p>
        <LoadingAnimation variant="pulse" size="md" color="green-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold mb-4">Bounce</p>
        <LoadingAnimation variant="bounce" size="md" color="purple-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold mb-4">Dots</p>
        <LoadingAnimation variant="dots" size="md" color="orange-600" />
      </div>
      <div className="text-center col-span-2">
        <p className="text-sm font-semibold mb-4">Shimmer</p>
        <LoadingAnimation variant="shimmer" size="lg" />
      </div>
    </div>
  ),
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingAllSizes = {
  render: () => (
    <div className="flex items-end justify-center space-x-8">
      <div className="text-center">
        <p className="text-xs font-semibold mb-2">Small</p>
        <LoadingAnimation variant="spinner" size="sm" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold mb-2">Medium</p>
        <LoadingAnimation variant="spinner" size="md" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold mb-2">Large</p>
        <LoadingAnimation variant="spinner" size="lg" />
      </div>
    </div>
  ),
} satisfies StoryObj<typeof LoadingAnimationMeta>;

export const LoadingInContext = {
  render: () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Loading Data</h3>
          <LoadingAnimation variant="spinner" size="sm" color="blue-600" />
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  ),
} satisfies StoryObj<typeof LoadingAnimationMeta>;
