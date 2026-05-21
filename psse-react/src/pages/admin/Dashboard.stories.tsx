import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dashboard } from './Dashboard';

const meta = {
  title: 'Pages/Admin/Dashboard',
  component: Dashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

