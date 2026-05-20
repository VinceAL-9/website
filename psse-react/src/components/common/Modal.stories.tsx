import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Common/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Modal Title',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p>This is the modal content.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    title: 'Small Modal',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    title: 'Large Modal',
  },
};

export const ExtraLarge: Story = {
  args: {
    ...Default.args,
    size: 'xl',
    title: 'Extra Large Modal',
  },
};

export const EdgeCaseLongText: Story = {
  args: {
    isOpen: true,
    title: 'This is an exceptionally long modal title that is designed to test how the modal header handles extremely lengthy text that might potentially overflow the title container.',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p>This modal body also contains a very large amount of text to test vertical overflow and scroll behavior within the modal content area when the text length exceeds typical boundaries.</p>
        <div className="flex justify-end gap-3">
          <Button variant="primary">Acknowledge</Button>
        </div>
      </div>
    ),
  },
};
