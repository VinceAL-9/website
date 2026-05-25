import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within, waitFor, fireEvent } from 'storybook/test';
import { Navbar } from './Navbar';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Mocks ---
const unauthenticatedMock = http.get('*/auth/profile', () => {
  return new HttpResponse(null, { status: 401 });
});

const refreshMock = http.post('*/auth/refresh', () => {
  return HttpResponse.json({ access_token: 'mock-token' });
});

const authenticatedMock = http.get('*/auth/profile', () => {
  return HttpResponse.json({
    id: '1',
    name: 'Juan Dela Cruz',
    email: 'juan@cpu.edu.ph',
    role: 'MEMBER',
    isVerified: true,
  });
});

const logoutMock = http.post('*/auth/logout', () => {
  return HttpResponse.json({ message: 'Logged out successfully' });
});

// --- Stories ---

export const Unauthenticated: Story = {
  parameters: {
    msw: {
      handlers: [unauthenticatedMock, refreshMock],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Give context time to settle
    await delay(100);

    // Standard links should be present
    expect(canvas.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(canvas.getByRole('link', { name: /events/i })).toBeInTheDocument();
    
    // Authenticated elements should NOT be present
    expect(canvas.queryByText(/Juan Dela Cruz/i)).not.toBeInTheDocument();
    expect(canvas.queryByRole('link', { name: /my orders/i })).not.toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  },
};

export const Authenticated: Story = {
  parameters: {
    msw: {
      handlers: [refreshMock, authenticatedMock, logoutMock],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for context to load user. We use getAllByText because it renders in both desktop and mobile layouts.
    await waitFor(() => {
      const texts = canvas.getAllByText(/Juan Dela Cruz/i);
      expect(texts.length).toBeGreaterThan(0);
    });

    // Authenticated elements should be present
    const myOrdersLinks = canvas.getAllByRole('link', { name: /my orders/i });
    expect(myOrdersLinks.length).toBeGreaterThan(0);
    
    // Since there are two logout buttons (desktop and mobile), we'll click the first one
    const logoutButtons = canvas.getAllByRole('button', { name: /logout/i, hidden: true });
    expect(logoutButtons.length).toBeGreaterThan(0);

    await delay(5000); // Just to ensure all elements are fully rendered before interaction

    // Test logout interaction
    fireEvent.click(logoutButtons[0]);
    
    // After clicking logout, context state should clear, removing the user elements
    await waitFor(() => expect(canvas.queryByText(/Juan Dela Cruz/i)).not.toBeInTheDocument());
  },
};

export const MobileMenuInteraction: Story = {
  parameters: {
    msw: {
      handlers: [unauthenticatedMock, refreshMock],
    },
    viewport: {
      defaultViewport: 'mobile1', // forces a narrow width to trigger mobile menu in Storybook UI
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Ensure we find the hamburger menu button, even if the test runner is running with a wide viewport
    const menuButton = await canvas.findByRole('button', { name: /open menu/i, hidden: true });
    expect(menuButton).toBeInTheDocument();

    // At first, mobile links might exist in DOM but container has max-h-0 (invisible)
    // We click the button to open it. We use fireEvent because userEvent respects the CSS visibility
    fireEvent.click(menuButton);

    // The button aria-label should change to "Close menu"
    await waitFor(() => expect(menuButton).toHaveAttribute('aria-label', 'Close menu'));

    // Click again to close
    fireEvent.click(menuButton);

    // Should change back
    await waitFor(() => expect(menuButton).toHaveAttribute('aria-label', 'Open menu'));
  },
};

// Helper for delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
