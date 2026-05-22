import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const DEFAULT_MODAL_ARGS = {
  isOpen: false,
  onClose: () => {},
};

const meta = {
  title: 'Common/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: DEFAULT_MODAL_ARGS,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    isOpen: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to handle state in Storybook
const ModalWrapper = (args: React.ComponentProps<typeof Modal>) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={handleClose}>
        {args.children}
      </Modal>
    </div>
  );
};

// Happy Paths
export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Example Modal',

    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          This is the content of the modal. You can place any components here.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    ),

    isOpen: true
  },
};

export const WithoutTitle: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    children: (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
        <h3 className="text-xl font-bold text-gray-900">Success!</h3>
        <p className="text-gray-600">Your operation was completed successfully.</p>
        <Button>Continue</Button>
      </div>
    ),

    isOpen: true
  },
};

export const SmallSize: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Confirm Action',
    size: 'sm',

    children: (
      <div className="space-y-4">
        <p className="text-gray-600">Are you sure you want to proceed? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
    ),

    isOpen: true
  },
};

export const ExtraLargeSize: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Detailed Information',
    size: 'xl',

    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
          <span className="text-gray-400">Media Preview</span>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Properties</h4>
          <p className="text-gray-600">A very large modal suitable for complex forms, split views, or detailed layouts.</p>
          <div className="space-y-2">
             <div className="h-10 bg-gray-50 rounded border border-gray-200 w-full animate-pulse"></div>
             <div className="h-10 bg-gray-50 rounded border border-gray-200 w-3/4 animate-pulse"></div>
             <div className="h-10 bg-gray-50 rounded border border-gray-200 w-5/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    ),

    isOpen: true
  },
};

// Sad Paths
export const LongContentScrollSadPath: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: 'Terms and Conditions',

    children: (
      <div className="space-y-4">
        <p className="font-semibold text-gray-900">Please read the following carefully. The modal should scroll gracefully.</p>
        {Array.from({ length: 15 }).map((_, i) => (
          <p key={i} className="text-gray-600">
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        ))}
      </div>
    ),

    isOpen: true
  },
};
