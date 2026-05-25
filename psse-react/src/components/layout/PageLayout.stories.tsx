import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageLayout } from './PageLayout';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
    // Mock auth so the Navbar doesn't crash or hang
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const DummyContent = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Page</h1>
    <p className="text-gray-600">
      This is a simple container to demonstrate the PageLayout. The Navbar should be at the top, and the Footer at the bottom.
    </p>
  </div>
);

export const DefaultContent: Story = {
  args: {
    children: <DummyContent />,
  },
};

const LongDummyContent = () => (
  <div className="p-8 max-w-4xl mx-auto space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">Scrollable Page</h1>
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-2">Section {i + 1}</h3>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
      </div>
    ))}
  </div>
);

export const ScrollableContent: Story = {
  args: {
    children: <LongDummyContent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the layout with a large amount of content. The Navbar should remain sticky at the top, and the Footer should push to the very bottom after the content.',
      },
    },
  },
};
