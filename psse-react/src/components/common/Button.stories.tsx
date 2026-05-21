import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Order now' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /order now/i })).toBeVisible();
  },
};

export const CssCheck: Story = {
  args: { variant: 'primary', children: 'Submit' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /submit/i });
    // Primary variant uses bg-psse-accent (e.g., #007BFF which is rgb(0, 123, 255))
    // We check for the CSS variable or computed background color.
    const bgColor = getComputedStyle(button).backgroundColor;
    await expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  },
};

export const Secondary: Story = { args: { variant: 'secondary', children: 'Learn More' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };
export const Large: Story = { args: { variant: 'primary', size: 'lg', children: 'Checkout' } };
