"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Trash2, Users, AlertCircle } from "lucide-react"
import type { Player, Court } from "../../types/reservation"
import { isValidRut, formatRut, cleanRut, getRutErrorMessage } from "../../utils/rutValidator"

interface PlayerManagerProps {
    players: Player[]
    selectedCourt: Court | null
    onAddPlayer: (player: Player) => void
    onDeletePlayer: (index: number) => void
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, selectedCourt, onAddPlayer, onDeletePlayer }) => {
    const [showPlayerForm, setShowPlayerForm] = useState(false)
    const [currentPlayer, setCurrentPlayer] = useState<Player>({
        firstName: "",
        lastName: "",
        rut: "",
        age: 0,
    })
    const [rutError, setRutError] = useState<string | null>(null)

    const handleRutChange = (value: string) => {
        // Limpiar y formatear el RUT mientras se escribe
        const cleaned = cleanRut(value)
        if (cleaned.length <= 9) { // Máximo 8 dígitos + 1 verificador
            const formatted = value.length > currentPlayer.rut.length ? formatRut(cleaned) : value
            setCurrentPlayer({ ...currentPlayer, rut: formatted })
            
            // Validar solo si hay algo escrito
            if (cleaned.length >= 8) {
                const error = getRutErrorMessage(formatted)
                setRutError(error)
            } else {
                setRutError(null)
            }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validar RUT antes de enviar
        const rutValidationError = getRutErrorMessage(currentPlayer.rut)
        if (rutValidationError) {
            setRutError(rutValidationError)
            return
        }
        
        // Verificar que el RUT no esté duplicado
        const rutExists = players.some(player => cleanRut(player.rut) === cleanRut(currentPlayer.rut))
        if (rutExists) {
            setRutError('Este RUT ya está registrado en la reserva')
            return
        }
        
        if (selectedCourt && players.length >= selectedCourt.maxPlayers) {
            alert(`Esta cancha tiene un máximo de ${selectedCourt.maxPlayers} jugadores`)
            return
        }
        
        onAddPlayer(currentPlayer)
        setCurrentPlayer({ firstName: "", lastName: "", rut: "", age: 0 })
        setRutError(null)
        setShowPlayerForm(false)
    }

    const canAddMorePlayers = !selectedCourt || players.length < selectedCourt.maxPlayers

    return (
        <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#071d40]" />
            <span className="text-base sm:text-lg font-medium text-[#071d40]">
                Jugadores ({players.length}
                {selectedCourt && `/${selectedCourt.maxPlayers}`})
            </span>
            </div>
            {canAddMorePlayers && (
            <button
                onClick={() => setShowPlayerForm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-[#071d40] text-white rounded-lg hover:bg-[#122e5e] transition-all duration-200 text-sm sm:text-base"
            >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Jugador
            </button>
            )}
        </div>

        {showPlayerForm && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
            <h4 className="text-base sm:text-lg font-medium text-[#071d40] mb-3 sm:mb-4">Nuevo Jugador</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                    type="text"
                    value={currentPlayer.firstName}
                    onChange={(e) => setCurrentPlayer({ ...currentPlayer, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#071d40]"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                    type="text"
                    value={currentPlayer.lastName}
                    onChange={(e) => setCurrentPlayer({ ...currentPlayer, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#071d40]"
                    required
                />
                </div>                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input
                        type="text"
                        value={currentPlayer.rut}
                        onChange={(e) => handleRutChange(e.target.value)}
                        placeholder="12.345.678-9"
                        className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 ${
                            rutError 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-[#071d40] focus:border-[#071d40]'
                        }`}
                        required
                    />
                    {rutError && (
                        <div className="mt-1 flex items-center text-red-600 text-xs sm:text-sm">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span>{rutError}</span>
                        </div>
                    )}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input
                    type="number"
                    value={currentPlayer.age || ""}
                    onChange={(e) => setCurrentPlayer({ ...currentPlayer, age: Number.parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#071d40]"
                    required
                    min="1"                />
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#071d40] text-white rounded-md hover:bg-[#122e5e] transition-all duration-200 text-sm sm:text-base"
                >
                    Agregar
                </button>
                <button
                    type="button"
                    onClick={() => setShowPlayerForm(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all duration-200 text-sm sm:text-base"
                >
                    Cancelar
                </button>
                </div>
            </form>
            </div>
        )}

        <div>
            {players.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No hay jugadores agregados</p>
            </div>
            ) : (
            <div className="space-y-2 sm:space-y-3">
                {players.map((player, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
                    <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {player.firstName} {player.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {player.rut} • {player.age} años
                    </p>
                    </div>
                    <button
                    onClick={() => onDeletePlayer(index)}
                    className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 rounded-md hover:bg-red-50 transition-all duration-200"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    )
}

export default PlayerManager
