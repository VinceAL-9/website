import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse, delay } from 'msw';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { within, expect } from 'storybook/test';
import { VerifyEmail } from './VerifyEmail';

const RouteNavigator = ({ route }: { route: string }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(route, { replace: true });
  }, [navigate, route]);
  return null;
};

const meta = {
  title: 'Pages/User/VerifyEmail',
  component: VerifyEmail,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, context) => {
      const route = context.parameters?.route || '/user/verify';
      return (
        <>
          <RouteNavigator route={route} />
          <Story />
        </>
      );
    },
  ],
} satisfies Meta<typeof VerifyEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Happy Path ---

export const Success: Story = {
  parameters: {
    route: '/user/verify?token=valid_token',
    msw: {
      handlers: [
        http.get('*/auth/verify', () => {
          return HttpResponse.json({ message: 'Email verified successfully!' });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successHeader = await canvas.findByText(/Email Verified!/i);
    await expect(successHeader).toBeInTheDocument();
    const successMessage = await canvas.findByText(/Email verified successfully!/i);
    await expect(successMessage).toBeInTheDocument();
  },
};

// --- Edge Case: Already Verified (Treated as Success) ---

export const AlreadyVerified: Story = {
  parameters: {
    route: '/user/verify?token=already_used_token',
    msw: {
      handlers: [
        http.get('*/auth/verify', () => {
          // The component treats this 400 error as a success because of the message content
          return HttpResponse.json(
            { message: 'This email is already verified.' },
            { status: 400 }
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const successHeader = await canvas.findByText(/Email Verified!/i);
    await expect(successHeader).toBeInTheDocument();
    const successMessage = await canvas.findByText(/Your email has been verified successfully/i);
    await expect(successMessage).toBeInTheDocument();
  },
};

// --- Sad Paths ---

export const InvalidToken: Story = {
  parameters: {
    route: '/user/verify?token=invalid_token',
    msw: {
      handlers: [
        http.get('*/auth/verify', () => {
          return HttpResponse.json(
            { message: 'Verification failed. Token is invalid or expired.' },
            { status: 400 }
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorHeader = await canvas.findByRole('heading', { name: /Verification Failed/i });
    await expect(errorHeader).toBeInTheDocument();
    const errorMessage = await canvas.findByText(/Verification failed. Token is invalid or expired./i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const LoadingState: Story = {
  parameters: {
    route: '/user/verify?token=valid_token',
    msw: {
      handlers: [
        http.get('*/auth/verify', async () => {
          await delay('infinite');
          return HttpResponse.json({});
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingHeader = await canvas.findByText(/Verifying Your Email/i);
    await expect(loadingHeader).toBeInTheDocument();
  },
};

export const NoTokenProvided: Story = {
  parameters: {
    route: '/user/verify', // No token in query
    msw: {
      handlers: [
        // Handler not really needed as it fails before network request
        http.get('*/auth/verify', () => HttpResponse.json({})),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorHeader = await canvas.findByText(/Verification Failed/i);
    await expect(errorHeader).toBeInTheDocument();
    const errorMessage = await canvas.findByText(/Invalid verification link. No token provided./i);
    await expect(errorMessage).toBeInTheDocument();
  },
};
