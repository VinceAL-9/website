import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { CheckoutModal } from './CheckoutModal';
import { OrderProvider, UserAuthProvider, useOrders } from '../../context';
import { http, HttpResponse, delay } from 'msw';
import { MemoryRouter } from 'react-router-dom';

// Helper component to pre-fill the cart
const CartInitializer = ({ children, items }: { children: ReactNode, items: { id: string, qty: number }[] }) => {
  const { addToCart, clearCart, getProductById, isLoadingProducts } = useOrders();
  const initializedKey = useRef<string | null>(null);
  const itemsKey = useMemo(
    () => items.map((item) => `${item.id}:${item.qty}`).join('|'),
    [items]
  );

  useEffect(() => {
    if (isLoadingProducts) {
      return;
    }

    const hasProducts = items.every((item) => !!getProductById(item.id));
    if (!hasProducts || initializedKey.current === itemsKey) {
      return;
    }

    initializedKey.current = itemsKey;
    clearCart();
    items.forEach((item) => addToCart(item.id, item.qty));
  }, [addToCart, clearCart, getProductById, isLoadingProducts, items, itemsKey]);

  return <>{children}</>;
};

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

const setInputValue = (root: HTMLElement, name: string, value: string) => {
  const input = root.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
  if (!input) {
    throw new Error(`Input not found: ${name}`);
  }
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

const meta: Meta<typeof CheckoutModal> = {
  title: 'Features/CheckoutModal',
  component: CheckoutModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserAuthProvider>
          <OrderProvider>
            <CartInitializer items={[{ id: 'lan_001', qty: 2 }]}>
              <Story />
            </CartInitializer>
          </OrderProvider>
        </UserAuthProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/products', () => {
          return HttpResponse.json([
            {
              id: 'lan_001',
              name: 'PSSE Classic Lanyard',
              description: 'Official PSSE lanyard.',
              price: 150,
              imageUrl: '/images/placeholder-image.jpg',
              category: 'LANYARD',
              stock: 25,
              isFeatured: true,
            },
          ]);
        }),
        http.post('*/orders', async () => {
          await delay(1000);
          return HttpResponse.json({
            id: 'ord_123',
            referenceId: 'PSSE-2026-ABC123',
            totalAmount: 300,
            status: 'PENDING',
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckoutModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Shopping Cart/i);
    getButtonByText(canvasElement, /Proceed to Checkout/i).click();
    await waitForText(canvasElement, /Customer Information/i);
    getButtonByText(canvasElement, /Place Order/i).click();
    await waitForText(canvasElement, /Order Failed/i);
    await waitForText(canvasElement, /Please fill in customer name/i);
  },
};

export const EmptyCart: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserAuthProvider>
          <OrderProvider>
            <Story />
          </OrderProvider>
        </UserAuthProvider>
      </MemoryRouter>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Your cart is empty/i);
    if (/Proceed to Checkout/i.test(canvasElement.textContent ?? '')) {
      throw new Error('Proceed to Checkout should be hidden for empty cart.');
    }
  },
};

export const FullWorkflow: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, /Shopping Cart/i);
    getButtonByText(canvasElement, /Proceed to Checkout/i).click();
    await waitForText(canvasElement, /Customer Information/i);

    // Wait a brief moment for any focus transition animations
    await sleep(100);

    // Assert that focus has moved correctly (e.g. to the first input field)
    const firstInput = canvasElement.querySelector('input[name="customerName"]') as HTMLInputElement;
    if (document.activeElement !== firstInput && !canvasElement.contains(document.activeElement)) {
       throw new Error('Focus transition failed. Document active element is not within the modal or input.');
    }

    setInputValue(canvasElement, 'customerName', 'John Doe');
    setInputValue(canvasElement, 'studentId', '2021-12345');
    setInputValue(canvasElement, 'customerEmail', 'john.doe@cpu.edu.ph');
    setInputValue(canvasElement, 'contactNumber', '09123456789');

    getButtonByText(canvasElement, /Place Order/i).click();
    await waitForText(canvasElement, /Order Placed!/i, 7000);
    await waitForText(canvasElement, /PSSE-2026-ABC123/i);
  },
};
