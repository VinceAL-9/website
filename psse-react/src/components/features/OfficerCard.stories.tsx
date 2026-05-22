import type { Meta, StoryObj } from '@storybook/react-vite';
import { OfficerCard } from './OfficerCard';
import type { Officer } from '../../types';

const meta = {
  title: 'Features/OfficerCard',
  component: OfficerCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OfficerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOfficer: Officer = {
  id: '1',
  name: 'John Doe',
  title: 'President',
  image: 'https://placehold.co/200x200',
  category: 'exec',
};

export const Default: Story = {
  args: {
    officer: defaultOfficer,
  },
  decorators: [
    (Story) => (
      <div className="w-50 h-62.5">
        <Story />
      </div>
    ),
  ],
};

export const MissingPhotoSadPath: Story = {
  args: {
    officer: {
      ...defaultOfficer,
      image: 'https://invalid-url.com/broken-image.jpg',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-50 h-62.5">
        <Story />
      </div>
    ),
  ],
};

export const LongNameAndTitleSadPath: Story = {
  args: {
    officer: {
      ...defaultOfficer,
      name: 'Hubert Blaine Wolfeschlegelsteinhausenbergerdorff Sr.',
      title: 'Vice President of Internal and External Organizational Affairs and Management',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-50 h-62.5">
        <Story />
      </div>
    ),
  ],
};

export const WithoutName: Story = {
  args: {
    officer: {
      id: '2',
      title: 'General Member Representative',
      image: 'https://placehold.co/200x200',
      category: 'rep',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-50 h-62.5">
        <Story />
      </div>
    ),
  ],
};
