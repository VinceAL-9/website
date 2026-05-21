import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserLogin } from './UserLogin';

const meta = {
  title: 'Pages/User/UserLogin',
  component: UserLogin,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UserLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

