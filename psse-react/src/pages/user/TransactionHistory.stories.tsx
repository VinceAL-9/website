import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistory } from './TransactionHistory';

const meta = {
  title: 'Pages/User/TransactionHistory',
  component: TransactionHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TransactionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

