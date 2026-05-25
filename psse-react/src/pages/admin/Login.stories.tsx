import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { userEvent, within, expect } from 'storybook/test';
import { Login } from './Login';

const meta = {
  title: 'Pages/Admin/Login',
  component: Login,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic API Mocks for normal unauthenticated state
const baseHandlers = [
  http.get('*/auth/profile', () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
  http.post('*/auth/refresh', () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }),
];

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', () => {
          return HttpResponse.json({
            access_token: 'mock_token',
          });
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({
            id: 'admin1',
            email: 'admin@psse.org',
            name: 'System Admin',
            role: 'ADMIN',
            studentId: null,
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    await userEvent.type(canvas.getByLabelText(/Email Address/i), 'admin@psse.org');
    await userEvent.type(canvas.getByLabelText(/Password/i), 'password123');
    
    await userEvent.click(canvas.getByRole('button', { name: /Sign In/i }));
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill out the form
    await userEvent.type(canvas.getByLabelText(/Email Address/i), 'admin@psse.org');
    await userEvent.type(canvas.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    await userEvent.click(canvas.getByRole('button', { name: /Sign In/i }));
    
    // Check if the button shows loading state
    await expect(canvas.getByRole('button')).toBeDisabled();
    await expect(canvas.getByText(/Signing in\.\.\./i)).toBeInTheDocument();
  },
};

export const InvalidCredentials: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', () => {
          return HttpResponse.json(
            { message: 'Invalid credentials. Please try again.' },
            { status: 401 }
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill out the form with wrong info
    await userEvent.type(canvas.getByLabelText(/Email Address/i), 'admin@psse.org');
    await userEvent.type(canvas.getByLabelText(/Password/i), 'wrongpassword');
    
    // Submit the form
    await userEvent.click(canvas.getByRole('button', { name: /Sign In/i }));
    
    // Wait for error message to appear using a function matcher
    const errorMessage = await canvas.findByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && (element?.className || '').includes('text-red-600');
    });
    await expect(errorMessage).toBeInTheDocument();
  },
};
