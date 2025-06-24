
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Si requiere autenticación pero no está autenticado
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Si no requiere autenticación pero está autenticado y trata de acceder a login
  if (!requireAuth && isAuthenticated() && currentPath === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
