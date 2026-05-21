import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserRegister } from './UserRegister';

const meta = {
  title: 'Pages/User/UserRegister',
  component: UserRegister,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UserRegister>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

