import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageLayout } from './PageLayout';

const meta = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="h-[50vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-xl">Page Content Goes Here</p>
      </div>
    ),
  },
};
