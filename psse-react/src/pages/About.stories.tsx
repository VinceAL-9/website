import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { About } from './About';
import { UserAuthContext } from '../context/UserAuthContext';
import { OrderContext } from '../context/OrderContext';
import type { ApiOfficer } from '../types';

// Mock context providers for layout (Navbar uses UserAuthContext and OrderContext)
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  const mockUserAuth = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    resendVerification: async () => {},
  };

  const mockOrder = {
    products: [],
    isLoadingProducts: false,
    productsError: null,
    cart: [],
    addToCart: () => true,
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    getCartTotal: () => 0,
    getCartItemCount: () => 0,
    validateCartStock: async () => ({ isValid: true, items: [] }),
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

const meta: Meta<typeof About> = {
  title: 'Pages/About',
  component: About,
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof About>;

const mockOfficers: ApiOfficer[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'President',
    category: 'exec',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=1',
    order: 1,
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Vice President',
    category: 'exec',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=2',
    order: 2,
  },
  {
    id: '3',
    name: 'Alice Johnson',
    position: 'Head of Admin',
    category: 'admin',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=3',
    order: 3,
  },
  {
    id: '4',
    name: 'Bob Brown',
    position: 'Finance Officer',
    category: 'finance',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=4',
    order: 4,
  },
  {
    id: '5',
    name: 'Charlie Davis',
    position: '1st Year Representative',
    category: 'rep',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=5',
    order: 5,
  },
  {
    id: '6',
    name: 'Diana Evans',
    position: 'Committee Head',
    category: 'committee',
    academicYear: '2025-2026',
    photoUrl: 'https://i.pravatar.cc/150?u=6',
    order: 6,
  },
];

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/officers', () => {
          return HttpResponse.json(mockOfficers);
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/officers', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const Error: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/officers', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Internal Server Error',
          });
        }),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/officers', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
