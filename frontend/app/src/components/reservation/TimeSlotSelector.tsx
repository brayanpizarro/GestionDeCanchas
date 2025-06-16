"use client"
import type React from "react"
import type { TimeSlot } from "../../types/reservation"

interface TimeSlotSelectorProps {
    availableTimeSlots: TimeSlot[]
    selectedTime: string | null
    selectedDuration: number
    isLoading: boolean
    onTimeSelect: (time: string, duration: number, timeSlot: TimeSlot) => void
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    availableTimeSlots,
    selectedTime,
    selectedDuration,
    isLoading,
    onTimeSelect,
    }) => {    if (isLoading) {
        return (
        <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#071d40]"></div>
            <span className="ml-2 text-sm sm:text-base text-gray-500">Cargando horarios disponibles...</span>
        </div>
        )
    }

    if (!availableTimeSlots || availableTimeSlots.length === 0) {
        return (
        <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 text-sm sm:text-base">No hay horarios disponibles para esta fecha</p>
        </div>
        )
    }

    return (
        <div>
            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                    <span className="text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#071d40] rounded"></div>
                    <span className="text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">✗</span>
                    </div>
                    <span className="text-gray-600">No disponible</span>
                </div>
            </div>
            
            {/* Grid de horarios */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">        {availableTimeSlots.map((slot, index) => {
            // Extraer la hora directamente del string UTC
            let timeString: string;
            
            if (typeof slot.startTime === 'string') {
                // Si es string con formato ISO, extraer la hora UTC
                const date = new Date(slot.startTime);
                const hours = date.getUTCHours().toString().padStart(2, '0');
                const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                timeString = `${hours}:${minutes}`;
            } else {
                // Si es Date object
                timeString = `${slot.startTime.getUTCHours().toString().padStart(2, '0')}:${slot.startTime.getUTCMinutes().toString().padStart(2, '0')}`;
            }

            const isSelected = selectedTime === timeString
            const isAvailable = slot.available

            return (
            <button
                key={index}
                onClick={() => isAvailable && onTimeSelect(timeString, selectedDuration, slot)}
                disabled={!isAvailable}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium relative ${
                !isAvailable
                    ? "bg-red-100 text-red-500 cursor-not-allowed opacity-75"
                    : isSelected
                    ? "bg-[#071d40] text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
                {timeString}
                {!isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">✗</span>
                    </div>
                )}
            </button>
            )        })}
        </div>
        </div>
    )
}

export default TimeSlotSelector
