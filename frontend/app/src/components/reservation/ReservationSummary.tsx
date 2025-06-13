"use client"

import type React from "react"
import { Calendar, Clock, Users, Package, DollarSign } from "lucide-react"
import type { ReservationSummary } from "../../types/reservation"
import { formatChileanCurrency } from "../../utils/currency"

interface ReservationSummaryProps {
    summary: ReservationSummary
    isLoading: boolean
    onConfirm: () => void
}

const ReservationSummaryComponent: React.FC<ReservationSummaryProps> = ({ summary, isLoading, onConfirm }) => {
    const { court, date, time, duration, equipment, players, total } = summary

    const canConfirm = court && time && players.length > 0

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 sticky top-4">
        <h3 className="text-lg sm:text-xl font-semibold text-[#071d40] mb-4 sm:mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumen de tu reserva
        </h3>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {court && (
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                <p className="text-xs sm:text-sm text-gray-500">Cancha seleccionada</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{court.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{formatChileanCurrency(court.price)}/hora</p>
                </div>
            </div>
            )}

            <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div>
                <p className="text-xs sm:text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                {date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}
                </p>
            </div>
            </div>

            {time && (
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                <p className="text-xs sm:text-sm text-gray-500">Hora y duración</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {time} ({duration} minutos)
                </p>
                </div>
            </div>
            )}

            {equipment.length > 0 && (
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                <p className="text-xs sm:text-sm text-gray-500">Equipamiento</p>
                <ul className="space-y-1">
                    {equipment.map((eq) => (
                    <li key={eq.id} className="text-xs sm:text-sm font-medium text-gray-900">
                        {eq.name} - ${eq.price.toLocaleString()}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
            )}

            <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-red-600" />
            </div>
            <div>
                <p className="text-xs sm:text-sm text-gray-500">Jugadores ({players.length})</p>
                {players.length > 0 ? (
                <ul className="space-y-1">
                    {players.map((player, index) => (
                    <li key={index} className="text-xs sm:text-sm font-medium text-gray-900">
                        {player.firstName} {player.lastName}
                    </li>
                    ))}                </ul>
                ) : (
                <p className="text-xs sm:text-sm text-gray-500">No hay jugadores agregados</p>
                )}
            </div>
            </div>
        </div>

        <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
            <span className="text-xl sm:text-2xl font-bold text-[#071d40]">{formatChileanCurrency(total)}</span>
            </div>
        </div>

        <button
            onClick={onConfirm}
            disabled={isLoading || !canConfirm}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            isLoading || !canConfirm
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-[#071d40] hover:bg-[#122e5e] text-white shadow-lg hover:shadow-xl"
            }`}
        >
            {isLoading ? "Procesando..." : "Confirmar Reserva"}
        </button>
        </div>
    )
}

export default ReservationSummaryComponent
