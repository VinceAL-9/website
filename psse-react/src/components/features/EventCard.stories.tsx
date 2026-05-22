import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventCard } from './EventCard';
import type { Event } from '../../types';

const meta = {
  title: 'Features/EventCard',
  component: EventCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultEvent: Event = {
  id: '1',
  title: 'React Fundamentals Workshop',
  description: 'Join us for a comprehensive workshop on React fundamentals. Perfect for beginners!',
  image: 'https://placehold.co/600x400',
  date: 'October 25, 2024',
  badge: { text: 'Workshop', variant: 'secondary' },
  stats: 'Virtual',
  isUpcoming: true,
};

export const Default: Story = {
  args: {
    event: defaultEvent,
  },
  decorators: [
    (Story) => (
      <div className="w-87.5">
        <Story />
      </div>
    ),
  ],
};

export const PastEvent: Story = {
  args: {
    event: {
      ...defaultEvent,
      title: 'Past Annual Hackathon',
      badge: { text: 'Hackathon', variant: 'danger' },
      isUpcoming: false,
    },
  },
  decorators: [
    (Story) => (
      <div className="w-87.5">
        <Story />
      </div>
    ),
  ],
};

export const MissingImageSadPath: Story = {
  args: {
    event: {
      ...defaultEvent,
      image: 'https://invalid-url.com/broken-image.jpg',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-87.5">
        <Story />
      </div>
    ),
  ],
};

export const LongContentSadPath: Story = {
  args: {
    event: {
      ...defaultEvent,
      title: 'A Very Very Long Event Title That Might Break The Layout If We Are Not Careful About How It Wraps',
      badge: { text: 'A Very Long Badge Text', variant: 'warning' },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-87.5">
        <Story />
      </div>
    ),
  ],
};
