import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { userEvent, within, expect } from 'storybook/test';
import { UserRegister } from './UserRegister';

const meta = {
  title: 'Pages/User/UserRegister',
  component: UserRegister,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      localStorage.clear();
      return <Story />;
    },
  ],
} satisfies Meta<typeof UserRegister>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseHandlers = [
  http.get('*/auth/profile', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
  http.post('*/auth/refresh', () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
];

export const Default: Story = {
  parameters: {
    msw: {
      handlers: baseHandlers,
    },
  },
};

export const RegistrationSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/register', () => HttpResponse.json({
          id: 'user1', email: 'newstudent@cpu.edu.ph', name: 'New Student', role: 'MEMBER', studentId: '2024-0001',
        })),
        ...baseHandlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'New Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0001');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    // Should show success screen
    try {
      const successHeader = await canvas.findByText(/Registration Successful!/i, {}, { timeout: 3000 });
      await expect(successHeader).toBeInTheDocument();
    } catch (e) {
      const errorMsg = canvas.queryByText(/Registration failed/i) || canvas.queryByText(/Invalid credentials/i) || canvas.queryByText(/Email already in use/i) || canvas.queryByText(/Only @cpu.edu.ph/i);
      console.error("Test failed. Found error message element:", errorMsg?.textContent);
      console.error("Current innerHTML:", canvasElement.innerHTML);
      throw e;
    }
  },
};

export const ErrorMissingName: Story = {
  parameters: {
    msw: { handlers: baseHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), '   '); // Spaces bypass HTML5 required but fail our trim()
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0001');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText(/Name is required/i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const ErrorMissingStudentId: Story = {
  parameters: {
    msw: { handlers: baseHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'New Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '   '); // Spaces bypass HTML5 required but fail our trim()
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText(/Student ID is required/i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const ErrorInvalidEmailDomain: Story = {
  parameters: {
    msw: { handlers: baseHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'New Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0001');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@gmail.com');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText(/Only @cpu\.edu\.ph email addresses are allowed/i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const ErrorShortPassword: Story = {
  parameters: {
    msw: { handlers: baseHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'New Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0001');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), '12345');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), '12345');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText(/Password must be at least 6 characters long/i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const ErrorMismatchedPasswords: Story = {
  parameters: {
    msw: { handlers: baseHandlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'New Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0001');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'newstudent@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'differentpassword');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText(/Passwords do not match/i);
    await expect(errorMessage).toBeInTheDocument();
  },
};

export const EmailAlreadyInUse: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.post('*/auth/register', () => HttpResponse.json({ message: 'Email already in use' }, { status: 400 })),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(await canvas.findByLabelText(/Full Name/i), 'Existing Student');
    await userEvent.type(await canvas.findByLabelText(/Student ID/i), '2024-0002');
    await userEvent.type(await canvas.findByLabelText(/School Email/i), 'existing@cpu.edu.ph');
    await userEvent.type(await canvas.findByLabelText(/^Password/i), 'password123');
    await userEvent.type(await canvas.findByLabelText(/Confirm Password/i), 'password123');
    await userEvent.click(await canvas.findByRole('button', { name: /Create Account/i }));
    
    const errorMessage = await canvas.findByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && (element?.className || '').includes('text-red-600');
    });
    await expect(errorMessage).toBeInTheDocument();
  },
};
