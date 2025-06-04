import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminGuardProps {
  children: ReactNode;
}

const AdminGuard: FC<AdminGuardProps> = ({ children }) => { // Componente de tipo guardia para proteger rutas de administrador
  // Este componente verifica si el usuario está autenticado y es un administrador
  const { user, isAuthenticated, loading } = useAuth();// Importa el contexto de autenticación

  if (loading) {// Si aún se está cargando la información del usuario, muestra un mensaje de carga
    return <div>Cargando...</div>; 
  }

  if (!isAuthenticated) {// Si el usuario no está autenticado, redirige a la página de autenticación
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {// Si el usuario no es un administrador, redirige a la página de perfil
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;// Si el usuario es un administrador, renderiza los hijos del componente
};

export default AdminGuard;// Exporta el componente AdminGuard para su uso en otras partes de la aplicación
