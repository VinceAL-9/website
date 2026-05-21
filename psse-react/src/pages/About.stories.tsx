import type { Meta, StoryObj } from '@storybook/react-vite';
import { About } from './About';

const meta = {
  title: 'Pages/About',
  component: About,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof About>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

