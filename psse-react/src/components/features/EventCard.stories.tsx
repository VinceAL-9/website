import type { Meta, StoryObj } from '@storybook/react-vite';
import { EventCard } from './EventCard';

const meta: Meta<typeof EventCard> = {
  title: 'Features/EventCard',
  component: EventCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventCard>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForText = async (root: HTMLElement, re: RegExp, timeout = 2000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (re.test(root.textContent ?? '')) {
      return;
    }
    await sleep(50);
  }
  throw new Error(`Timed out waiting for text: ${re}`);
};

export const Upcoming: Story = {
  args: {
    event: {
      id: '1',
      title: 'Startup Pitch Competition',
      description: 'A start-up live pitching competition.',
      image: '/images/background-cover.jpg',
      date: 'March 2024',
      badge: { text: 'Competition', variant: 'primary' },
      stats: 'Venue: CPU Gym',
      isUpcoming: true,
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Startup Pitch Competition/i);
    await waitForText(canvasElement, /Competition/i);
    await waitForText(canvasElement, /March 2024/i);
  },
};

export const Past: Story = {
  args: {
    event: {
      id: '2',
      title: 'Advanced React Workshop',
      description: 'Hands-on workshop focusing on advanced React concepts.',
      image: '/images/placeholder-image.jpg',
      date: 'November 2023',
      badge: { text: 'Workshop', variant: 'secondary' },
      stats: 'Venue: EN205',
      isUpcoming: false,
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Advanced React Workshop/i);
    await waitForText(canvasElement, /Workshop/i);
    await waitForText(canvasElement, /November 2023/i);
  },
};

export const Hackathon: Story = {
  args: {
    event: {
      id: '3',
      title: 'PSSE Hackathon 2024',
      description: '48-hour intensive hackathon.',
      image: '/images/placeholder-image.jpg',
      date: 'October 2024',
      badge: { text: 'Hackathon', variant: 'danger' },
      stats: 'Venue: Engineering Building',
      isUpcoming: true,
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /PSSE Hackathon 2024/i);
    await waitForText(canvasElement, /Hackathon/i);
    await waitForText(canvasElement, /October 2024/i);
  },
};
