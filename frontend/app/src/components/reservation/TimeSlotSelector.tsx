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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
        {availableTimeSlots.map((slot, index) => {
            const startTime = slot.startTime instanceof Date ? slot.startTime : new Date(slot.startTime)
            const timeString = startTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            })

            return (
            <button
                key={index}
                onClick={() => onTimeSelect(timeString, selectedDuration, slot)}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                selectedTime === timeString
                    ? "bg-[#071d40] text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
                {timeString}
            </button>
            )
        })}
        </div>
    )
}

export default TimeSlotSelector
