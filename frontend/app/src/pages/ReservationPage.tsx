import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourtCard from '../components/CourtCard';
import ReservationCalendar from '../components/ReservationCalendar';
import { reservationService, TimeSlot } from '../service/reservationService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { CreateReservationDto } from '../service/reservationService.ts';
import { productService } from '../service/productService';

interface Court {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    available: boolean;
    maxPlayers: number;
}

interface Player {
    firstName: string;
    lastName: string;
    rut: string;
    age: number;
}

interface Equipment {
    id: string;
    name: string;
    description: string;
    price: number;
    available: boolean;
    imageUrl: string;
}

const ReservationPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(90);
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
    const [needsEquipment, setNeedsEquipment] = useState<boolean>(false);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [showPlayerForm, setShowPlayerForm] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState<Player>({
        firstName: '',
        lastName: '',
        rut: '',
        age: 0
    });

    // Estados para datos de la base de datos
    const [courts, setCourts] = useState<Court[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    // Cargar datos desde la base de datos al inicializar el componente
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setDataLoading(true);
                
                // Cargar canchas desde la API
                const courtsResponse = await fetch('http://localhost:3001/api/v1/courts');
                if (courtsResponse.ok) {                    const courtsData = await courtsResponse.json();
                    setCourts(courtsData.map((court: { id: number; name: string; description?: string; pricePerHour: number; status: string; capacity: number }) => ({
                        id: court.id,
                        name: court.name,
                        description: court.description || "",
                        price: parseFloat(court.pricePerHour),
                        imagePath: court.imagePath, // Añade imagen por defecto
                        available: court.status === "available",
                        maxPlayers: court.capacity
                    })));
                }
                  // Cargar productos desde la API
                try {
                    const products = await productService.getAllProducts();
                    setEquipment(products.map(product => ({
                        id: product.id.toString(),
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        available: product.available,
                        imageUrl: product.imageUrl
                    })));
                } catch (error) {
                    toast.error('Error al cargar los productos');
                }
                
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Error cargando los datos iniciales');
            } finally {
                setDataLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleTimeSelect = (time: string, duration: number, timeSlot: TimeSlot) => {
        setSelectedTime(time);
        setSelectedDuration(duration);
        setSelectedTimeSlot(timeSlot);
        setSelectedCourt(null);
    };

    const handleCourtSelect = (courtId: number) => {
        setSelectedCourt(courtId);
    };

    const toggleEquipment = (equipmentId: string) => {
        setSelectedEquipment(prev =>
            prev.includes(equipmentId)
                ? prev.filter(id => id !== equipmentId)
                : [...prev, equipmentId]
        );
    };

    const calculateTotal = () => {
        let total = 0;

        if (selectedCourt) {
            const court = courts.find(c => c.id === selectedCourt);
            if (court) {
                const hourlyRate = court.price;
                total += (hourlyRate * selectedDuration) / 60;
            }
        }

        selectedEquipment.forEach(eqId => {
            const eq = equipment.find(e => e.id === eqId);
            if (eq) total += eq.price;
        });

        return Math.round(total);
    };

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCourt) {
            const court = courts.find(c => c.id === selectedCourt);
            if (court && players.length >= court.maxPlayers) {
                toast.error(`Esta cancha tiene un máximo de ${court.maxPlayers} jugadores`);
                return;
            }
        }
        setPlayers([...players, currentPlayer]);
        setCurrentPlayer({ firstName: '', lastName: '', rut: '', age: 0 });
        setShowPlayerForm(false);
    };

    const handleDeletePlayer = (index: number) => {
        setPlayers(players.filter((_, i) => i !== index));
    };

    const validatePlayersCount = () => {
        if (selectedCourt) {
            const court = courts.find(c => c.id === selectedCourt);
            if (court && players.length > court.maxPlayers) {
                return false;
            }
        }
        return true;
    };

    // Cargar horarios disponibles cuando cambie la fecha o la cancha seleccionada
    useEffect(() => {
        const loadTimeSlots = async () => {
            if (!selectedDate || courts.length === 0) return;

            try {
                setIsLoading(true);
                const formattedDate = selectedDate.toISOString().split('T')[0];
                
                // Usar la cancha seleccionada o la primera disponible
                const courtToUse = selectedCourt 
                    ? courts.find(court => court.id === selectedCourt)
                    : courts.find(court => court.available);
                
                if (!courtToUse) {
                    setAvailableTimeSlots([]);
                    return;
                }
                
                const slots = await reservationService.getAvailableTimeSlots(courtToUse.id, formattedDate);
                
                // Asegurar que startTime y endTime sean objetos Date
                const formattedSlots = slots.map(slot => ({
                    ...slot,
                    startTime: new Date(slot.startTime),
                    endTime: new Date(slot.endTime)
                }));
                
                setAvailableTimeSlots(formattedSlots);
            } catch (error) {
                toast.error('Error al cargar los horarios disponibles');
                console.error(error);
                setAvailableTimeSlots([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTimeSlots();
    }, [selectedDate, selectedCourt, courts]);

    const renderTimeSlots = () => {
        if (isLoading) {
            return <p className="text-gray-500">Cargando horarios disponibles...</p>;
        }

        if (!availableTimeSlots || availableTimeSlots.length === 0) {
            return <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>;
        }

        return (
            <div className="grid grid-cols-4 gap-2">
                {availableTimeSlots.map((slot, index) => {
                    // Asegurar que startTime sea un objeto Date
                    const startTime = slot.startTime instanceof Date 
                        ? slot.startTime 
                        : new Date(slot.startTime);
                    
                    const timeString = startTime.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    return (
                        <button
                            key={index}
                            onClick={() => handleTimeSelect(timeString, selectedDuration, slot)}
                            className={`p-2 rounded ${
                                selectedTime === timeString
                                    ? 'bg-[#071d40] text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {timeString}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderCourts = () => {
        if (!selectedTime) {
            return null;
        }

        const availableCourts = courts.filter(court => court.available);

        if (availableCourts.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No hay canchas disponibles en este horario</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourts.map(court => (
                    <div
                        key={court.id}
                        onClick={() => handleCourtSelect(court.id)}
                        className={`${
                            selectedCourt === court.id ? 'ring-2 ring-blue-500' : ''
                        } cursor-pointer hover:shadow-lg transition-shadow duration-200`}
                    >
                        <CourtCard {...court} />
                        <div className="mt-2 px-4 py-2 bg-gray-50 rounded-b-lg">
                            <p className="text-sm text-gray-600">
                                Capacidad máxima: {court.maxPlayers} jugadores
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTimeSlot || !selectedCourt || !user?.id) {
            toast.error('Por favor, complete todos los campos requeridos');
            return;
        }

        if (players.length === 0) {
            toast.error('Debe agregar al menos un jugador');
            return;
        }

        if (!validatePlayersCount()) {
            toast.error('El número de jugadores excede el máximo permitido para esta cancha');
            return;
        }

        try {
            setIsLoading(true);

            // Asegurar que las fechas sean objetos Date válidos y convertir a ISO string
            const startTime = selectedTimeSlot.startTime instanceof Date 
                ? selectedTimeSlot.startTime 
                : new Date(selectedTimeSlot.startTime);
            
            const endTime = selectedTimeSlot.endTime instanceof Date 
                ? selectedTimeSlot.endTime 
                : new Date(selectedTimeSlot.endTime);            // Prepare reservation data with properly formatted player data
            const reservationData: CreateReservationDto = {
                courtId: selectedCourt,
                userId: user.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                players: players.map(p => ({
                    firstName: p.firstName,
                    lastName: p.lastName,
                    rut: p.rut,
                    age: p.age
                }))
            };

            const reservation = await reservationService.createReservation(reservationData);

            toast.success('¡Reserva creada exitosamente!');

            // Reset form
            setSelectedCourt(null);
            setSelectedTime(null);
            setSelectedTimeSlot(null);
            setSelectedEquipment([]);
            setNeedsEquipment(false);
            setPlayers([]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(`Error al crear la reserva: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Mostrar loading mientras se cargan los datos iniciales
    if (dataLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-28 pb-16 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#071d40] mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando datos...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-28 pb-16 px-4">
                <div className="container mx-auto">
                    <div className="mb-10 relative">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#071d40] mb-2">
                            Reserva tu cancha
                        </h1>
                        <div className="absolute bottom-0 left-0 w-20 h-1 bg-[#071d40] rounded-full"></div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-[#071d40] mb-4">1. Selecciona fecha y hora</h2>
                        <div className="mb-4">
                            <ReservationCalendar
                                selectedDate={selectedDate}
                                onDateChange={setSelectedDate}
                            />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium mb-2">Horarios disponibles:</h3>
                            {renderTimeSlots()}
                        </div>
                    </div>

                    {selectedTime && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                2. Canchas disponibles para {selectedDate.toLocaleDateString()} a las {selectedTime} ({selectedDuration} min)
                            </h2>
                            {renderCourts()}
                        </div>
                    )}

                    {selectedCourt && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-[#071d40] mb-4">3. ¿Necesitas equipamiento?</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setNeedsEquipment(true)}
                                        className={`px-6 py-3 rounded-md ${
                                            needsEquipment
                                                ? 'bg-[#071d40] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Sí, necesito equipamiento
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNeedsEquipment(false);
                                            setSelectedEquipment([]);
                                        }}
                                        className={`px-6 py-3 rounded-md ${
                                            !needsEquipment
                                                ? 'bg-[#071d40] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        No, tengo mi propio equipamiento
                                    </button>
                                </div>

                                {needsEquipment && equipment.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {equipment.map(eq => (
                                            <div
                                                key={eq.id}
                                                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 ${
                                                    selectedEquipment.includes(eq.id) ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                                onClick={() => toggleEquipment(eq.id)}
                                            >
                                                {eq.imageUrl && (
                                                    <img
                                                        src={eq.imageUrl}
                                                        alt={eq.name}
                                                        className="w-full h-48 object-cover"
                                                    />
                                                )}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-semibold text-[#071d40]">{eq.name}</h3>
                                                    <p className="text-gray-600 text-sm mb-2">{eq.description}</p>
                                                    <p className="text-[#071d40] font-bold">${eq.price} CLP</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedCourt && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-[#071d40] mb-4">4. Agregar jugadores</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowPlayerForm(true)}
                                    className="bg-[#071d40] text-white px-6 py-3 rounded-md"
                                >
                                    Agregar Jugador
                                </button>
                                {showPlayerForm && (
                                    <form onSubmit={handleAddPlayer} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                            <input
                                                type="text"
                                                value={currentPlayer.firstName}
                                                onChange={e =>
                                                    setCurrentPlayer({ ...currentPlayer, firstName: e.target.value })
                                                }
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                            <input
                                                type="text"
                                                value={currentPlayer.lastName}
                                                onChange={e =>
                                                    setCurrentPlayer({ ...currentPlayer, lastName: e.target.value })
                                                }
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">RUT</label>
                                            <input
                                                type="text"
                                                value={currentPlayer.rut}
                                                onChange={e =>
                                                    setCurrentPlayer({ ...currentPlayer, rut: e.target.value })
                                                }
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Edad</label>
                                            <input
                                                type="number"
                                                value={currentPlayer.age}
                                                onChange={e =>
                                                    setCurrentPlayer({ ...currentPlayer, age: parseInt(e.target.value) || 0 })
                                                }
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                                min="1"
                                            />
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="submit"
                                                className="bg-[#071d40] text-white px-6 py-3 rounded-md"
                                            >
                                                Agregar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowPlayerForm(false)}
                                                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold text-[#071d40]">Jugadores:</h3>
                                    {players.length === 0 ? (
                                        <p className="text-gray-500">No hay jugadores agregados</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {players.map((player, index) => (
                                                <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                                    <span>
                                                        {player.firstName} {player.lastName} - {player.rut} ({player.age} años)
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeletePlayer(index)}
                                                        className="text-red-500 hover:text-red-700 font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedCourt && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-[#071d40] mb-4">Resumen de tu reserva</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Cancha seleccionada</p>
                                    <p className="font-medium">
                                        {courts.find(court => court.id === selectedCourt)?.name || 'No seleccionada'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Fecha</p>
                                    <p className="font-medium">
                                        {selectedDate.toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Hora y duración</p>
                                    <p className="font-medium">{selectedTime} ({selectedDuration} minutos)</p>
                                </div>

                                {needsEquipment && selectedEquipment.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500">Equipamiento seleccionado</p>
                                        <ul className="list-disc list-inside">
                                            {selectedEquipment.map(eqId => {
                                                const eq = equipment.find(e => e.id === eqId);
                                                return eq && (
                                                    <li key={eqId} className="font-medium">
                                                        {eq.name} - ${eq.price} CLP
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-gray-500">Jugadores ({players.length})</p>
                                    {players.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {players.map((player, index) => (
                                                <li key={index} className="font-medium">
                                                    {player.firstName} {player.lastName} - {player.rut} ({player.age} años)
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No hay jugadores agregados</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="font-medium text-lg">
                                        ${calculateTotal()} CLP
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !selectedTime || !selectedCourt || players.length === 0}
                                className={`w-full ${
                                    isLoading || !selectedTime || !selectedCourt || players.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-[#071d40] hover:bg-[#122e5e]'
                                } text-white py-3 rounded-md transition duration-300`}
                            >
                                {isLoading ? 'Procesando...' : 'Confirmar Reserva'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ReservationPage;