import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from './Modal';
import { useState } from 'react';

const meta = {
  title: 'Common/Modal',
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: 'Modal Title',
    children: <div>Modal Content</div>,
  },
};

export const Interactive: Story = {
  args: { isOpen: false, onClose: () => {}, children: <div></div> },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded">Open Modal</button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Interactive Modal">
          <p>This modal can be closed!</p>
        </Modal>
      </div>
    );
  },
};

