"use client"

import type React from "react"
import { Building2, Users, DollarSign } from "lucide-react"
import type { Court } from "../../types/reservation"

interface CourtSelectorProps {
  courts: Court[]
  selectedCourt: number | null
  onCourtSelect: (courtId: number) => void
}

const CourtSelector: React.FC<CourtSelectorProps> = ({ courts, selectedCourt, onCourtSelect }) => {
  const availableCourts = courts.filter((court) => court.available)

  if (availableCourts.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No hay canchas disponibles en este horario</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableCourts.map((court) => (
        <div
          key={court.id}
          onClick={() => onCourtSelect(court.id)}
          className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedCourt === court.id ? "ring-2 ring-[#071d40] shadow-xl" : ""
          }`}
        >
          <div className="relative">
            {court.imageUrl || court.imagePath ? (
              <img
                src={court.imageUrl || court.imagePath || "/placeholder.svg?height=200&width=300"}
                alt={court.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-blue-400" />
              </div>
            )}
            {selectedCourt === court.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[#071d40] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-[#071d40] mb-2">{court.name}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{court.description}</p>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-[#071d40] font-bold text-lg">
                <DollarSign className="w-4 h-4 mr-1" />
                {court.price.toLocaleString()}/hora
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                Máx. {court.maxPlayers}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Disponible
              </span>
              {selectedCourt === court.id && <span className="text-sm font-medium text-[#071d40]">Seleccionada</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CourtSelector
