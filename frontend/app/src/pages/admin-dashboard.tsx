import { useState, useEffect } from 'react';
import { 
  Users, Calendar, DollarSign, TrendingUp, BarChart3, Package,
  Plus, X, ChevronDown, Building2, Loader2
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// API Service
const apiService = {
  // Courts
  async getCourts() {
    try {
      const response = await fetch(`${API_BASE_URL}/courts`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Error response:', error);
        throw new Error('Error fetching courts');
      }
      return response.json();
    } catch (error) {
      console.error('Error in getCourts:', error);
      throw error;
    }
  },
  async createCourt(courtData: CreateCourtFormData) {
    const response = await fetch(`${API_BASE_URL}/courts`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: JSON.stringify(courtData),
    });
    if (!response.ok) throw new Error('Error creating court');
    return response.json();
  },
  async updateCourtStatus(courtId: string, status: 'available' | 'occupied' | 'maintenance') {
    const response = await fetch(`${API_BASE_URL}/courts/${courtId}/status`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Error updating court status');
    return response.json();
  },

  // Reservations
  async getReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching reservations');
    return response.json();
  },

  async getReservationStats() {
    const response = await fetch(`${API_BASE_URL}/reservations/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching reservation stats');
    return response.json();
  },

  // Products
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching products');
    return response.json();
  },

  async createProduct(productData: any) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Error creating product');
    return response.json();
  },

  // Users
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Error response:', error);
        throw new Error('Error fetching users');
      }
      return response.json();
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  // Dashboard stats
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error fetching dashboard stats');
    return response.json();
  }
};

interface CreateCourtFormData {
  name: string;
  type: 'covered' | 'uncovered';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  pricePerHour: number;
  image: string;
  imageFile?: File;
}

interface CreateCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCourtFormData) => Promise<void>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  change?: string;
}

interface Court {
  id: string;
  name: string;
  type: 'covered' | 'uncovered';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  pricePerHour: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ReservationStats {
  court: string;
  courtId: string;
  reservations: number;
  revenue: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  category?: string;
  description?: string;
}

interface DashboardStats {
  totalCourts: number;
  availableCourts: number;
  todayReservations: number;
  reservationChange: string;
  totalProducts: number;
  totalStock: number;
  activeUsers: number;
  totalUsers: number;
  revenue: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

// Función para comprimir imagen
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Error al procesar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, change }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {change && <p className="text-sm text-green-600 mt-1">{change}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const CreateCourtModal: React.FC<CreateCourtModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateCourtFormData>({
    name: '',
    type: 'covered',
    status: 'available',
    capacity: 4,
    pricePerHour: 15000,
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    try {
      setIsProcessingImage(true);
      setImageFile(file);
      
      const compressedImage = await compressImage(file, 800, 0.7);
      
      setFormData(prev => ({
        ...prev,
        image: compressedImage
      }));
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen. Intenta con otra imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleInputChange = (field: keyof CreateCourtFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field === 'capacity' || field === 'pricePerHour') {
        const numValue = value === '' ? 0 : Number(value);
        newData[field] = isNaN(numValue) ? 0 : numValue;
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('El nombre de la cancha es requerido');
    }
    
    if (!formData.capacity || formData.capacity < 2) {
      errors.push('La capacidad debe ser al menos 2 personas');
    }
    
    if (!formData.pricePerHour || formData.pricePerHour <= 0) {
      errors.push('El precio por hora debe ser mayor a 0');
    }
    
    if (!formData.image) {
      errors.push('Debes seleccionar una imagen para la cancha');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors([]);
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        type: 'covered',
        status: 'available',
        capacity: 4,
        pricePerHour: 15000,
        image: ''
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error al crear la cancha:', error);
      alert('Error al crear la cancha. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Agregar Nueva Cancha</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {formErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Cancha
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Cancha Principal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cancha
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="covered">Cubierta</option>
              <option value="uncovered">Descubierta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad (personas)
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Hora ($)
            </label>
            <input
              type="number"
              min="1"
              step="1000"
              value={formData.pricePerHour}
              onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen de la Cancha
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isProcessingImage}
            />
            {isProcessingImage && (
              <p className="text-sm text-blue-600 mt-1">Procesando imagen...</p>
            )}
            {formData.image && !isProcessingImage && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Vista previa" 
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Imagen procesada - Tamaño reducido para optimizar carga
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessingImage || isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? 'Creando...' : 'Crear Cancha'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersTable = ({ users }: { users: User[] }) => (
  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Registro
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

function AdminDashboard() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservationStats, setReservationStats] = useState<ReservationStats[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string; email: string} | null>(null);
  
  // Estados de UI
  const [isCreateCourtModalOpen, setIsCreateCourtModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadCurrentUser = () => {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUser(userData);
      }
    };
    
    loadCurrentUser();
    loadInitialData();
  }, []);

  // loadInitialData handles loading all initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos en paralelo
      const [
        courtsData,
        statsData,
        productsData,
        usersData
      ] = await Promise.allSettled([
        apiService.getCourts(),
        apiService.getReservationStats(),
        apiService.getProducts(),
        apiService.getUsers()
      ]);

      // Procesar resultados
      if (courtsData.status === 'fulfilled') {
        setCourts(courtsData.value);
      }
      
      if (statsData.status === 'fulfilled') {
        setReservationStats(statsData.value);
      }
      
      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value);
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
      }

    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCourt = async (data: CreateCourtFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('status', data.status);
      formData.append('capacity', data.capacity.toString());
      formData.append('pricePerHour', data.pricePerHour.toString());
      
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }      const newCourt = await apiService.createCourt(formData);
      console.log('Nueva cancha creada:', newCourt);
      setCourts(prevCourts => [...prevCourts, newCourt]);
      setIsCreateCourtModalOpen(false);
      
      // Recargar estadísticas del dashboard
      const updatedStats = await apiService.getDashboardStats();
      setDashboardStats(updatedStats);
      
      alert('Cancha creada exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cancha';
      console.error('Error creating court:', err);
      throw new Error(errorMessage);
    }
  };

  const handleStatusChange = async (courtId: string, newStatus: 'available' | 'occupied' | 'maintenance') => {
    try {
      await apiService.updateCourtStatus(courtId, newStatus);
      
      setCourts(prevCourts => 
        prevCourts.map(court => 
          court.id === courtId ? { ...court, status: newStatus } : court
        )
      );
      
      // Recargar estadísticas
      const updatedStats = await apiService.getDashboardStats();
      setDashboardStats(updatedStats);
      
    } catch (err) {
      console.error('Error updating court status:', err);
      alert('Error al actualizar el estado de la cancha');
    }
  };

  const loadUsers = async () => {
    try {
      const users = await apiService.getUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al cambiar la contraseña');
      }

      alert('Contraseña cambiada exitosamente');
      setIsChangePasswordModalOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    }
  };

  const stats = [
    {
      title: "Total Canchas",
      value: courts.length,
      subtitle: `${courts.filter(c => c.status === 'available').length} disponibles`,
      icon: Building2,
      color: "bg-blue-600"
    },
    {
      title: "Total Usuarios",
      value: users.length,
      subtitle: `${users.filter(u => u.role === 'admin').length} administradores`,
      icon: Users,
      color: "bg-purple-600"
    },
    {
      title: "Reservas Hoy",
      value: 0,
      subtitle: "reservas programadas",
      icon: TrendingUp,
      color: "bg-green-600"
    },
    {
      title: "Productos",
      value: products.length,
      subtitle: `${products.reduce((sum, p) => sum + p.stock, 0)} en stock`,
      icon: Package,
      color: "bg-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando datos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1838] py-3 px-4 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">Panel Administrativo - Canchas de Padel</h1>
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 focus:outline-none"
              >
                <span className="text-sm font-medium">{currentUser?.name || 'Usuario'}</span>
                <div className="w-8 h-8 bg-white text-blue-500 rounded-full flex items-center justify-center font-semibold">
                  {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{currentUser?.name}</div>
                      <div className="text-gray-500 text-xs">{currentUser?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsChangePasswordModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cambiar Contraseña
                    </button>
                    <button                      onClick={() => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200  shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'dashboard' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'productos' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab('canchas')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'canchas' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Canchas
            </button>
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'usuarios' 
                  ? 'border-blue-600 text-blue-600 bg-blue-50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Court Usage Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Uso de Canchas</h2>
                <span className="text-sm text-gray-500">Reservas por cancha esta semana</span>
              </div>
              <div className="space-y-4">
                {reservationStats.length > 0 ? (
                  reservationStats.map((stat) => (
                    <div key={stat.courtId} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        stat.reservations === 0 ? 'bg-red-500' : 
                        stat.reservations < 5 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700 w-20">{stat.court}</span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stat.reservations === 0 ? 'bg-red-500' : 
                              stat.reservations < 5 ? 'bg-yellow-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min((stat.reservations / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {stat.reservations}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay datos de reservas disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h2>
                <span className="text-sm text-gray-500">Top productos esta semana</span>
              </div>
              <div className="space-y-4">
                {products.length > 0 ? (
                  products
                    .sort((a, b) => b.sold - a.sold)
                    .slice(0, 5)
                    .map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{product.stock} disponibles</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay productos disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Courts Management */}
        {activeTab === 'canchas' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Canchas</h2>
                <button 
                  onClick={() => setIsCreateCourtModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cancha
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courts.length > 0 ? (
                    courts.map((court) => (
                      <tr key={court.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {court.image ? (
                            <img 
                              src={court.image} 
                              alt={court.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {court.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {court.type === 'covered' ? 'Cubierta' : 'Descubierta'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {court.capacity} personas
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${court.pricePerHour.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select                            value={court.status}
                            onChange={(e) => handleStatusChange(court.id, e.target.value as 'available' | 'occupied' | 'maintenance')}
                            className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-0 ${
                              court.status === 'available' ? 'bg-green-100 text-green-800' :
                              court.status === 'occupied' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="available">Disponible</option>
                            <option value="occupied">Ocupada</option>
                            <option value="maintenance">Mantenimiento</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No hay canchas registradas. Crea la primera cancha.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'productos' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Productos</h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.category && (
                                <div className="text-sm text-gray-500">{product.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sold} vendidos
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay productos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
              </div>
            </div>
            <div className="p-6">
              {users.length > 0 ? (
                <UsersTable users={users} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p>No hay usuarios registrados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateCourtModal
        isOpen={isCreateCourtModalOpen}
        onClose={() => setIsCreateCourtModalOpen(false)}
        onSubmit={handleCreateCourt}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}

export default AdminDashboard;