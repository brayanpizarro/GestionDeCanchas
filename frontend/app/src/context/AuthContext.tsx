import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, logout as logoutService } from '../service/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User, token: string) => void;
  signIn: (email: string, password: string) => Promise<void>; 
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication when app loads
  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        console.log('Usuario autenticado:', currentUser);
      } else {
        // Token exists but user fetch failed - clear invalid data
        clearAuthData();
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to clear authentication data
  const clearAuthData = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Sign in function with better error handling
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/v1/auth/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Handle both 'token' and 'access_token' for compatibility
      const token = data.token || data.access_token;
      
      if (!token || !data.user) {
        throw new Error('Respuesta de login inválida del servidor');
      }
      
      login(data.user, token);
      
    } catch (error) {
      console.error('Error en signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function (called after successful authentication)
  const login = (userData: User, token: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Login exitoso:', userData);
    } catch (error) {
      console.error('Error guardando datos de autenticación:', error);
      throw new Error('Error guardando datos de sesión');
    }
  };

  // Logout function with better cleanup
  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
    } catch (error) {
      console.error('Error en logout del servidor:', error);
      // Continue with local cleanup even if server logout fails
    } finally {
      clearAuthData();
      setLoading(false);
      console.log('Logout exitoso');
    }
  };

  // Update user data
  const updateUser = (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Debug: show current state (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthContext estado:', {
        user,
        isAuthenticated,
        loading,
        hasToken: !!localStorage.getItem('authToken')
      });
    }
  }, [user, isAuthenticated, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signIn,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};