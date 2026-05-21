import type { Meta, StoryObj } from '@storybook/react-vite';
import CreateEventModal from './CreateEventModal';
import { useState } from 'react';

const meta = {
  title: 'Features/CreateEventModal',
  component: CreateEventModal,
  tags: ['autodocs'],
} satisfies Meta<typeof CreateEventModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSuccess: () => {},
  },
};

export const Interactive: Story = {
  args: { isOpen: false, onClose: () => {} },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded">Create Event</button>
        <CreateEventModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSuccess={() => setIsOpen(false)} />
      </div>
    );
  },
};

