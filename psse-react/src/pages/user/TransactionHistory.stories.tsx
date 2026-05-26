import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { TransactionHistory } from './TransactionHistory';
import { OrderStatus, Category } from '../../types/api.types';
import type { ApiOrder } from '../../types';
import { UserAuthProvider } from '../../context/UserAuthContext';

// Mock Data
const mockOrders: ApiOrder[] = [
  {
    id: 'o1',
    referenceId: 'REF-001',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan@cpu.edu.ph',
    studentId: '2023-0001',
    contactNumber: '09123456789',
    totalAmount: 500,
    status: OrderStatus.PENDING,
    paymentProofUrl: null,
    orderItems: [
      {
        id: 'oi1',
        orderId: 'o1',
        productId: 'p1',
        quantity: 1,
        priceAtTime: 500,
        product: { id: 'p1', name: 'T-Shirt', category: Category.TSHIRT, imageUrl: '' },
      },
    ],
    createdAt: '2026-05-24T10:00:00.000Z',
    updatedAt: '2026-05-24T10:00:00.000Z',
  },
  {
    id: 'o2',
    referenceId: 'REF-002',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan@cpu.edu.ph',
    studentId: '2023-0001',
    contactNumber: '09123456789',
    totalAmount: 1500,
    status: OrderStatus.PAID,
    paymentProofUrl: 'https://via.placeholder.com/300',
    orderItems: [
      {
        id: 'oi2',
        orderId: 'o2',
        productId: 'p2',
        quantity: 3,
        priceAtTime: 500,
        product: { id: 'p2', name: 'Lanyard', category: Category.LANYARD, imageUrl: '' },
      },
    ],
    createdAt: '2026-05-23T14:30:00.000Z',
    updatedAt: '2026-05-23T15:00:00.000Z',
  },
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan@cpu.edu.ph',
    studentId: '2023-0001',
    contactNumber: '09123456789',
    totalAmount: 300,
    status: OrderStatus.COMPLETED,
    paymentProofUrl: 'https://via.placeholder.com/300',
    orderItems: [
      {
        id: 'oi3',
        orderId: 'o3',
        productId: 'p3',
        quantity: 1,
        priceAtTime: 300,
        product: { id: 'p3', name: 'Sticker', category: Category.STICKER, imageUrl: '' },
      },
    ],
    createdAt: '2026-05-20T09:15:00.000Z',
    updatedAt: '2026-05-22T10:00:00.000Z',
  },
];

// User Auth Mock Setup
const userAuthHandlers = [
  http.get('*/auth/profile', () => {
    return HttpResponse.json({
      id: 'user1',
      email: 'juan@cpu.edu.ph',
      name: 'Juan Dela Cruz',
      role: 'MEMBER',
      studentId: '2023-0001',
    });
  }),
  http.post('*/auth/refresh', () => {
    return HttpResponse.json({
      access_token: 'mock_user_token',
    });
  }),
];

const meta = {
  title: 'Pages/User/TransactionHistory',
  component: TransactionHistory,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      localStorage.setItem('user_access_token', 'mock_user_token');
      return (
        <UserAuthProvider>
          <Story />
        </UserAuthProvider>
      );
    },
  ],
} satisfies Meta<typeof TransactionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Happy Paths ---

export const DataLoaded: Story = {
  parameters: {
    msw: {
      handlers: [
        ...userAuthHandlers,
        http.get('*/orders/mine', () => HttpResponse.json(mockOrders)),
      ],
    },
  },
};

// --- Empty States ---

export const EmptyState: Story = {
  parameters: {
    msw: {
      handlers: [
        ...userAuthHandlers,
        http.get('*/orders/mine', () => HttpResponse.json([])),
      ],
    },
  },
};

// --- Sad Paths (Loading and Error) ---

export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: [
        ...userAuthHandlers,
        http.get('*/orders/mine', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        ...userAuthHandlers,
        http.get('*/orders/mine', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch orders' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};
