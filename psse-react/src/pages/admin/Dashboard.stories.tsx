import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { Dashboard } from './Dashboard';
import { OrderStatus, Category } from '../../types/api.types';
import type { ApiEvent, ApiOrder, ApiOfficer, ApiProduct } from '../../types';

// Mock Data
const mockEvents: ApiEvent[] = [
  {
    id: 'e1',
    title: 'General Assembly',
    description: 'Annual general assembly for all members.',
    date: '2026-06-15T08:00:00.000Z',
    location: 'Main Auditorium',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: true,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
  {
    id: 'e2',
    title: 'Hackathon 2025',
    description: 'Past hackathon event.',
    date: '2025-10-20T08:00:00.000Z',
    location: 'Computer Lab 1',
    imageUrl: 'https://via.placeholder.com/150',
    isUpcoming: false,
  },
];

const mockOrders: ApiOrder[] = [
  {
    id: 'o1',
    referenceId: 'REF-001',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan@example.com',
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
    customerName: 'Maria Santos',
    customerEmail: 'maria@example.com',
    studentId: '2023-0002',
    contactNumber: '09123456780',
    totalAmount: 1500,
    status: OrderStatus.PAID, // Needs review
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
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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
  {
    id: 'o3',
    referenceId: 'REF-003',
    customerName: 'Pedro Penduko',
    customerEmail: 'pedro@example.com',
    studentId: '2022-0010',
    contactNumber: '09123456781',
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

const mockOfficers: ApiOfficer[] = [
  {
    id: 'off1',
    name: 'Ada Lovelace',
    position: 'President',
    category: 'EXEC',
    academicYear: '2025-2026',
    order: 1,
    photoUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 'off2',
    name: 'Alan Turing',
    position: 'Vice President',
    category: 'EXEC',
    academicYear: '2025-2026',
    order: 2,
    photoUrl: 'https://via.placeholder.com/150',
  },
];

const mockProducts: ApiProduct[] = [
  {
    id: 'p1',
    name: 'PSSE Official T-Shirt',
    description: 'Cotton t-shirt with PSSE logo.',
    price: 500,
    stock: 50,
    category: Category.TSHIRT,
    imageUrl: 'https://via.placeholder.com/150',
    isFeatured: true,
  },
  {
    id: 'p2',
    name: 'PSSE Lanyard',
    description: 'Durable lanyard for your ID.',
    price: 150,
    stock: 5, // Low stock
    category: Category.LANYARD,
    imageUrl: 'https://via.placeholder.com/150',
    isFeatured: false,
  },
];

// Admin Auth Mock Setup
const adminAuthHandlers = [
  http.get('*/auth/profile', () => {
    return HttpResponse.json({
      id: 'admin1',
      email: 'admin@psse.org',
      name: 'System Admin',
      role: 'ADMIN',
      studentId: null,
    });
  }),
  http.post('*/auth/refresh', () => {
    return HttpResponse.json({
      access_token: 'mock_admin_token',
    });
  }),
];

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RouteNavigator = ({ route }: { route: string }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(route, { replace: true });
  }, [navigate, route]);
  return null;
};

const meta = {
  title: 'Pages/Admin/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      localStorage.setItem('user_access_token', 'mock_admin_token');
      const route = context.parameters?.route || '/admin/dashboard/events';
      return (
        <>
          <RouteNavigator route={route} />
          <Story />
        </>
      );
    },
  ],
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Happy Paths ---

export const EventsView: Story = {
  parameters: {
    route: '/admin/dashboard/events',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/events', () => HttpResponse.json(mockEvents)),
      ],
    },
  },
};

export const OrdersView: Story = {
  parameters: {
    route: '/admin/dashboard/orders',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/orders', () => HttpResponse.json(mockOrders)),
      ],
    },
  },
};

export const OfficersView: Story = {
  parameters: {
    route: '/admin/dashboard/officers',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/officers', () => HttpResponse.json(mockOfficers)),
      ],
    },
  },
};

export const ProductsView: Story = {
  parameters: {
    route: '/admin/dashboard/products',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/products', () => HttpResponse.json(mockProducts)),
      ],
    },
  },
};

// --- Empty States ---

export const EmptyEvents: Story = {
  parameters: {
    route: '/admin/dashboard/events',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/events', () => HttpResponse.json([])),
      ],
    },
  },
};

export const EmptyOrders: Story = {
  parameters: {
    route: '/admin/dashboard/orders',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/orders', () => HttpResponse.json([])),
      ],
    },
  },
};

// --- Sad Paths (Loading and Error) ---

export const LoadingState: Story = {
  parameters: {
    route: '/admin/dashboard/events',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/events', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    route: '/admin/dashboard/events',
    msw: {
      handlers: [
        ...adminAuthHandlers,
        http.get('*/events', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        }),
      ],
    },
  },
};
