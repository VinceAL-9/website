import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { http, HttpResponse, delay } from 'msw';

// A mock component to show when access is granted
const ProtectedContent = () => (
  <div className="p-8 bg-green-50 border border-green-200 rounded-xl text-center shadow-sm">
    <h2 className="text-2xl font-bold text-green-700 mb-2">✓ Access Granted</h2>
    <p className="text-green-600">You are viewing protected content.</p>
  </div>
);

// A mock component for the login page redirect destination
const MockLogin = () => {
  const location = useLocation();
  return (
    <div className="p-8 bg-blue-50 border border-blue-200 rounded-xl text-center shadow-sm">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Login Page</h2>
      <p className="text-blue-600">Redirected here because you are not authenticated.</p>
      {location.state?.from?.pathname && (
        <p className="text-sm text-blue-500 mt-4 px-3 py-1 bg-white inline-block rounded-full border border-blue-100">
          Attempted to access: <span className="font-mono">{location.state.from.pathname}</span>
        </p>
      )}
    </div>
  );
};

// A mock component for the home page redirect destination
const MockHome = () => (
  <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-xl text-center shadow-sm">
    <h2 className="text-2xl font-bold text-yellow-700 mb-2">Home Page</h2>
    <p className="text-yellow-600">Redirected here because you lack the required role.</p>
  </div>
);

const StoryRouterWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      navigate('/protected', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

const meta = {
  title: 'Common/ProtectedRoute',
  component: ProtectedRoute,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <StoryRouterWrapper>
        <div className="max-w-2xl mx-auto w-full mt-10">
          <Routes>
            <Route path="/admin/login" element={<MockLogin />} />
            <Route path="/" element={<MockHome />} />
            <Route path="/protected" element={<Story />} />
          </Routes>
        </div>
      </StoryRouterWrapper>
    ),
  ],
} satisfies Meta<typeof ProtectedRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

// Happy Paths
export const AuthenticatedUserHappyPath: Story = {
  args: {
    children: <ProtectedContent />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ 
            id: '1', 
            name: 'Jane Doe', 
            email: 'jane@example.com', 
            role: 'USER', 
            isVerified: true 
          });
        }),
      ],
    },
  },
};

export const AllowedRolesHappyPath: Story = {
  args: {
    allowedRoles: ['USER'],
    children: <ProtectedContent />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ 
            id: '1', 
            name: 'Jane Doe', 
            email: 'jane@example.com', 
            role: 'USER', 
            isVerified: true 
          });
        }),
      ],
    },
  },
};

export const AdminRoleHappyPath: Story = {
  args: {
    allowedRoles: ['ADMIN'],
    children: <ProtectedContent />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-admin-token' });
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ 
            id: '2', 
            name: 'Admin User', 
            email: 'admin@example.com', 
            role: 'ADMIN', 
            isVerified: true 
          });
        }),
      ],
    },
  },
};

// Sad Paths
export const UnauthenticatedSadPath: Story = {
  args: {
    children: <ProtectedContent />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/refresh', () => {
          return new HttpResponse(null, { status: 401 });
        }),
        http.get('*/auth/profile', () => {
          return new HttpResponse(null, { status: 401 });
        }),
      ],
    },
  },
};

export const InsufficientRoleSadPath: Story = {
  args: {
    allowedRoles: ['ADMIN'], // Requires ADMIN, but mock provides USER
    children: <ProtectedContent />,
  },
  parameters: {
    msw: {
      handlers: [
        http.post('*/auth/refresh', () => {
          return HttpResponse.json({ access_token: 'mock-token' });
        }),
        http.get('*/auth/profile', () => {
          return HttpResponse.json({ 
            id: '1', 
            name: 'Jane Doe', 
            email: 'jane@example.com', 
            role: 'USER', 
            isVerified: true 
          });
        }),
      ],
    },
  },
};

export const AuthProfileLoadingState: Story = {
  args: { children: <ProtectedContent /> },
  parameters: {
    msw: {
      handlers: [
        http.get('*/auth/profile', async () => {
          await delay('infinite'); // Hold connection open to evaluate skeleton render
          return HttpResponse.json({});
        }),
      ],
    },
  },
};