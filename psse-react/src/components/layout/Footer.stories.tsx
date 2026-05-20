import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const MobileViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const TabletViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
