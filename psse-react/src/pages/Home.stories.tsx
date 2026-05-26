import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { Home } from './Home';
import { UserAuthContext } from '../context/UserAuthContext';
import { OrderContext } from '../context/OrderContext';
import type { ApiEvent } from '../types';

// Mock context providers
const MockProviders = ({ children, isAuthenticated = false }: { children: React.ReactNode, isAuthenticated?: boolean }) => {
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

const meta: Meta<typeof Home> = {
  title: 'Pages/Home',
  component: Home,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Home>;

const mockUpcomingEvents: ApiEvent[] = [
  {
    id: '1',
    title: 'Codefest 2026',
    description: 'Annual programming competition for SE students.',
    date: '2026-01-15T00:00:00.000Z',
    location: 'CPU Engineering Building',
    imageUrl: 'https://placehold.co/600x400?text=Codefest',
    isUpcoming: true,
  },
  {
    id: '2',
    title: 'React Workshop',
    description: 'Learn the basics of React 19 and Vite.',
    date: '2026-03-20T00:00:00.000Z',
    location: 'ComLab 1',
    imageUrl: 'https://placehold.co/600x400?text=React+Workshop',
    isUpcoming: true,
  },
  {
    id: '3',
    title: 'Career Talk',
    description: 'Insights from industry professionals.',
    date: '2026-04-10T00:00:00.000Z',
    location: 'Review Center',
    imageUrl: 'https://placehold.co/600x400?text=Career+Talk',
    isUpcoming: true,
  },
];

export const Default: Story = {
  decorators: [
    (Story) => (
      <MockProviders isAuthenticated={false}>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/events', () => {
          return HttpResponse.json(mockUpcomingEvents);
        }),
      ],
    },
  },
};

export const Authenticated: Story = {
  decorators: [
    (Story) => (
      <MockProviders isAuthenticated={true}>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/events', () => {
          return HttpResponse.json(mockUpcomingEvents);
        }),
      ],
    },
  },
};

export const LoadingEvents: Story = {
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/events', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorEvents: Story = {
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/events', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Internal Server Error',
          });
        }),
      ],
    },
  },
};

export const NoUpcomingEvents: Story = {
  decorators: [
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/events', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
