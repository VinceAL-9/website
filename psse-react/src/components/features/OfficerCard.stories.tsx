import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficerCard } from './OfficerCard';

const meta = {
  title: 'Features/OfficerCard',
  component: OfficerCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OfficerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    officer: {
      id: '1',
      name: 'Jane Doe',
      title: "President", category: "exec",
      image: 'https://placehold.co/400',
      
      
      
      
    },
  },
};

export const Former: Story = {
  args: {
    officer: {
      id: '2',
      name: 'John Smith',
      title: "Former VP", category: "exec",
      image: 'https://placehold.co/400',
      
      
      
      
    },
  },
};

