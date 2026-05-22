import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardBody, CardFooter, CardImage } from './Card';

const meta = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Happy Paths
export const Default: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Card className="max-w-sm" {...args}>
      <CardImage src="https://placehold.co/400x200" alt="Placeholder" />
      <CardHeader>
        <h3 className="text-lg font-bold">Card Title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600">
          This is a sample card body with some description text. It shows how the content
          looks inside the card component.
        </p>
      </CardBody>
      <CardFooter>
        <button className="text-psse-accent font-medium">Read More</button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutImage: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Card className="max-w-sm" {...args}>
      <CardHeader>
        <h3 className="text-lg font-bold">Text Only Card</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600">
          A card without an image header. Good for simple information or alerts.
        </p>
      </CardBody>
    </Card>
  ),
};

export const Interactive: Story = {
  args: {
    children: null,
    hover: true,
    onClick: () => alert('Card clicked!'),
  },
  render: (args) => (
    <Card className="max-w-sm cursor-pointer" {...args}>
      <CardBody>
        <h3 className="text-lg font-bold mb-2">Interactive Card</h3>
        <p className="text-gray-600">
          Hover over this card to see the hover effect, and click it to trigger an action.
        </p>
      </CardBody>
    </Card>
  ),
};

// Sad Paths
export const MissingImageSadPath: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Card className="max-w-sm" {...args}>
      {/* Intentionally passing a broken URL to trigger the onError handler in CardImage */}
      <CardImage src="https://invalid-url.com/broken-image.jpg" alt="Broken image" />
      <CardBody>
        <h3 className="text-lg font-bold mb-2">Broken Image Fallback</h3>
        <p className="text-gray-600">
          This card demonstrates the fallback behavior when an image fails to load.
        </p>
      </CardBody>
    </Card>
  ),
};

export const LongContentSadPath: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Card className="max-w-sm" {...args}>
      <CardHeader>
        <h3 className="text-lg font-bold truncate">A Very Very Long Card Title That Should Definitely Truncate</h3>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 line-clamp-3">
          This is an extremely long body text that demonstrates how the card handles excessive content. It should ideally be clamped or truncated so that the card does not expand infinitely and break the layout of the grid. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </CardBody>
    </Card>
  ),
};
