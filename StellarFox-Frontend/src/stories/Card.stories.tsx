import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

/**
 * Card Component
 * Container for related content with consistent styling
 */
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className = '',
  onClick,
  interactive = false,
}) => {
  const baseStyles = 'rounded-lg p-6 transition-all duration-200';

  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:shadow-md hover:scale-105'
    : '';

  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`.trim();

  return (
    <div
      className={finalClassName}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {title && (
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'elevated', 'outlined'],
    },
    interactive: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle',
    children: (
      <p className="text-gray-600 dark:text-gray-400">
        This is the card content. You can put any content here.
      </p>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    title: 'Elevated Card',
    children: (
      <p className="text-gray-600 dark:text-gray-400">
        This card has an elevated shadow effect.
      </p>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    title: 'Outlined Card',
    children: (
      <p className="text-gray-600 dark:text-gray-400">
        This card has an outlined border style.
      </p>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    title: 'Click Me!',
    children: (
      <p className="text-gray-600 dark:text-gray-400">
        This card is interactive. Click it to see the effect.
      </p>
    ),
    onClick: () => alert('Card clicked!'),
  },
};

export const WithoutHeader: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <p>Content without a title</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Just the main content in a card.
        </p>
      </div>
    ),
  },
};

export const WithComplexContent: Story = {
  args: {
    title: 'Market Card',
    subtitle: 'Boxing - UFC 300',
    children: (
      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Odds:</span>
          <span className="font-semibold">1.85 / 2.10</span>
        </div>
        <div className="flex justify-between">
          <span>Volume:</span>
          <span className="font-semibold">$5,230</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Place Bet
        </button>
      </div>
    ),
  },
};

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      <Card title="Default" variant="default">
        <p className="text-gray-600 dark:text-gray-400">Default variant</p>
      </Card>
      <Card title="Elevated" variant="elevated">
        <p className="text-gray-600 dark:text-gray-400">Elevated variant</p>
      </Card>
      <Card title="Outlined" variant="outlined">
        <p className="text-gray-600 dark:text-gray-400">Outlined variant</p>
      </Card>
      <Card title="Interactive" interactive>
        <p className="text-gray-600 dark:text-gray-400">Click this card</p>
      </Card>
    </div>
  ),
};
