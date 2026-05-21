import type { Meta, StoryObj } from '@storybook/react-vite';
import { Merchandise } from './Merchandise';

const meta = {
  title: 'Pages/Merchandise',
  component: Merchandise,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Merchandise>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

