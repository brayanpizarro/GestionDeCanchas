"use client"

import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ReservationCalendar from "../components/reservation/ReservationCalendar"
import TimeSlotSelector from "../components/reservation/TimeSlotSelector"
import CourtSelector from "../components/reservation/CourtSelector"
import EquipmentSelector from "../components/reservation/EquipmentSelector"
import PlayerManager from "../components/reservation/PlayerManager"
import { PaymentModal } from "../components/PaymentModal"
import { formatChileanCurrency } from "../utils/currency"
import { ReservationService } from "../service/reservationService"
import { CourtService } from "../service/courtService"
import { ProductService } from "../service/productService"

import type {
    Court,
    Player,
    Equipment,
    TimeSlot,
    CreateReservationDto,
} from "../types/reservation"

const ReservationPage: React.FC = () => {
    // Auth context
    const { user, isAuthenticated, loading: authLoading } = useAuth()

    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedDuration] = useState<number>(90)
    const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
    const [needsEquipment, setNeedsEquipment] = useState<boolean>(false)
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
    const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
    const [players, setPlayers] = useState<Player[]>([])

    // Data states
    const [courts, setCourts] = useState<Court[]>([])
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [dataLoading, setDataLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [createdReservationId, setCreatedReservationId] = useState<number | null>(null)

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setDataLoading(true)
                const [courtsData, equipmentData] = await Promise.allSettled([
                    CourtService.getAllCourts(),
                    ProductService.getAllProducts(),
                ])

                if (courtsData.status === "fulfilled") {
                    setCourts(courtsData.value)
                } else {
                    toast.error("Error al cargar las canchas")
                }

                if (equipmentData.status === "fulfilled") {
                    setEquipment(equipmentData.value)
                } else {
                    toast.error("Error al cargar los productos")
                }
            } catch (error) {
                console.error("Error loading initial data:", error)
                toast.error("Error cargando los datos iniciales")
            } finally {
                setDataLoading(false)
            }
        }

        loadInitialData()
    }, [])

    // Load time slots when date or court changes
    useEffect(() => {
        const loadTimeSlots = async () => {
            if (!selectedDate || courts.length === 0) return

            try {
                setIsLoading(true)
                const formattedDate = selectedDate.toISOString().split("T")[0]
                
                const courtToUse = selectedCourt ? courts.find((court) => court.id === selectedCourt) : courts[0]
                
                if (!courtToUse) {
                    setAvailableTimeSlots([])
                    return
                }

                const slots = await ReservationService.getAvailableTimeSlots(Number(courtToUse.id), formattedDate)
                setAvailableTimeSlots(slots)
            } catch (error) {
                console.error("Error loading time slots:", error)
                setAvailableTimeSlots([])
            } finally {
                setIsLoading(false)
            }
        }

        loadTimeSlots()
    }, [selectedDate, selectedCourt, courts])

    // Handlers
    const handleTimeSlotSelect = (timeSlot: TimeSlot, time: string) => {
        setSelectedTimeSlot(timeSlot)
        setSelectedTime(time)
    }

    const handleCourtSelect = (courtId: number) => {
        setSelectedCourt(courtId)
        setSelectedTime(null)
        setSelectedTimeSlot(null)
    }

    const handleEquipmentDecision = (needsEq: boolean) => {
        setNeedsEquipment(needsEq)
        if (!needsEq) {
            setSelectedEquipment([])
        }
    }

    const handleToggleEquipment = (equipmentId: string) => {
        setSelectedEquipment(prev => 
            prev.includes(equipmentId) 
                ? prev.filter(id => id !== equipmentId)
                : [...prev, equipmentId]
        )
    }

    const handlePlayerChange = (updatedPlayers: Player[]) => {
        setPlayers(updatedPlayers)
    }

    // Calculate total
    const calculateTotal = () => {
        if (!selectedCourt || !courts.length) return 0
        const court = courts.find(c => c.id === selectedCourt)
        if (!court) return 0
        return Math.round((court.price * selectedDuration) / 60)
    }

    // Handle reservation creation and payment
    const handleConfirmReservation = async () => {
        if (!selectedTimeSlot || !selectedCourt || !user?.id) {
            toast.error("Por favor, complete todos los campos requeridos")
            return
        }

        if (players.length === 0) {
            toast.error("Debe agregar al menos un jugador")
            return
        }

        try {
            setIsLoading(true)
            
            const startTime = selectedTimeSlot.startTime instanceof Date 
                ? selectedTimeSlot.startTime 
                : new Date(selectedTimeSlot.startTime)
            const endTime = selectedTimeSlot.endTime instanceof Date 
                ? selectedTimeSlot.endTime 
                : new Date(selectedTimeSlot.endTime)

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new Error("Fechas inválidas seleccionadas")
            }

            const reservationData: CreateReservationDto = {
                courtId: Number(selectedCourt),
                userId: Number(user.id),
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                players: players.map((p) => ({
                    firstName: p.firstName.trim(),
                    lastName: p.lastName.trim(),
                    rut: p.rut.trim(),
                    age: Number(p.age),
                })),
            }

            toast.loading('Creando reserva...')
            const reservation = await ReservationService.createReservation(reservationData)
            toast.dismiss()
            
            // Extraer ID de la reservación creada
            const reservationId = typeof reservation === 'object' && reservation && 'id' in reservation 
                ? Number(reservation.id) 
                : Math.floor(Math.random() * 1000) + 1

            setCreatedReservationId(reservationId)
            setShowPaymentModal(true)
            
        } catch (error) {
            toast.dismiss()
            const errorMessage = error instanceof Error ? error.message : "Error desconocido"
            toast.error(`Error al crear la reserva: ${errorMessage}`)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaymentSuccess = () => {
        toast.success("¡Reserva confirmada y pagada exitosamente!")
        // Reset form
        setSelectedCourt(null)
        setSelectedTime(null)
        setSelectedTimeSlot(null)
        setSelectedEquipment([])
        setNeedsEquipment(false)
        setPlayers([])
        setCreatedReservationId(null)
    }

    // Authentication check
    if (authLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-28 pb-16 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#071d40] mx-auto mb-4"></div>
                        <p className="text-gray-600">Verificando autenticación...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow pt-28 pb-16 px-4 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
                        <p className="text-gray-600 mb-6">Debes iniciar sesión para hacer una reserva.</p>
                        <a
                            href="/auth"
                            className="bg-[#071d40] text-white px-6 py-3 rounded-lg hover:bg-[#122e5e] transition"
                        >
                            Iniciar Sesión
                        </a>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

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
        )
    }

    const canConfirm = selectedTimeSlot && selectedCourt && players.length > 0
    const total = calculateTotal()

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow pt-28 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#071d40] mb-4">
                            Reserva tu Cancha
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Selecciona la fecha, cancha y completa los detalles para tu reserva
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Calendar */}
                            <section className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                    1. Selecciona la fecha
                                </h2>
                                <ReservationCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                />
                            </section>

                            {/* Court Selection */}
                            <section className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                    2. Elige tu cancha
                                </h2>
                                <CourtSelector
                                    courts={courts}
                                    selectedCourt={selectedCourt}
                                    onCourtSelect={handleCourtSelect}
                                />
                            </section>

                            {/* Time Selection */}
                            <section className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                    3. Selecciona el horario
                                </h2>
                                <TimeSlotSelector
                                    availableTimeSlots={availableTimeSlots}
                                    selectedTime={selectedTime}
                                    onTimeSlotSelect={handleTimeSlotSelect}
                                    isLoading={isLoading}
                                />
                            </section>

                            {/* Equipment */}
                            <section className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                    4. ¿Necesitas equipamiento?
                                </h2>
                                <EquipmentSelector
                                    equipment={equipment}
                                    needsEquipment={needsEquipment}
                                    selectedEquipment={selectedEquipment}
                                    onEquipmentDecision={handleEquipmentDecision}
                                    onToggleEquipment={handleToggleEquipment}
                                />
                            </section>

                            {/* Players */}
                            <section className="bg-white rounded-lg shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-[#071d40] mb-4">
                                    5. Agrega los jugadores
                                </h2>
                                <PlayerManager
                                    players={players}
                                    onPlayersChange={handlePlayerChange}
                                />
                            </section>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Resumen de Reserva
                                </h3>
                                
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <span className="text-sm text-gray-600">Fecha:</span>
                                        <span className="ml-2 font-medium">
                                            {selectedDate.toLocaleDateString('es-CL', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    
                                    {selectedCourt && (
                                        <div>
                                            <span className="text-sm text-gray-600">Cancha:</span>
                                            <span className="ml-2 font-medium">
                                                {courts.find(c => c.id === selectedCourt)?.name}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {selectedTime && (
                                        <div>
                                            <span className="text-sm text-gray-600">Horario:</span>
                                            <span className="ml-2 font-medium">{selectedTime}</span>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <span className="text-sm text-gray-600">Duración:</span>
                                        <span className="ml-2 font-medium">{selectedDuration} minutos</span>
                                    </div>
                                    
                                    <div>
                                        <span className="text-sm text-gray-600">Jugadores:</span>
                                        <span className="ml-2 font-medium">{players.length}</span>
                                    </div>
                                    
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Total:</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {formatChileanCurrency(total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleConfirmReservation}
                                    disabled={!canConfirm || isLoading}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        'Confirmar y proceder al pago'
                                    )}
                                </button>
                                
                                {!canConfirm && (
                                    <p className="text-sm text-red-600 mt-2 text-center">
                                        Completa todos los pasos para continuar
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Payment Modal */}
            {createdReservationId && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    reservationId={createdReservationId}
                    totalAmount={total}
                    userId={user.id}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}

export default ReservationPage
