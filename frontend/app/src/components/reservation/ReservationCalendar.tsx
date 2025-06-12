"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface ReservationCalendarProps {
    selectedDate: Date
    onDateChange: (date: Date) => void
}

const ReservationCalendar: React.FC<ReservationCalendarProps> = ({ selectedDate, onDateChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const today = new Date()
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

    const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ]

    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie"]

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const isDateDisabled = (date: Date) => {
        return date < today
    }

    const isDateSelected = (date: Date) => {
        return (
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
        )
    }

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        if (!isDateDisabled(newDate)) {
        onDateChange(newDate)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#071d40]" />
            <h3 className="text-lg font-semibold text-[#071d40]">Selecciona una fecha</h3>
            </div>
            <div className="flex items-center space-x-2">
            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-900 min-w-[140px] text-center">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
            </div>
            ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const disabled = isDateDisabled(date)
            const selected = isDateSelected(date)

            return (
                <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                    disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : selected
                        ? "bg-[#071d40] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                }`}
                >
                {day}
                </button>
            )
            })}
        </div>
        </div>
    )
}

export default ReservationCalendar
