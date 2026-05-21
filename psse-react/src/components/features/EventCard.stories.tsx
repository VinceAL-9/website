import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventCard } from './EventCard';

const meta = {
  title: 'Features/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvent = {
  id: '1',
  title: 'Tech Talk: AI in Development',
  date: '2023-11-15T00:00:00Z',
  badge: { text: "Event", variant: "primary" as const },
  description: 'Learn about how AI is shaping modern web development and software engineering.',
  image: 'https://placehold.co/600x400',
  isUpcoming: true,
  stats: "100+ Expected",
};

export const Upcoming: Story = {
  args: {
    event: mockEvent,
  },
};

export const Past: Story = {
  args: {
    event: { ...mockEvent, isUpcoming: false, date: '2022-11-15T00:00:00Z' },
  },
};

export const NoImage: Story = {
  args: {
    event: { ...mockEvent, image: '' },
  },
};


