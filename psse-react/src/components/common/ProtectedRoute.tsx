import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useUserAuth } from '../../context';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Uses auth context state to decide access and optionally checks user roles.
 */
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useUserAuth();

  // Show nothing while loading authentication state
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to home page if user doesn't have the required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
