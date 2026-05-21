import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerifyEmail } from './VerifyEmail';

const meta = {
  title: 'Pages/User/VerifyEmail',
  component: VerifyEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof VerifyEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

