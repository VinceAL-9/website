import type { Meta, StoryObj } from '@storybook/react-vite';
import { TransactionHistory } from './user/TransactionHistory';
import { UserAuthProvider } from '../context';
import { http, HttpResponse, delay } from 'msw';

const meta: Meta<typeof TransactionHistory> = {
  title: 'Pages/TransactionHistory',
  component: TransactionHistory,
  decorators: [
    (Story) => (
      <UserAuthProvider>
        <Story />
      </UserAuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TransactionHistory>;

const mockOrders = [
  {
    id: 'ord_1',
    referenceId: 'PSSE-2026-X1Y2Z3',
    customerName: 'Juan Dela Cruz',
    studentId: '2021-00001',
    contactNumber: '09123456789',
    customerEmail: 'member@cpu.edu.ph',
    totalAmount: 300,
    status: 'PENDING',
    paymentProofUrl: null,
    createdAt: '2026-05-20T10:00:00Z',
    orderItems: [
      {
        id: 'oi_1',
        quantity: 2,
        priceAtTime: 150,
        product: {
          name: 'PSSE Classic Lanyard',
          imageUrl: '/images/placeholder-image.jpg',
        },
      },
    ],
  },
  {
    id: 'ord_2',
    referenceId: 'PSSE-2026-A1B2C3',
    customerName: 'Juan Dela Cruz',
    studentId: '2021-00001',
    contactNumber: '09123456789',
    customerEmail: 'member@cpu.edu.ph',
    totalAmount: 350,
    status: 'COMPLETED',
    paymentProofUrl: 'https://via.placeholder.com/150',
    createdAt: '2026-05-18T14:30:00Z',
    orderItems: [
      {
        id: 'oi_2',
        quantity: 1,
        priceAtTime: 350,
        product: {
          name: 'PSSE Code Life T-Shirt',
          imageUrl: '/images/placeholder-image.jpg',
        },
      },
    ],
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (predicate: () => boolean, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (predicate()) {
      return;
    }
    await sleep(100);
  }
  throw new Error('Timed out waiting for condition.');
};

const waitForText = async (root: HTMLElement, re: RegExp, timeout = 5000) => {
  await waitFor(() => re.test(root.textContent ?? ''), timeout);
};

const getButtonByText = (root: HTMLElement, re: RegExp) => {
  const button = Array.from(root.querySelectorAll('button')).find((el) =>
    re.test(el.textContent ?? '')
  );
  if (!button) {
    throw new Error(`Button not found: ${re}`);
  }
  return button as HTMLButtonElement;
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ id: 'u1', role: 'MEMBER', name: 'Juan' });
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
        http.get('*/orders/mine', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => !!canvasElement.querySelector('.animate-spin'));
  },
};

export const Success: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ id: 'u1', role: 'MEMBER', name: 'Juan' });
        }),
        http.get('*/orders/mine', () => {
          return HttpResponse.json(mockOrders);
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Transaction History/i);
    await waitForText(canvasElement, /PSSE-2026-X1Y2Z3/i);

    getButtonByText(canvasElement, /Cancel Order/i).click();
    await waitForText(canvasElement, /Are you sure you want to cancel/i);
    getButtonByText(canvasElement, /No, Keep Order/i).click();
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ id: 'u1', role: 'MEMBER', name: 'Juan' });
        }),
        http.get('*/orders/mine', () => {
          return HttpResponse.json([]);
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /No Orders Yet/i);
    getButtonByText(canvasElement, /Browse Merchandise/i);
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ id: 'u1', role: 'MEMBER', name: 'Juan' });
        }),
        http.get('*/orders/mine', () => {
          return new HttpResponse(null, { status: 500 });
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
      ],
    },
  },
  name: 'Error',
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Failed to load transaction history/i);
  },
};
