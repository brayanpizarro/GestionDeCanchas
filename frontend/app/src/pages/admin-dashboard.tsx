import { useState } from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import { Users, Calendar, DollarSign, TrendingUp,
    Settings, LogOut, Bell, Search, Menu, Plus,
    Home, MapPin, Trophy, Activity, Star, Zap, Target, Award } from 'lucide-react';

const PadelAdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications] = useState(5);

    // Datos específicos para pádel
    const reservationsData = [
        { name: 'Lun', reservas: 25, ingresos: 1250 },
        { name: 'Mar', reservas: 30, ingresos: 1500 },
        { name: 'Mié', reservas: 28, ingresos: 1400 },
        { name: 'Jue', reservas: 35, ingresos: 1750 },
        { name: 'Vie', reservas: 45, ingresos: 2250 },
        { name: 'Sáb', reservas: 60, ingresos: 3000 },
        { name: 'Dom', reservas: 55, ingresos: 2750 }
    ];

    const courtUsageData = [
        { name: 'Cancha 1', value: 85, color: '#3B82F6' },
        { name: 'Cancha 2', value: 92, color: '#1D4ED8' },
        { name: 'Cancha 3', value: 78, color: '#1E40AF' },
        { name: 'Cancha 4', value: 88, color: '#2563EB' }
    ];

    const recentReservations = [
        {
            id: 1,
            court: 'Cancha 1',
            player: 'Juan Pérez & María López',
            time: '10:00 - 11:30',
            date: '2024-05-26',
            status: 'Confirmada',
            amount: '$50'
        },
        {
            id: 2,
            court: 'Cancha 2',
            player: 'Carlos García & Ana Martín',
            time: '14:00 - 15:30',
            date: '2024-05-26',
            status: 'Pendiente',
            amount: '$50'
        },
        {
            id: 3,
            court: 'Cancha 3',
            player: 'Luis Rodríguez & Pedro Sánchez',
            time: '16:00 - 17:30',
            date: '2024-05-26',
            status: 'Confirmada',
            amount: '$50'
        },
        {
            id: 4,
            court: 'Cancha 1',
            player: 'Carmen Torres & Sofia Ruiz',
            time: '18:00 - 19:30',
            date: '2024-05-26',
            status: 'Completada',
            amount: '$50'
        }
    ];

    const courts = [
        {
            id: 1,
            name: 'Cancha 1',
            type: 'Cubierta',
            status: 'Disponible',
            nextReserva: '10:00',
            rating: 4.8,
            reservasHoy: 8
        },
        {
            id: 2,
            name: 'Cancha 2',
            type: 'Descubierta',
            status: 'Ocupada',
            nextReserva: '11:30',
            rating: 4.6,
            reservasHoy: 10
        },
        {
            id: 3,
            name: 'Cancha 3',
            type: 'Cubierta',
            status: 'Mantenimiento',
            nextReserva: '14:00',
            rating: 4.7,
            reservasHoy: 6
        },
        {
            id: 4,
            name: 'Cancha 4',
            type: 'Descubierta',
            status: 'Disponible',
            nextReserva: '09:00',
            rating: 4.9,
            reservasHoy: 12
        }
    ];

    const topPlayers = [
        {
            id: 1,
            name: 'Juan Pérez',
            reservas: 45,
            gasto: '$2,250',
            nivel: 'Avanzado',
            avatar: 'JP'
        },
        {
            id: 2,
            name: 'María López',
            reservas: 38,
            gasto: '$1,900',
            nivel: 'Intermedio',
            avatar: 'ML'
        },
        {
            id: 3,
            name: 'Carlos García',
            reservas: 32,
            gasto: '$1,600',
            nivel: 'Avanzado',
            avatar: 'CG'
        },
        {
            id: 4,
            name: 'Ana Martín',
            reservas: 28,
            gasto: '$1,400',
            nivel: 'Principiante',
            avatar: 'AM'
        }
    ];

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'courts', label: 'Canchas', icon: MapPin },
        { id: 'reservations', label: 'Reservas', icon: Calendar },
        { id: 'players', label: 'Jugadores', icon: Users },
        { id: 'tournaments', label: 'Torneos', icon: Trophy },
        { id: 'reports', label: 'Reportes', icon: Activity },
        { id: 'settings', label: 'Configuración', icon: Settings }
    ];

    interface StatCardProps {
        title: string;
        value: string;
        change: number;
        icon: React.ElementType;
        color: string;
        subtitle?: string;
    }

    const StatCard = ({ title, value, change, icon: Icon, color, subtitle }: StatCardProps) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    <p className={`text-sm mt-3 flex items-center ${
                        change >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {change >= 0 ? '+' : ''}{change}% vs semana anterior
                    </p>
                </div>
                <div className={`p-4 rounded-full ${color}`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Reservas Hoy"
                    value="36"
                    change={15}
                    icon={Calendar}
                    color="bg-blue-600"
                    subtitle="4 canchas activas"
                />
                <StatCard
                    title="Ingresos Diarios"
                    value="$1,800"
                    change={12}
                    icon={DollarSign}
                    color="bg-blue-700"
                    subtitle="Promedio $50/reserva"
                />
                <StatCard
                    title="Jugadores Activos"
                    value="248"
                    change={8}
                    icon={Users}
                    color="bg-blue-800"
                    subtitle="Este mes"
                />
                <StatCard
                    title="Ocupación"
                    value="85%"
                    change={5}
                    icon={Target}
                    color="bg-blue-900"
                    subtitle="Promedio semanal"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Reservas e Ingresos */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Reservas e Ingresos Semanales</h3>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                                <span className="text-gray-600">Reservas</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                                <span className="text-gray-600">Ingresos ($)</span>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reservationsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar dataKey="reservas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ingresos" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Court Usage */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Uso de Canchas</h3>
                    <div className="space-y-4">
                        {courtUsageData.map((court, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">{court.name}</span>
                                    <span className="text-sm font-semibold text-gray-900">{court.value}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${court.value}%`,
                                            backgroundColor: court.color
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Pico de actividad: 18:00-20:00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Reservations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Reservas Recientes</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Ver todas
                        </button>
                    </div>
                    <div className="space-y-4">
                        {recentReservations.map((reservation) => (
                            <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{reservation.court}</p>
                                        <p className="text-sm text-gray-600">{reservation.player}</p>
                                        <p className="text-xs text-gray-500">{reservation.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{reservation.amount}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        reservation.status === 'Confirmada' ? 'bg-blue-100 text-blue-800' :
                                            reservation.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                    }`}>
                    {reservation.status}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Players */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Jugadores Top</h3>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Ver ranking
                        </button>
                    </div>
                    <div className="space-y-4">
                        {topPlayers.map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">{player.avatar}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                <Award className="w-2 h-2 text-yellow-800" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{player.name}</p>
                                        <p className="text-sm text-gray-600">{player.reservas} reservas • {player.nivel}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">{player.gasto}</p>
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-xs text-gray-500">VIP</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCourts = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Canchas</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Nueva Cancha</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courts.map((court) => (
                    <div key={court.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                court.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                                    court.status === 'Ocupada' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                            }`}>
                {court.status}
              </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tipo:</span>
                                <span className="text-sm font-medium text-gray-900">{court.type}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Próxima reserva:</span>
                                <span className="text-sm font-medium text-blue-600">{court.nextReserva}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Reservas hoy:</span>
                                <span className="text-sm font-medium text-gray-900">{court.reservasHoy}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Rating:</span>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium text-gray-900">{court.rating}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center space-x-2">
                            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                Ver Horarios
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPlaceholder = (title: string, Icon: Icon, description: string) => (
        <div className="text-center py-12">
            <Icon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'courts':
                return renderCourts();
            case 'reservations':
                return renderPlaceholder(
                    'Gestión de Reservas',
                    Calendar,
                    'Administra todas las reservas de las canchas de pádel.'
                );
            case 'players':
                return renderPlaceholder(
                    'Gestión de Jugadores',
                    Users,
                    'Administra la base de datos de jugadores y sus estadísticas.'
                );
            case 'tournaments':
                return renderPlaceholder(
                    'Gestión de Torneos',
                    Trophy,
                    'Organiza y gestiona torneos de pádel.'
                );
            case 'reports':
                return renderPlaceholder(
                    'Reportes y Estadísticas',
                    Activity,
                    'Analiza el rendimiento y estadísticas del centro de pádel.'
                );
            case 'settings':
                return renderPlaceholder(
                    'Configuración',
                    Settings,
                    'Configura las opciones del sistema y las canchas.'
                );
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${
                sidebarOpen ? 'w-64' : 'w-20'
            } bg-white shadow-lg transition-all duration-300 flex flex-col border-r border-gray-200`}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        {sidebarOpen && (
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">PadelAdmin</h1>
                                <p className="text-xs text-gray-500">Centro de Pádel</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                            activeSection === item.id
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {sidebarOpen && <span className="font-medium">{item.label}</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-900 capitalize">
                                    {activeSection}
                                </h2>
                                <p className="text-sm text-gray-500">Gestión de centro de pádel</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar reservas, jugadores..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
                                />
                            </div>

                            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                                )}
                            </button>

                            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">AD</span>
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">Admin Pádel</p>
                                    <p className="text-gray-500">Administrador</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PadelAdminDashboard;