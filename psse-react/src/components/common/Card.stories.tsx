import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardBody, CardFooter, CardImage } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <h3 className="text-xl font-bold">Card Title</h3>
        </CardHeader>
        <CardBody>
          <p className="text-gray-600">This is the main content of the card.</p>
        </CardBody>
        <CardFooter>
          <button className="text-psse-accent font-medium">Read More</button>
        </CardFooter>
      </>
    ),
  },
};

export const WithImage: Story = {
  args: {
    children: (
      <>
        <CardImage src="/images/background-cover.jpg" alt="PSSE Banner" />
        <CardBody>
          <h5 className="text-lg font-bold mb-2">Card with Image</h5>
          <p className="text-gray-600">This card includes a featured image at the top.</p>
        </CardBody>
      </>
    ),
  },
};

export const NoHover: Story = {
  args: {
    hover: false,
    children: (
      <CardBody>
        <p>This card has no hover animation.</p>
      </CardBody>
    ),
  },
};
