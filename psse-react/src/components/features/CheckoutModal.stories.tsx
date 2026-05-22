import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useEffect } from 'react';    
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { CheckoutModal } from './CheckoutModal';
import { Button } from '../common';
import { useOrders } from '../../context';
import { http, HttpResponse, delay } from 'msw';

const mockProducts = [
  { id: 'prod-1', name: 'PSSE Lanyard', description: 'desc', price: 150, stock: 50, category: 'LANYARD', imageUrl: 'https://placehold.co/400', isFeatured: true },
  { id: 'prod-2', name: 'PSSE T-Shirt', description: 'desc2', price: 350, stock: 20, category: 'TSHIRT', imageUrl: 'https://placehold.co/400', isFeatured: false },
];

const productsHandler = http.get('*/products', () => {
  return HttpResponse.json(mockProducts);
});

const meta = {
  title: 'Features/CheckoutModal',
  component: CheckoutModal,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [productsHandler],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckoutModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs: React.ComponentProps<typeof CheckoutModal> = {
  isOpen: false,
  onClose: () => {},
};

const ModalWrapper = ({ seedCart, ...args }: React.ComponentProps<typeof CheckoutModal> & { seedCart?: boolean }) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);
  const { addToCart, products, cart, clearCart } = useOrders();
  const [status, setStatus] = useState('Initializing...');

  /* eslint-disable react-hooks/set-state-in-effect -- Seeding state for Storybook */
  useEffect(() => {
    if (products.length === 0) {
      setStatus('Waiting for products...');
      return;
    }

    if (!seedCart) {
      if (cart.length > 0) {
        clearCart();
      }
      setStatus('Ready');
      return;
    }

    // Check if the cart has items that actually match our mock products
    const hasCorrectItems = cart.some(item => item.productId === products[0].id);

    if (cart.length > 0 && !hasCorrectItems) {
      setStatus('Clearing stale cart...');
      clearCart();
      return; // Return and let the effect re-run when the cart is empty
    }

    if (cart.length === 0) {
      setStatus('Seeding cart...');
      addToCart(products[0].id, 1);
      if (products.length > 1) {
        addToCart(products[1].id, 2);
      }
      return; // Return and let the effect re-run when the cart is populated
    }

    setStatus('Ready');
  }, [products, cart, seedCart, clearCart, addToCart]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Button onClick={() => setIsOpen(true)}>Open Checkout Modal</Button>
        <div className="text-sm text-gray-500 font-mono">
          [Status: {status}] [Cart Items: {cart.length}]
        </div>
      </div>
      <CheckoutModal 
        {...args} 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }} 
      />
    </div>
  );
};

const getCheckoutInput = (inputs: HTMLInputElement[], name: string) => {
  const match = inputs.find((input) => input.name === name);
  if (!match) {
    throw new Error(`Missing checkout input: ${name}`);
  }
  return match;
};

const fillCheckoutForm = async (canvas: ReturnType<typeof within>) => {
  const inputs = canvas.getAllByRole('textbox') as HTMLInputElement[];
  const nameInput = getCheckoutInput(inputs, 'customerName');
  const studentIdInput = getCheckoutInput(inputs, 'studentId');
  const emailInput = getCheckoutInput(inputs, 'customerEmail');
  const contactInput = getCheckoutInput(inputs, 'contactNumber');

  if (!nameInput.readOnly) {
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jamie Rivera');
  }

  if (!studentIdInput.readOnly) {
    await userEvent.clear(studentIdInput);
    await userEvent.type(studentIdInput, '2024-0001');
  }

  if (!emailInput.readOnly) {
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'jamie@cpu.edu.ph');
  }

  await userEvent.clear(contactInput);
  await userEvent.type(contactInput, '09171234567');
};

export const EmptyCartSadPath: Story = {
  args: { ...defaultArgs },
  render: (args) => <ModalWrapper {...args} seedCart={false} />,
};

export const WithItemsHappyPath: Story = {
  args: {
    ...defaultArgs,
    isOpen: true
  },
  render: (args) => <ModalWrapper {...args} seedCart={true} />,
  parameters: {
    msw: {
      handlers: [
        productsHandler,
        http.post('*/orders', async () => {
          await delay(1000);
          return HttpResponse.json({
            id: 'order-123',
            referenceId: 'REF-XYZ-123',
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/\[Status: Ready\]/i);
    await userEvent.click(canvas.getByTitle('Proceed to Checkout'));
    await canvas.findByRole('heading', { name: /checkout/i });

    await fillCheckoutForm(canvas);

    const submitButton = canvas.getByRole('button', { name: /place order/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    await waitFor(
      () => expect(canvas.getByRole('heading', { name: /order placed!/i })).toBeInTheDocument(),
      { timeout: 5000 }
    );
    await waitFor(() => expect(canvas.getByText(/REF-XYZ-123/i)).toBeInTheDocument(), { timeout: 5000 });
  },
};

export const AuthenticatedUserHappyPath: Story = {
  args: {
    ...defaultArgs,
    isOpen: true
  },
  render: (args) => <ModalWrapper {...args} seedCart={true} />,
  parameters: {
    msw: {
      handlers: [
        productsHandler,
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ 
            id: '1', 
            name: 'Jane Doe', 
            email: 'jane@cpu.edu.ph', 
            studentId: '2020-0001',
            role: 'MEMBER', 
            isVerified: true 
          });
        }),
        http.post('*/orders', async () => {
          await delay(1000);
          return HttpResponse.json({
            id: 'order-123',
            referenceId: 'REF-XYZ-123',
          });
        }),
      ],
    },
  },
};

export const OrderErrorSadPath: Story = {
  args: {
    ...defaultArgs,
    isOpen: true
  },
  render: (args) => <ModalWrapper {...args} seedCart={true} />,
  parameters: {
    msw: {
      handlers: [
        productsHandler,
        http.post('*/orders', async () => {
          await delay(800);
          return new HttpResponse(JSON.stringify({ message: 'Insufficient stock for some items.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/\[Status: Ready\]/i);
    await userEvent.click(canvas.getByTitle('Proceed to Checkout'));
    await canvas.findByRole('heading', { name: /checkout/i });

    await fillCheckoutForm(canvas);

    const submitButton = canvas.getByRole('button', { name: /place order/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    await waitFor(() => expect(canvas.getByText(/order failed/i)).toBeInTheDocument(), { timeout: 5000 });
    expect(canvas.getByText(/insufficient stock/i)).toBeInTheDocument();
  },
};
