import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { updatePassword } from '../service/authService';
import { UserService } from '../service/userService';
import { reservationService } from '../service/reservationService';
import { formatChileanCurrency } from '../utils/currency';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BalanceModal } from '../components/BalanceModal';
import { CreditCard, Key, History, Wallet, Edit2, Plus, Eye, EyeOff, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// Interfaces para tipado
interface Card {
    id: string;
    brand: string;
    last4: string;
    expiry: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    balance: number;
    cards?: Card[];
}

interface Reservation {
    id: string;
    court: string;
    date: string;
    time: string;
    duration: number;
    total: number;
    equipment?: string[];
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notificationType?: number; // 1 para reservas no canceladas después de tomarlas
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'security' | 'payments' | 'history'>('info');
    const [showBalance, setShowBalance] = useState(false);
    const [showAddCard, setShowAddCard] = useState(false);
    const [showTopUp, setShowTopUp] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(false);    
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);

    // Función para obtener el icono y color del estado
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100', text: 'Pendiente' };
            case 'confirmed':
                return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', text: 'Confirmada' };
            case 'completed':
                return { icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-100', text: 'Completada' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100', text: 'Cancelada' };
            default:
                return { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100', text: 'Desconocido' };
        }
    };    // Función para verificar si debe mostrar notificación
    const shouldShowNotification = (reservation: Reservation) => {
        return reservation.notificationType === 1;
    };    // Función para cancelar una reserva
    const handleCancelReservation = async (reservationId: string) => {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            setCancellingReservation(reservationId);
            setError(null);
            
            // Llamar al nuevo servicio de cancelación
            const result = await reservationService.cancelReservation(parseInt(reservationId));
            
            if (result.success) {
                // Actualizar el estado local
                setReservations(prev => 
                    prev.map(reservation => 
                        reservation.id === reservationId 
                            ? { ...reservation, status: 'cancelled', notificationType: undefined }
                            : reservation
                    )
                );
                
                alert('Reserva cancelada exitosamente.');
            } else {
                setError(result.message || 'Error al cancelar la reserva');
            }
            
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            setError('Error al cancelar la reserva. Por favor, intenta nuevamente.');
        } finally {
            setCancellingReservation(null);
        }
    };    // Función para verificar si una reserva se puede cancelar
    const canCancelReservation = (reservation: Reservation) => {
        const reservationDate = new Date(reservation.date);
        const now = new Date();
        const timeDiff = reservationDate.getTime() - now.getTime();
        
        // Se puede cancelar si es pending o confirmed y la reserva no está en el pasado
        return (reservation.status === 'pending' || reservation.status === 'confirmed') && timeDiff > 0;
    };

    // Nueva función para continuar el pago de una reserva pendiente
    const handleContinuePayment = async (reservationId: string) => {
        try {
            setError(null);
            setCancellingReservation(reservationId); // Usar el mismo estado para el loading
            
            const result = await reservationService.payReservation(parseInt(reservationId));
            
            if (result.success) {
                // Actualizar el estado local
                setReservations(prev => 
                    prev.map(reservation => 
                        reservation.id === reservationId 
                            ? { ...reservation, status: 'confirmed' }
                            : reservation
                    )
                );
                
                alert('Pago procesado exitosamente. Tu reserva ha sido confirmada.');
            } else {
                setError(result.message || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Error al procesar pago:', error);
            setError('Error al procesar el pago. Por favor, intenta nuevamente.');
        } finally {
            setCancellingReservation(null);
        }
    };useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            // Redirigir a la página de autenticación si no está autenticado
            navigate('/auth');
            return;
        }

        // Función para cargar el saldo del usuario
        const fetchUserBalance = async () => {
            if (!user?.id) return;
            try {
                setBalanceLoading(true);
                const balance = await UserService.getUserBalance(parseInt(user.id));
                setCurrentBalance(balance);
            } catch (err) {
                console.error('Error al cargar saldo:', err);
                setError('Error al cargar el saldo');
            } finally {
                setBalanceLoading(false);
            }
        };

        // Función para cargar reservaciones reales
        const fetchReservations = async () => {
            if (!user?.id) return;
            
            try {
                setLoading(true);
                const userReservations = await reservationService.getReservationsByUser(parseInt(user.id));                
                // Transformar los datos para que coincidan con la interfaz local
                const transformedReservations: Reservation[] = userReservations.map((res: unknown) => {
                    const reservation = res as {
                        id: number;
                        court?: { name: string };
                        startTime: string;
                        endTime: string;
                        amount?: number;
                        status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
                    };
                    
                    // Determinar tipo de notificación
                    const notificationType = (reservation.status === 'confirmed' || reservation.status === 'completed') ? 1 : undefined;
                    
                    // Convertir fechas
                    const startDate = new Date(reservation.startTime);
                    const endDate = new Date(reservation.endTime);
                    
                    return {
                        id: reservation.id.toString(),
                        court: reservation.court?.name || 'Cancha desconocida',
                        date: reservation.startTime, // Fecha ISO de la reserva (día y hora elegidos)
                        time: startDate.toLocaleTimeString('es-CL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }),
                        duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)), // Duración en minutos
                        total: reservation.amount || 0,
                        equipment: [],
                        status: reservation.status,
                        notificationType: notificationType
                    };
                });
                
                setReservations(transformedReservations);
            } catch (err) {
                console.error('Error al cargar reservaciones:', err);
                setError('Error al cargar las reservaciones');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchUserBalance();
            fetchReservations();
        }
    }, [isAuthenticated, authLoading, navigate, user]);

    if(authLoading) {
        return ( <div>Cargando...</div>)}
    if (!isAuthenticated ){return null;}  

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validaciones
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Validar que la contraseña cumpla con los requisitos
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
        if (!passwordRegex.test(newPassword)) {
            setError('La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial');
            return;
        }try {
            setLoading(true);
            setError(null);
            await updatePassword(currentPassword, newPassword);
            alert('Contraseña actualizada exitosamente');
            form.reset();
        } catch (error) {
            setError('Error al actualizar la contraseña');
            console.error('Password update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const cardData = {
            number: formData.get('cardNumber') as string,
            expiry: formData.get('expiry') as string,
            cvv: formData.get('cvv') as string,
        };

        try {
            setLoading(true);
            setError(null);
            // Aquí implementarías la lógica para agregar la tarjeta
            // await addCardToUser(cardData);
            
            console.log('Adding card:', cardData);
            setShowAddCard(false);
            form.reset();
            // Recargar datos del usuario si es necesario
        } catch (error) {
            setError('Error al agregar la tarjeta');
            console.error('Add card error:', error);
        } finally {
            setLoading(false);
        }
    };    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const amount = parseFloat(formData.get('amount') as string);

        if (amount <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }        try {
            setLoading(true);
            setError(null);
            
            if (user?.id) {
                // const cardId = formData.get('cardId') as string; // Se podría usar para seleccionar tarjeta específica
                const newBalance = await UserService.addBalance(parseInt(user.id), amount);
                setCurrentBalance(newBalance);
                setShowTopUp(false);
                form.reset();
            }
        } catch (error) {
            setError('Error al recargar el saldo');
            console.error('Top up error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la recarga desde el modal
    const handleBalanceRecharge = async (amount: number) => {
        if (!user?.id) return;
        
        try {
            const newBalance = await UserService.addBalance(parseInt(user.id), amount);
            setCurrentBalance(newBalance);
        } catch (error) {
            console.error('Error al recargar saldo:', error);
            throw error;
        }
    };

    const handleRemoveCard = async (cardId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Aquí implementarías la lógica para eliminar la tarjeta
            // await removeCardFromUser(cardId);
            
            console.log('Removing card:', cardId);
            // Recargar datos del usuario si es necesario
        } catch (error) {
            setError('Error al eliminar la tarjeta');
            console.error('Remove card error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#071d40]"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow pt-24 pb-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Mostrar errores */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                            <button 
                                onClick={() => setError(null)}
                                className="float-right font-bold"
                            >
                                X
                            </button>
                        </div>
                    )}

                    {/* Header del perfil */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-[#071d40] rounded-full flex items-center justify-center text-white text-2xl">
                                {user?.firstName?.[0] ?? ''}{user?.lastName?.[0] ?? ''}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#071d40]">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                                    activeTab === 'info' ? 'bg-[#071d40] text-white' : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <Edit2 className="h-5 w-5" />
                                <span>Información Personal</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                                    activeTab === 'security' ? 'bg-[#071d40] text-white' : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <Key className="h-5 w-5" />
                                <span>Seguridad</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                                    activeTab === 'payments' ? 'bg-[#071d40] text-white' : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <Wallet className="h-5 w-5" />
                                <span>Pagos</span>
                            </button>                           
                                <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                                    activeTab === 'history' ? 'bg-[#071d40] text-white' : 'bg-white hover:bg-gray-50'
                                }`}
                                >
                                <div className="flex items-center space-x-3">
                                    <History className="h-5 w-5" />
                                    <span>Historial</span>
                                </div>
                                {/* Contador de notificaciones */}
                                {reservations.some(r => shouldShowNotification(r)) && (
                                    <div className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {reservations.filter(r => shouldShowNotification(r)).length}
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-3">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {/* Loading overlay */}
                                {loading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#071d40]"></div>
                                    </div>
                                )}

                                {/* Personal Information */}
                                {activeTab === 'info' && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Información Personal</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nombre
                                                </label>
                                                <input
                                                    type="text"
                                                    value={user.firstName || ''}
                                                    className="w-full px-4 py-2 border rounded-md bg-gray-50"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Apellido
                                                </label>
                                                <input
                                                    type="text"
                                                    value={user.lastName || ''}
                                                    className="w-full px-4 py-2 border rounded-md bg-gray-50"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Correo Electrónico
                                                </label>
                                                <input
                                                    type="email"
                                                    value={user.email || ''}
                                                    className="w-full px-4 py-2 border rounded-md bg-gray-50"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security Settings */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Cambiar Contraseña</h2>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contraseña Actual
                                                </label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nueva Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    minLength={6}
                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirmar Nueva Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    minLength={6}
                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-[#071d40] text-white py-2 rounded-md hover:bg-[#122e5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Payment Methods and Balance */}
                                {activeTab === 'payments' && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Métodos de Pago y Saldo</h2>                                        {/* Balance */}
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm opacity-90">Tu saldo actual</p>
                                                    <p className="text-3xl font-bold flex items-center">
                                                        {balanceLoading ? (
                                                            <span className="animate-pulse">Cargando...</span>
                                                        ) : (
                                                            showBalance ? formatChileanCurrency(currentBalance) : '****'
                                                        )}
                                                        <button
                                                            onClick={() => setShowBalance(!showBalance)}
                                                            className="ml-2 hover:bg-white/20 p-1 rounded"
                                                        >
                                                            {showBalance ? (                                                                <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setShowBalanceModal(true)}
                                                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-md hover:bg-white/30 transition flex items-center"
                                                >
                                                    <Plus className="h-5 w-5 mr-2" />
                                                    Recargar
                                                </button>
                                            </div>
                                        </div>                                        
                                        {/* Cards */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg font-medium">Tarjetas guardadas</h3>
                                                <button
                                                    onClick={() => setShowAddCard(true)}
                                                    className="text-[#071d40] hover:text-[#122e5e] transition flex items-center"
                                                >
                                                    <Plus className="h-5 w-5 mr-1" />
                                                    Agregar tarjeta
                                                </button>
                                            </div>

                                            {user.cards && user.cards.length > 0 ? (
                                                user.cards.map(card => (
                                                    <div
                                                        key={card.id}
                                                        className="border rounded-lg p-4 flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <CreditCard className="h-6 w-6 text-gray-500 mr-3" />
                                                            <div>
                                                                <p className="font-medium">
                                                                    {card.brand} terminada en {card.last4}
                                                                </p>
                                                                <p className="text-sm text-gray-500">Expira: {card.expiry}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveCard(card.id)}
                                                            className="text-red-500 hover:text-red-600 text-sm transition"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-4">No tienes tarjetas guardadas</p>
                                            )}
                                        </div>

                                        {/* Add Card Modal */}
                                        {showAddCard && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                    <h3 className="text-lg font-semibold mb-4">Agregar nueva tarjeta</h3>
                                                    <form onSubmit={handleAddCard} className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Número de tarjeta
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="cardNumber"
                                                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                                placeholder="1234 5678 9012 3456"
                                                                maxLength={19}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Fecha de expiración
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="expiry"
                                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                                    placeholder="MM/YY"
                                                                    maxLength={5}
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    CVV
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="cvv"
                                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                                    placeholder="123"
                                                                    maxLength={4}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end space-x-3 mt-6">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAddCard(false)}
                                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={loading}
                                                                className="bg-[#071d40] text-white px-4 py-2 rounded-md hover:bg-[#122e5e] transition disabled:opacity-50"
                                                            >
                                                                {loading ? 'Agregando...' : 'Agregar'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Up Modal */}
                                        {showTopUp && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                    <h3 className="text-lg font-semibold mb-4">Recargar saldo</h3>
                                                    <form onSubmit={handleTopUp} className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Monto a recargar
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="amount"
                                                                min="1"
                                                                step="1000"
                                                                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                                placeholder="10000"
                                                                required
                                                            />
                                                        </div>
                                                        {user.cards && user.cards.length > 0 && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Seleccionar tarjeta
                                                                </label>
                                                                <select 
                                                                    name="cardId"
                                                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#071d40] focus:border-transparent"
                                                                    required
                                                                >
                                                                    <option value="">Selecciona una tarjeta</option>
                                                                    {user.cards.map(card => (
                                                                        <option key={card.id} value={card.id}>
                                                                            {card.brand} terminada en {card.last4}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-end space-x-3 mt-6">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowTopUp(false)}
                                                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                disabled={loading || !user.cards || user.cards.length === 0}
                                                                className="bg-[#071d40] text-white px-4 py-2 rounded-md hover:bg-[#122e5e] transition disabled:opacity-50"
                                                            >
                                                                {loading ? 'Recargando...' : 'Recargar'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )} 
                                {/* Reservation History */}
                                {activeTab === 'history' && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-6">Historial de Reservas</h2>
                                        
                                        {/* Mostrar resumen de notificaciones */}
                                        {reservations.some(r => shouldShowNotification(r)) && (
                                            <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                                                    <p className="text-orange-700">
                                                        Tienes reservas confirmadas que requieren tu atención. 
                                                        Recuerda cancelar si no puedes asistir.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="space-y-4">
                                            {reservations.length > 0 ? (
                                                reservations.map(reservation => {
                                                    const statusInfo = getStatusIcon(reservation.status);
                                                    const StatusIcon = statusInfo.icon;
                                                    const showNotification = shouldShowNotification(reservation);
                                                    
                                                    return (
                                                        <div
                                                            key={reservation.id}
                                                            className={`border rounded-lg p-4 relative ${
                                                                showNotification ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                                                            }`}
                                                        >
                                                            {/* Indicador de notificación */}
                                                            {showNotification && (
                                                                <div className="absolute top-2 right-2">
                                                                    <div className="flex items-center text-orange-600 text-sm">
                                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                                        <span className="text-xs font-medium">Requiere atención</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div className="flex-1">                                                                    <h3 className="font-medium text-lg">{reservation.court}</h3>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {new Date(reservation.date).toLocaleDateString('es-ES', {
                                                                            weekday: 'long',
                                                                            year: 'numeric',
                                                                            month: 'long',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {reservation.time} ({reservation.duration} minutos)
                                                                    </p>
                                                                    
                                                                    {/* Estado de la reserva */}
                                                                    <div className="flex items-center mt-2">
                                                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                                            {statusInfo.text}
                                                                        </div>
                                                                        {showNotification && (
                                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                                                Tipo 1
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-medium text-lg">{formatChileanCurrency(reservation.total)}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            {reservation.equipment && reservation.equipment.length > 0 && (
                                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                                    <p className="text-sm text-gray-600">
                                                                        <strong>Equipamiento:</strong> {reservation.equipment.join(', ')}
                                                                    </p>
                                                                </div>
                                                            )}
                                                              {/* Mensaje específico para reservas con notificación */}
                                                            {showNotification && (
                                                                <div className="mt-3 p-3 bg-orange-100 rounded-md">
                                                                    <p className="text-sm text-orange-800">
                                                                        <strong>Recordatorio:</strong> Esta reserva fue confirmada. 
                                                                        Si no puedes asistir, considera cancelarla para que otros usuarios puedan aprovechar el horario.
                                                                    </p>
                                                                </div>
                                                            )}
                                                              {/* Botones de acción */}
                                                            <div className="mt-4 flex justify-end space-x-2">
                                                                {/* Botón de continuar pago para reservas pendientes */}
                                                                {reservation.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleContinuePayment(reservation.id)}
                                                                        disabled={cancellingReservation === reservation.id}
                                                                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                                    >
                                                                        {cancellingReservation === reservation.id ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                                Procesando...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                                Continuar Pago
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                                
                                                                {/* Botón de cancelar - siempre visible para reservas que se pueden cancelar */}
                                                                {canCancelReservation(reservation) && (
                                                                    <button
                                                                        onClick={() => handleCancelReservation(reservation.id)}
                                                                        disabled={cancellingReservation === reservation.id}
                                                                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                                    >
                                                                        {cancellingReservation === reservation.id ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                                Cancelando...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                                Cancelar Reserva
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                                
                                                                {/* Mensaje para reservas que no se pueden cancelar */}
                                                                {!canCancelReservation(reservation) && reservation.status !== 'pending' && (
                                                                    <span className="text-sm text-gray-500 italic">
                                                                        {reservation.status === 'completed' 
                                                                            ? 'Reserva completada' 
                                                                            : reservation.status === 'cancelled'
                                                                            ? 'Reserva cancelada'
                                                                            : 'No se puede modificar'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8">
                                                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                    <p className="text-gray-500">No tienes reservas registradas</p>
                                                    <p className="text-sm text-gray-400 mt-2">
                                                        Cuando realices una reserva, aparecerá aquí con su estado correspondiente
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            
            {/* Modal de recarga de saldo */}
            <BalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
                currentBalance={currentBalance}
                onRecharge={handleBalanceRecharge}
                loading={balanceLoading}
            />
        </div>
    );
};

export default ProfilePage;