import { useState, useEffect } from 'react';
import { 
  Users, Calendar, DollarSign, TrendingUp,
  Plus, X 
} from 'lucide-react';
import { dashboardService } from '../service/dashboardService';
import type { DashboardStats, Court } from '../service/dashboardService';

interface CreateCourtFormData {
  name: string;
  type: 'covered' | 'uncovered';
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  pricePerHour: number;
  image: string;
}

interface CreateCourtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCourtFormData) => Promise<void>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

// Función para comprimir imagen
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convertir a base64
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Error al procesar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color, subtitle }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
        {change !== undefined && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        )}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
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
    pricePerHour: 15000, // Valor por defecto
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    try {
      setIsProcessingImage(true);
      setImageFile(file);
      
      // Comprimir imagen
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
        // Manejar campos numéricos
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
    
    try {
      await onSubmit(formData);
      // Reset form
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Cancha *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Cancha de Fútbol 1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cancha *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as 'covered' | 'uncovered')}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="covered">Cubierta</option>
                <option value="uncovered">Descubierta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad (personas) *
              </label>
              <input
                type="number"
                min="2"
                max="50"
                value={formData.capacity || ''}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por Hora (CLP) *
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={formData.pricePerHour || ''}
                onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 15000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen de la Cancha *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessingImage}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingImage ? 'Procesando...' : 'Crear Cancha'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isCreateCourtModalOpen, setIsCreateCourtModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardStats, courtsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getCourts()
      ]);
      setStats(dashboardStats);
      setCourts(courtsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourt = async (data: CreateCourtFormData) => {
    try {
      setError(null);
      
      // Validar datos antes de enviar
      if (!data.name.trim()) {
        throw new Error('El nombre de la cancha es requerido');
      }
      
      if (!data.image) {
        throw new Error('La imagen es requerida');
      }
      
      const courtData = {
        name: data.name.trim(),
        type: data.type,
        status: 'available' as const,
        capacity: Number(data.capacity),
        pricePerHour: Number(data.pricePerHour),
        image: data.image
      };

      console.log('Enviando datos de la cancha:', {
        ...courtData,
        image: courtData.image.substring(0, 50) + '...' // Log truncado para la imagen
      });

      const newCourt = await dashboardService.createCourt(courtData);
      setCourts(prevCourts => [...prevCourts, newCourt]);
      setIsCreateCourtModalOpen(false);
      await loadDashboardData(); // Refresh all data
      
      // Mostrar mensaje de éxito
      alert('Cancha creada exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la cancha';
      setError(errorMessage);
      console.error('Error creating court:', err);
      
      // Mostrar error al usuario
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900">Panel Administrativo</span>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => setIsCreateCourtModalOpen(true)}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Cancha
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Reservas Hoy"
            value={stats.reservationsToday}
            icon={Calendar}
            color="bg-blue-600"
          />
          <StatCard
            title="Ingresos Diarios"
            value={`$${stats.dailyIncome.toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-600"
          />
          <StatCard
            title="Jugadores Activos"
            value={stats.activePlayers}
            icon={Users}
            color="bg-purple-600"
          />
          <StatCard
            title="Tasa de Ocupación"
            value={`${stats.occupancyRate}%`}
            icon={TrendingUp}
            color="bg-orange-600"
          />
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Canchas ({courts.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No hay canchas registradas. Haz clic en "Nueva Cancha" para agregar una.
                      </td>
                    </tr>
                  ) : (
                    courts.map((court) => (
                      <tr key={court.id}>
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
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            court.status === 'available' ? 'bg-green-100 text-green-800' :
                            court.status === 'occupied' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {court.status === 'available' ? 'Disponible' :
                             court.status === 'occupied' ? 'Ocupada' : 'Mantenimiento'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <CreateCourtModal
        isOpen={isCreateCourtModalOpen}
        onClose={() => setIsCreateCourtModalOpen(false)}
        onSubmit={handleCreateCourt}
      />
    </div>
  );
}

export default AdminDashboard;