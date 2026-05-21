import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

const meta = {
  component: ProductCard,
  tags: ['ai-generated'],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockProduct: Product = {
  id: '1',
  name: 'PSSE Lanyard',
  description: 'High quality nylon lanyard with silk screen printing.',
  price: 150,
  stock: 50,
  category: 'lanyard',
  image: 'https://placehold.co/400x400',
  featured: true,
  addedDate: '2023-10-01T00:00:00Z',
  specifications: ['High Quality', 'Silk Screen'],
};

export const Default: Story = {
  args: {
    product: mockProduct,
    onOrder: () => console.log('Buy Now'),
    onAddToCart: () => console.log('Add to Cart'),
  },
};

export const OutOfStock: Story = {
  args: {
    product: { ...mockProduct, stock: 0 },
    onOrder: () => {},
  },
};
