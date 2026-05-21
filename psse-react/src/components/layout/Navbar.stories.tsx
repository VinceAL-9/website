import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from './Navbar';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  component: Navbar,
  decorators: [(Story) => <BrowserRouter><Story /></BrowserRouter>],
  tags: ['ai-generated'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
