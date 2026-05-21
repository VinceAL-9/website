import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckoutModal } from './CheckoutModal';
import { useState } from 'react';

const meta = {
  title: 'Features/CheckoutModal',
  component: CheckoutModal,
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
};

export const Interactive: Story = {
  args: { isOpen: false, onClose: () => {} },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary-600 text-white rounded">Checkout Product</button>
        <CheckoutModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    );
  },
};
