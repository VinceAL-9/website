import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: 'Common/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div>Card Content</div>,
  },
};

export const WithPadding: Story = {
  args: {
    children: <div>Card with specific padding</div>,
    className: 'p-8',
  },
};

export const CustomClass: Story = {
  args: {
    children: <div>Card with custom border</div>,
    className: 'border-2 border-primary-500',
  },
};

