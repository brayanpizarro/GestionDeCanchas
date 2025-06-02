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
    pricePerHour: 0,
    image: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Convert image to base64 for preview and sending to API
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Agregar Nueva Cancha</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit(formData);
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Cancha
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cancha
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'covered' | 'uncovered' })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="covered">Cubierta</option>
                <option value="uncovered">Descubierta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad
              </label>
              <input
                type="number"
                min="2"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por Hora
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Vista previa" 
                    className="w-full h-40 object-cover rounded-lg"
                  />
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Crear Cancha
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
      const courtData = {
        name: data.name,
        type: data.type,
        status: 'available' as const,
        capacity: data.capacity,
        pricePerHour: data.pricePerHour,
        image: data.image
      };

      const newCourt = await dashboardService.createCourt(courtData);
      setCourts(prevCourts => [...prevCourts, newCourt]);
      setIsCreateCourtModalOpen(false);
      await loadDashboardData(); // Refresh all data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cancha');
      console.error('Error creating court:', err);
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Canchas</h2>
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
                  {courts.map((court) => (
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
                  ))}
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