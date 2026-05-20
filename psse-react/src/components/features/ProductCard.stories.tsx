import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';
import { OrderProvider } from '../../context';
import { http, HttpResponse } from 'msw';

const meta: Meta<typeof ProductCard> = {
  title: 'Features/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <OrderProvider>
        <div className="max-w-sm">
          <Story />
        </div>
      </OrderProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const mockProduct = {
  id: 'lan_001',
  name: 'PSSE Classic Lanyard',
  description: 'Official PSSE lanyard featuring the classic logo design.',
  price: 150,
  image: '/images/placeholder-image.jpg',
  category: 'lanyard' as const,
  stock: 25,
  addedDate: '2024-12-01',
  featured: true,
  specifications: ['Durable polyester material'],
};

const assertText = (root: HTMLElement, re: RegExp, message: string) => {
  if (!re.test(root.textContent ?? '')) {
    throw new Error(message);
  }
};

export const InStock: Story = {
  args: {
    product: mockProduct,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json([
            {
              id: 'lan_001',
              name: 'PSSE Classic Lanyard',
              description: 'Official PSSE lanyard featuring the classic logo design.',
              price: 150,
              imageUrl: '/images/placeholder-image.jpg',
              category: 'LANYARD',
              stock: 25,
              isFeatured: true,
            },
          ]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    assertText(canvasElement, /Featured/i, 'Featured badge missing.');
    assertText(canvasElement, /Stock:\s*25/i, 'Stock count missing.');
    assertText(canvasElement, /₱150/i, 'Price missing.');
  },
};

export const LowStock: Story = {
  args: {
    product: { ...mockProduct, id: 'low_stock_1', stock: 3 },
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json([
            {
              id: 'low_stock_1',
              name: 'PSSE Classic Lanyard',
              description: 'Official PSSE lanyard featuring the classic logo design.',
              price: 150,
              imageUrl: '/images/placeholder-image.jpg',
              category: 'LANYARD',
              stock: 3,
              isFeatured: true,
            },
          ]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    assertText(canvasElement, /Only 3 left/i, 'Low stock badge missing.');
  },
};

export const OutOfStock: Story = {
  args: {
    product: { ...mockProduct, id: 'out_of_stock_1', stock: 0 },
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json([
            {
              id: 'out_of_stock_1',
              name: 'PSSE Classic Lanyard',
              description: 'Official PSSE lanyard featuring the classic logo design.',
              price: 150,
              imageUrl: '/images/placeholder-image.jpg',
              category: 'LANYARD',
              stock: 0,
              isFeatured: true,
            },
          ]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    assertText(canvasElement, /Out of Stock/i, 'Out of stock badge missing.');
  },
};
