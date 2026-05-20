import type { Meta, StoryObj } from '@storybook/react-vite';
import { Navbar } from './Navbar';
import { UserAuthProvider } from '../../context';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserAuthProvider>
          <div className="min-h-50">
            <Story />
          </div>
        </UserAuthProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Guest: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return new HttpResponse(null, { status: 401 });
        }),
        http.post('*/auth/refresh', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      ],
    },
  },
};

export const Member: Story = {
  parameters: {
    msw: {
      handlers: [
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
};

export const Admin: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', () => {
          return HttpResponse.json({
            id: 'a1',
            email: 'admin@psse.org',
            name: 'Admin Officer',
            role: 'ADMIN',
            studentId: null,
          });
        }),
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
      ],
    },
  },
};

export const Mobile: Story = {
  ...Guest,
  parameters: {
    ...Guest.parameters,
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
