import type { Meta, StoryObj } from '@storybook/react-vite';
import { Merchandise } from './Merchandise';
import { OrderProvider, UserAuthProvider } from '../context';
import { http, HttpResponse, delay } from 'msw';

const meta: Meta<typeof Merchandise> = {
  title: 'Pages/Merchandise',
  component: Merchandise,
  decorators: [
    (Story) => (
      <UserAuthProvider>
        <OrderProvider>
          <Story />
        </OrderProvider>
      </UserAuthProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Merchandise>;

const mockProducts = [
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
  {
    id: 'tsh_001',
    name: 'PSSE Code Life T-Shirt',
    description: 'Comfortable cotton tee with "Code Life" design.',
    price: 350,
    imageUrl: '/images/placeholder-image.jpg',
    category: 'TSHIRT',
    stock: 12,
    isFeatured: true,
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForText = async (root: HTMLElement, re: RegExp, timeout = 5000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (re.test(root.textContent ?? '')) {
      return;
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for text: ${re}`);
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
        http.get('*/products', async () => {
          await delay('infinite');
          return HttpResponse.json([]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Loading products/i);
  },
};

export const Success: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json(mockProducts);
        }),
        http.get('*/auth/profile', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /PSSE Classic Lanyard/i);
    await waitForText(canvasElement, /Login to purchase merchandise/i);
  },
};

export const Authenticated: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json(mockProducts);
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({
            id: 'u1',
            email: 'member@cpu.edu.ph',
            name: 'Juan Dela Cruz',
            role: 'MEMBER',
            studentId: '2021-00001',
          });
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /PSSE Classic Lanyard/i);

    const addButtons = Array.from(canvasElement.querySelectorAll('button')).filter((el) =>
      /Add to Cart/i.test(el.textContent ?? '')
    );
    if (addButtons.length === 0) {
      throw new Error('Add to Cart button not found.');
    }

    (addButtons[0] as HTMLButtonElement).click();
    await waitForText(canvasElement, /added to cart/i);

    const viewCart = getButtonByText(canvasElement, /View Cart/i);
    if (!/\b1\b/.test(viewCart.textContent ?? '')) {
      throw new Error('Cart count badge did not update.');
    }
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
  name: 'Error',
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Oops! Something went wrong/i);
    getButtonByText(canvasElement, /Try Again/i);
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json([]);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /No products available at the moment/i);
  },
};
