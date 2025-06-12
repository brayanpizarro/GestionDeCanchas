interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const API_URL = 'http://localhost:3001/api/v1/auth';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
  return data;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role: "user" }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al registrarse');
  return data;
};
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  } catch (error) {
    console.error('Error durante logout:', error);
  }
};

// Función para obtener usuario actual
export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) return null;

  try {
    // Verificar el token
    const res = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) throw new Error('Token inválido');
    
    return JSON.parse(user);
  } catch (error) {
    console.error('Error al validar usuario:', error);
    return null;
  }
};
// Función adicional útil: verificar autenticación
export const isAuthenticated = async (): Promise<boolean> => {
  return !!(await getCurrentUser());
};

// Función para actualizar contraseña
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    throw new Error('No hay sesión activa');
  }

  const userData = JSON.parse(user);
  
  const res = await fetch(`http://localhost:3001/api/v1/users/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: parseInt(userData.id),
      currentPassword,
      newPassword
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Error al actualizar la contraseña');
  }
};