"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Lock, AlertCircle } from "lucide-react"

interface ReservationCalendarProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
    selectedCourt?: number
    selectedDuration?: number
    onDurationChange?: (duration: number) => void
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ 
    selectedDate, 
    onDateChange,
    selectedDuration = 90,
    onDurationChange
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [error, setError] = useState<string>("")
    const [localDuration, setLocalDuration] = useState<90 | 180>(selectedDuration as 90 | 180)
    
    const today = new Date()
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      const isDateDisabled = (date: Date) => {
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isTooSoon = date < oneWeekFromNow
        return isWeekend || isTooSoon
    }

    const isDateSelected = (date: Date) => {
        if (!selectedDate) return false
        return date.toDateString() === selectedDate.toDateString()
    }

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const handleDateClick = (day: number) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isTooSoon = date < oneWeekFromNow
        
        if (isWeekend) {
            setError("Las reservas solo están disponibles de lunes a viernes")
            return
        }
        
        if (isTooSoon) {
            setError("Las reservas deben hacerse con al menos 1 semana de anticipación")
            return
        }
        
        if (!isDateDisabled(date)) {
            setError("") // Limpiar cualquier error previo
            onDateChange(date)
        }
    }

    const handleDurationChange = (duration: 90 | 180) => {
        setLocalDuration(duration)
        if (onDurationChange) {
            onDurationChange(duration)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            {/* Header del calendario */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#071d40]" />
                    <h3 className="text-base sm:text-lg font-semibold text-[#071d40]">Selecciona una fecha</h3>
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                    <button onClick={previousMonth} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <span className="text-sm sm:text-lg font-medium text-gray-900 min-w-[120px] sm:min-w-[140px] text-center">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Selección de duración */}
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Duración de la reserva:</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleDurationChange(90)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                                localDuration === 90
                                    ? "bg-[#071d40] text-white border-[#071d40]"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            90 min
                        </button>
                        <button
                            onClick={() => handleDurationChange(180)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                                localDuration === 180
                                    ? "bg-[#071d40] text-white border-[#071d40]"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            180 min
                        </button>
                    </div>
                </div>            
            </div>
        
            {/* Error message */}
            {error && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-red-800">{error}</span>
                </div>
            )}

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendario */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, (_, i) => (
                    <div key={`empty-${i}`} className="p-1 sm:p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    const disabled = isDateDisabled(date)
                    const selected = isDateSelected(date)
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    const isTooSoon = date < oneWeekFromNow

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={disabled}
                            className={`h-8 sm:h-10 lg:h-12 text-xs sm:text-sm rounded-md sm:rounded-lg transition-all duration-200 relative flex items-center justify-center ${
                                isWeekend
                                    ? "text-red-300 cursor-not-allowed bg-red-50 border border-red-100"
                                    : isTooSoon
                                        ? "text-gray-300 cursor-not-allowed bg-gray-50"
                                        : disabled
                                            ? "text-gray-300 cursor-not-allowed bg-gray-50"
                                            : selected
                                                ? "bg-[#071d40] text-white shadow-lg"
                                                : "text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                            }`}
                            title={
                                isWeekend 
                                    ? "No disponible - Solo de lunes a viernes"
                                    : isTooSoon
                                        ? "No disponible - Mínimo 1 semana de anticipación"
                                        : ""
                            }
                        >
                            {isWeekend ? (
                                <Lock className="w-2 h-2 sm:w-3 sm:h-3 text-red-400" />
                            ) : (
                                day
                            )}
                        </button>
                    )
                })}
            </div>            {/* Leyenda del calendario */}
            <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2 sm:gap-4 text-xs">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#071d40] rounded flex-shrink-0"></div>
                        <span className="text-gray-600">Seleccionado</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-100 border border-gray-200 rounded flex-shrink-0"></div>
                        <span className="text-gray-600">Disponible</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-50 border border-red-100 rounded flex items-center justify-center flex-shrink-0">
                            <Lock className="w-1 h-1 sm:w-2 sm:h-2 text-red-400" />
                        </div>
                        <span className="text-gray-600">Fin de semana</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReservationCalendar
