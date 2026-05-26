import type { Meta, StoryObj } from '@storybook/react-vite';
import { Merchandise } from './Merchandise';
import { UserAuthContext } from '../context/UserAuthContext';
import { OrderContext } from '../context/OrderContext';
import type { Product } from '../types';

interface MockProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  products?: Product[];
  isLoadingProducts?: boolean;
  productsError?: string | null;
  cartCount?: number;
}

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'PSSE Official Lanyard 2025',
    description: 'High-quality lanyard with PSSE branding.',
    price: 150,
    category: 'lanyard',
    image: 'https://placehold.co/400x400?text=Lanyard',
    stock: 50,
    featured: true,
    addedDate: new Date().toISOString(),
    specifications: [],
  },
  {
    id: '2',
    name: 'PSSE Classic T-Shirt',
    description: 'Comfortable cotton t-shirt with PSSE logo.',
    price: 350,
    category: 'tshirt',
    image: 'https://placehold.co/400x400?text=T-Shirt',
    stock: 20,
    featured: true,
    addedDate: new Date().toISOString(),
    specifications: [],
  },
  {
    id: '3',
    name: 'PSSE Codefest T-Shirt',
    description: 'Limited edition Codefest t-shirt. Out of stock!',
    price: 400,
    category: 'tshirt',
    image: 'https://placehold.co/400x400?text=Codefest+T-Shirt',
    stock: 0,
    featured: false,
    addedDate: new Date().toISOString(),
    specifications: [],
  },
];

const MockProviders = ({ 
  children, 
  isAuthenticated = false, 
  products = defaultProducts,
  isLoadingProducts = false,
  productsError = null,
  cartCount = 0
}: MockProviderProps) => {
  const mockUserAuth = {
    user: isAuthenticated ? { id: '1', name: 'Test User', email: 'test@cpu.edu.ph', studentId: '20-1234-56', role: 'MEMBER' } : null,
    isAuthenticated,
    isLoading: false,
    token: isAuthenticated ? 'fake-token' : null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    resendVerification: async () => {},
  };

  const mockOrder = {
    products,
    isLoadingProducts,
    productsError,
    cart: [],
    addToCart: () => true,
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    getCartTotal: () => 0,
    getCartItemCount: () => cartCount,
    validateCartStock: async () => ({ isValid: true, items: [] }),
    getStockStatus: () => 'IN_STOCK',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkout: async () => ({ id: '1', orderNumber: '1', items: [], totalAmount: 0, status: 'PENDING', userId: '1', createdAt: '', updatedAt: '' } as any),
  };
  return (
    <UserAuthContext.Provider value={mockUserAuth as unknown as React.ComponentProps<typeof UserAuthContext.Provider>['value']}>
      <OrderContext.Provider value={mockOrder as unknown as React.ComponentProps<typeof OrderContext.Provider>['value']}>
        {children}
      </OrderContext.Provider>
    </UserAuthContext.Provider>
  );
};

const meta: Meta<typeof Merchandise> = {
  title: 'Pages/Merchandise',
  component: Merchandise,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Merchandise>;

export const AuthenticatedWithProducts: Story = {
  decorators: [
    (Story) => (
      <MockProviders isAuthenticated={true}>
        <Story />
      </MockProviders>
    ),
  ],
};

export const Unauthenticated: Story = {
  decorators: [
    (Story) => (
      <MockProviders isAuthenticated={false}>
        <Story />
      </MockProviders>
    ),
  ],
};

export const WithItemsInCart: Story = {
  decorators: [
    (Story) => (
      <MockProviders isAuthenticated={true} cartCount={3}>
        <Story />
      </MockProviders>
    ),
  ],
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <MockProviders isLoadingProducts={true} products={[]}>
        <Story />
      </MockProviders>
    ),
  ],
};

export const Error: Story = {
  decorators: [
    (Story) => (
      <MockProviders productsError="Failed to fetch products from server. Please try again later." products={[]}>
        <Story />
      </MockProviders>
    ),
  ],
};

export const Empty: Story = {
  decorators: [
    (Story) => (
      <MockProviders products={[]}>
        <Story />
      </MockProviders>
    ),
  ],
};

