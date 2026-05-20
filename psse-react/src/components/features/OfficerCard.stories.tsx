import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficerCard } from './OfficerCard';

const meta: Meta<typeof OfficerCard> = {
  title: 'Features/OfficerCard',
  component: OfficerCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OfficerCard>;

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

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message
) => {
  if (!condition) {
    throw new Error(message);
  }
};

export const Executive: Story = {
  args: {
    officer: {
      id: '1',
      name: 'Vince Amiel Latabe',
      title: 'President',
      image: '/images/placeholder-image.jpg',
      category: 'exec',
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Vince Amiel Latabe/i);
    await waitForText(canvasElement, /President/i);
  },
};

export const Admin: Story = {
  args: {
    officer: {
      id: '2',
      name: 'Jane Doe',
      title: 'Secretary',
      image: '/images/placeholder-image.jpg',
      category: 'admin',
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Jane Doe/i);
    await waitForText(canvasElement, /Secretary/i);
  },
};

export const LongName: Story = {
  args: {
    officer: {
      id: '3',
      name: 'Maria Clara de la Cruz y Constantino',
      title: 'Assistant Business Manager',
      image: '/images/placeholder-image.jpg',
      category: 'finance',
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Maria Clara de la Cruz/i);
    const titled = canvasElement.querySelector('[title="Maria Clara de la Cruz y Constantino"]');
    assert(titled, 'Expected title attribute for long officer name.');
  },
};

export const MissingPhoto: Story = {
  args: {
    officer: {
      id: '4',
      name: 'No Photo Officer',
      title: 'Ambassador',
      image: 'invalid-path.jpg',
      category: 'ambassador',
    },
  },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('img') as HTMLImageElement | null;
    assert(img, 'Officer image not found.');
    img.dispatchEvent(new Event('error'));
    await sleep(50);
    assert(
      img.src.includes('/images/placeholder-image.jpg'),
      'Fallback image was not applied.'
    );
  },
};
