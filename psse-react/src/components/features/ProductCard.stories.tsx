import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';
import { http, HttpResponse } from 'msw';
import type { Product } from '../../types';

const meta = {
  title: 'Features/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onOrder: { action: 'ordered' },
    onAddToCart: { action: 'added to cart' },
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseProduct: Product = {
  id: 'mock-product-id',
  name: 'PSSE Premium Hoodie',
  description: 'Stay warm while coding with this premium PSSE hoodie. Features a minimalist logo design.',
  price: 850,
  image: 'https://placehold.co/400x400',
  category: 'tshirt',
  stock: 50,
  addedDate: '2024-01-01',
  featured: false,
  specifications: [],
};

// Because `useOrders()` looks up `products` from Context (populated via GET /products API),
// we need to mock the /products endpoint so the Context has the product and stock status logic works.
const createProductMock = (productOverrides: Partial<Product>) => {
  return http.get('*/products', () => {
    return HttpResponse.json([
      {
        id: productOverrides.id || baseProduct.id,
        name: productOverrides.name || baseProduct.name,
        description: productOverrides.description || baseProduct.description,
        price: productOverrides.price || baseProduct.price,
        stock: productOverrides.stock !== undefined ? productOverrides.stock : baseProduct.stock,
        category: (productOverrides.category || baseProduct.category).toUpperCase(),
        imageUrl: productOverrides.image || baseProduct.image,
        isFeatured: productOverrides.featured || baseProduct.featured,
      }
    ]);
  });
};

export const Default: Story = {
  args: {
    product: baseProduct,
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({})] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};

export const Featured: Story = {
  args: {
    product: { ...baseProduct, featured: true },
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({ featured: true })] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};

export const LowStockEdgeCase: Story = {
  args: {
    product: { ...baseProduct, stock: 3 },
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({ stock: 3 })] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};

export const OutOfStockSadPath: Story = {
  args: {
    product: { ...baseProduct, stock: 0 },
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({ stock: 0 })] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};

export const MissingImageSadPath: Story = {
  args: {
    product: { ...baseProduct, image: 'https://invalid-url.com/broken.jpg' },
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({ image: 'https://invalid-url.com/broken.jpg' })] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};

export const LongDescriptionSadPath: Story = {
  args: {
    product: {
      ...baseProduct,
      name: 'A Very Long Product Name That Will Wrap To Multiple Lines',
      description: 'This is an extremely long description designed to test how the card handles excessive text. It should probably truncate or flex properly without breaking the design of the card or pushing buttons out of view. We want to ensure the layout remains stable.',
    },
    showPurchaseOptions: true,
  },
  parameters: {
    msw: { handlers: [createProductMock({ stock: 100 })] },
  },
  decorators: [(Story) => <div className="w-[300px] h-[500px]"><Story /></div>],
};
