import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated } = useAuth();
  const idUser = localStorage.getItem('idUser');
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  // Si no es admin (id !== 1), redirigir hacia atrás o al dashboard
  if (idUser !== '1') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;