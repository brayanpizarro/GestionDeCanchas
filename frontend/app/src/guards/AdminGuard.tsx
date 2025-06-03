import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard: FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // Puedes mejorar el diseño si quieres
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
