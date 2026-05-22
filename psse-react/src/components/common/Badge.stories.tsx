import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Common/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Happy Paths
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Badge',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Badge',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Badge',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Badge',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Badge',
  },
};

// Edge cases / Additional states
export const CustomClass: Story = {
  args: {
    variant: 'primary',
    children: 'Large Custom Badge',
    className: 'text-lg px-4 py-2',
  },
};

export const LongTextSadPath: Story = {
  args: {
    variant: 'info',
    children: 'This is a badge with a very long text that might break the layout if not handled properly',
  },
};
