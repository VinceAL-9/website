import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Filter } from './Filter';

const meta = {
  title: 'Common/Filter',
  component: Filter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper to handle state in Storybook
const FilterWrapper = (args: React.ComponentProps<typeof Filter>) => {
  const [selected, setSelected] = useState(args.selected);
  return <Filter {...args} selected={selected} onFilterChange={setSelected} />;
};

// Happy Paths
export const Default: Story = {
  render: (args) => <FilterWrapper {...args} />,
  args: {
    label: 'Filter by Category',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Shirts', value: 'shirts' },
      { label: 'Hoodies', value: 'hoodies' },
      { label: 'Accessories', value: 'accessories' },
    ],
    selected: 'all',
    onFilterChange: () => {},
  },
};

export const WithoutLabel: Story = {
  render: (args) => <FilterWrapper {...args} />,
  args: {
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Completed', value: 'completed' },
    ],
    selected: 'pending',
    onFilterChange: () => {},
  },
};

// Edge cases / Sad Paths
export const ManyOptions: Story = {
  render: (args) => <FilterWrapper {...args} />,
  args: {
    label: 'Select Year',
    options: Array.from({ length: 10 }, (_, i) => ({
      label: `202${i}`,
      value: `202${i}`,
    })),
    selected: '2020',
    onFilterChange: () => {},
  },
};

export const LongLabelsSadPath: Story = {
  render: (args) => <FilterWrapper {...args} />,
  args: {
    label: 'Filter by Description',
    options: [
      { label: 'Extremely Long Filter Option One', value: 'long1' },
      { label: 'Another Very Long Filter Option Two', value: 'long2' },
      { label: 'Short', value: 'short' },
    ],
    selected: 'short',
    onFilterChange: () => {},
  },
};

export const NoOptionsSadPath: Story = {
  render: (args) => <Filter {...args} />,
  args: {
    label: 'No Options Available',
    options: [],
    selected: '',
    onFilterChange: () => {},
  },
};
