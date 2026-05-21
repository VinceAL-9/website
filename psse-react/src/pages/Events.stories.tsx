import type { Meta, StoryObj } from '@storybook/react-vite';
import { Events } from './Events';

const meta = {
  title: 'Pages/Events',
  component: Events,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Events>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

