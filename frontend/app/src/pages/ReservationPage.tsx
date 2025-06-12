"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReservationCalendar from "../components/reservation/ReservationCalendar";
import TimeSlotSelector from "../components/reservation/TimeSlotSelector";
import CourtSelector from "../components/reservation/CourtSelector";
import EquipmentSelector from "../components/reservation/EquipmentSelector";
import PlayerManager from "../components/reservation/PlayerManager";
import ReservationSummaryComponent from "../components/reservation/ReservationSummary";
import { ReservationService } from "../service/reservationService";
import { CourtService } from "../service/courtService";
import { ProductService } from "../service/productService";

import type {
    Court,
    Player,
    Equipment,
    TimeSlot,
    CreateReservationDto,
    ReservationSummary as ReservationSummaryType,
} from "../types/reservation"

// Context (assuming you have this)
//import { useAuth } from "../context/AuthContext"

const ReservationPage: React.FC = () => {
  // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState<number>(90)
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

  // Mock user - replace with actual auth context
  const user = { id: 1 } // Replace with: const { user } = useAuth()

  // Refs for auto-scroll
    const courtsRef = useRef<HTMLDivElement>(null)
    const equipmentRef = useRef<HTMLDivElement>(null)
    const playersRef = useRef<HTMLDivElement>(null)
    const summaryRef = useRef<HTMLDivElement>(null)

  // Auto-scroll function
    const scrollToSection = (ref: React.RefObject<HTMLDivElement>, delay = 500) => {
    setTimeout(() => {
        if (ref.current) {
            ref.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    }, delay)
    }

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

                const slots = await ReservationService.getAvailableTimeSlots(courtToUse.id, formattedDate)
                setAvailableTimeSlots(slots)
            } catch (error) {
                toast.error("Error al cargar los horarios disponibles")
                console.error(error)
                setAvailableTimeSlots([])
            } finally {
                setIsLoading(false)
            }
        }

        loadTimeSlots()
    }, [selectedDate, selectedCourt, courts])

  
    const handleTimeSelect = (time: string, duration: number, timeSlot: TimeSlot) => {
        setSelectedTime(time)
        setSelectedDuration(duration)
        setSelectedTimeSlot(timeSlot)
        setSelectedCourt(null)
        scrollToSection(courtsRef, 300)
    }

    const handleCourtSelect = (courtId: number) => {
        setSelectedCourt(courtId)
        scrollToSection(equipmentRef, 300)
    }

    const handleEquipmentDecision = (needsEq: boolean) => {
        setNeedsEquipment(needsEq)
        if (!needsEq) {
        setSelectedEquipment([])
        }
        scrollToSection(playersRef, 300)
    }

    const toggleEquipment = (equipmentId: string) => {
        setSelectedEquipment((prev) =>
        prev.includes(equipmentId) ? prev.filter((id) => id !== equipmentId) : [...prev, equipmentId],
        )
    }

    const handleAddPlayer = (player: Player) => {
        setPlayers((prev) => [...prev, player])
        if (players.length === 0) {
        scrollToSection(summaryRef, 300)
        }
    }

    const handleDeletePlayer = (index: number) => {
        setPlayers((prev) => prev.filter((_, i) => i !== index))
    }

  // Calculate total cost
    const calculateTotal = () => {
        let total = 0

        if (selectedCourt) {
        const court = courts.find((c) => c.id === selectedCourt)
        if (court) {
            total += (court.price * selectedDuration) / 60
        }
        }

        selectedEquipment.forEach((eqId) => {
            const eq = equipment.find((e) => e.id === eqId)
            if (eq) total += eq.price
        })

        return Math.round(total)
    }

  // Create reservation summary
    const getReservationSummary = (): ReservationSummaryType => {
        const court = selectedCourt ? courts.find((c) => c.id === selectedCourt) || null : null
        const selectedEquipmentItems = equipment.filter((eq) => selectedEquipment.includes(eq.id))

        return {
        court,
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
        equipment: selectedEquipmentItems,
        players,
        total: calculateTotal(),
        }
    }

  // Handle reservation submission
    const handleSubmit = async () => {
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

            const startTime =
                selectedTimeSlot.startTime instanceof Date ? selectedTimeSlot.startTime : new Date(selectedTimeSlot.startTime)
            const endTime =
                selectedTimeSlot.endTime instanceof Date ? selectedTimeSlot.endTime : new Date(selectedTimeSlot.endTime)

            const reservationData: CreateReservationDto = {
                courtId: selectedCourt,
                userId: user.id,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                players: players.map((p) => ({
                firstName: p.firstName,
                lastName: p.lastName,
                rut: p.rut,
                age: p.age,
                })),
            }

            await ReservationService.createReservation(reservationData)
            toast.success("¡Reserva creada exitosamente!")

            // Reset form
            setSelectedCourt(null)
            setSelectedTime(null)
            setSelectedTimeSlot(null)
            setSelectedEquipment([])
            setNeedsEquipment(false)
            setPlayers([])
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido"
            toast.error(`Error al crear la reserva: ${errorMessage}`)
        } finally {
            setIsLoading(false)
        }
    }

  // Loading state
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

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow pt-28 pb-16">
            <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-[#071d40] mb-2">Reserva tu cancha y equipamiento</h1>
                <div className="w-20 h-1 bg-[#071d40] rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Date and Time */}
                <section className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#071d40] mb-6">1. Selecciona fecha y hora</h2>
                    <div className="space-y-6">
                    <ReservationCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    <div>
                        <h3 className="text-lg font-medium mb-4">Horarios disponibles:</h3>
                        <TimeSlotSelector
                        availableTimeSlots={availableTimeSlots}
                        selectedTime={selectedTime}
                        selectedDuration={selectedDuration}
                        isLoading={isLoading}
                        onTimeSelect={handleTimeSelect}
                        />
                    </div>
                    </div>
                </section>

                {/* Step 2: Courts */}
                {selectedTime && (
                    <section ref={courtsRef} className="bg-white rounded-lg shadow-md p-6 scroll-mt-32">
                    <h2 className="text-xl font-semibold text-[#071d40] mb-6">
                        2. Canchas disponibles para {selectedDate.toLocaleDateString()} a las {selectedTime} (
                        {selectedDuration} min)
                    </h2>
                    <CourtSelector courts={courts} selectedCourt={selectedCourt} onCourtSelect={handleCourtSelect} />
                    </section>
                )}

                {/* Step 3: Equipment */}
                {selectedCourt && (
                    <section ref={equipmentRef} className="bg-white rounded-lg shadow-md p-6 scroll-mt-32">
                    <h2 className="text-xl font-semibold text-[#071d40] mb-6">3. ¿Necesitas equipamiento?</h2>
                    <EquipmentSelector
                        equipment={equipment}
                        needsEquipment={needsEquipment}
                        selectedEquipment={selectedEquipment}
                        onEquipmentDecision={handleEquipmentDecision}
                        onToggleEquipment={toggleEquipment}
                    />
                    </section>
                )}

                {/* Step 4: Players */}
                {selectedCourt && (
                    <section ref={playersRef} className="bg-white rounded-lg shadow-md p-6 scroll-mt-32">
                    <h2 className="text-xl font-semibold text-[#071d40] mb-6">4. Agregar jugadores</h2>
                    <PlayerManager
                        players={players}
                        selectedCourt={courts.find((c) => c.id === selectedCourt) || null}
                        onAddPlayer={handleAddPlayer}
                        onDeletePlayer={handleDeletePlayer}
                    />
                    </section>
                )}
                </div>

                {/* Sidebar: Summary */}
                {selectedCourt && (
                <div ref={summaryRef} className="lg:col-span-1">
                    <ReservationSummaryComponent
                    summary={getReservationSummary()}
                    isLoading={isLoading}
                    onConfirm={handleSubmit}
                    />
                </div>
                )}
            </div>
            </div>
        </main>
        <Footer />
        </div>
    )
}

export default ReservationPage
