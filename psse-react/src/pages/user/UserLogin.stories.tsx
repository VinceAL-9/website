import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from 'storybook/test';
import { UserLogin } from './UserLogin';

const meta = {
  title: 'Pages/User/UserLogin',
  component: UserLogin,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      localStorage.clear();
      return <Story />;
    },
  ],
} satisfies Meta<typeof UserLogin>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseHandlers = [
  http.get('*/auth/profile', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
  http.post('*/auth/refresh', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
];

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', () => HttpResponse.json({ access_token: 'mock_token' })),
        http.get('*/auth/profile', () => HttpResponse.json({
          id: 'user1', email: 'student@cpu.edu.ph', name: 'Student', role: 'MEMBER', studentId: '2023-0001',
        })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Email Address/i), 'student@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Sign In/i }));
  },
};

export const InvalidCredentials: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', () => HttpResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Email Address/i), 'student@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/Password/i), 'wrongpassword');
    await userEvent.click(await canvas.findByRole('button', { name: /Sign In/i }));
    
    const errorMessage = await canvas.findByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && (element?.className || '').includes('text-red-600');
    });
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const NeedsVerification: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/login', () => HttpResponse.json({ message: 'Please verify your email before logging in.' }, { status: 401 })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Email Address/i), 'student@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Sign In/i }));
    
    // The button renders as a <button> without an explicit 'button' role set if not standard, but it's standard here.
    // However, it's rendered conditionally, so findByRole is correct.
    const resendButton = await canvas.findByText(/Resend Verification Email/i);
    await expect(resendButton).toBeInTheDocument();
  },
};
