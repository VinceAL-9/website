import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Checks for access_token in localStorage. If not present, redirects to login.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Redirect to login page, preserving the attempted location
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
