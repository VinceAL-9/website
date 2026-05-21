import type { Meta, StoryObj } from '@storybook/react-vite';
import { Login } from './Login';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  component: Login,
  decorators: [(Story) => <BrowserRouter><Story /></BrowserRouter>],
  tags: ['ai-generated'],
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

