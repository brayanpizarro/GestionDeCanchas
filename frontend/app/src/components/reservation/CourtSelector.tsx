"use client"

import type React from "react"
import { Building2, Users, DollarSign, Umbrella, Sun } from "lucide-react"
import type { Court } from "../../types/reservation"
import { formatChileanCurrency } from "../../utils/currency"

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">      {availableCourts.map((court) => {
        let imageUrl: string | undefined = undefined
        
        if (court.imageUrl) {
          imageUrl = court.imageUrl
        } else if (court.imagePath) {
          if (court.imagePath.startsWith('http')) {
            imageUrl = court.imagePath
          } else {
            imageUrl = `http://localhost:3001/${court.imagePath}`
          }
        }
        
        return (
        <div
          key={court.id}
          onClick={() => onCourtSelect(court.id)}
          className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedCourt === court.id ? "ring-2 ring-[#071d40] shadow-xl" : ""
          }`}
        >          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={court.name}
                className="w-full h-32 sm:h-40 lg:h-48 object-cover"                onError={(e) => {
                  // Fallback si la imagen no carga
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
            ) : (
              <div className="w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Building2 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-blue-400" />
              </div>
            )}{/* Fallback div que se muestra si la imagen falla */}
            <div className="hidden w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-blue-100 to-blue-200 items-center justify-center">
              <Building2 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-blue-400" />
            </div>
            {selectedCourt === court.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-[#071d40] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-[#071d40] mb-1 sm:mb-2">{court.name}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{court.description}</p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
              <div className="flex items-center text-[#071d40] font-bold text-base sm:text-lg">
                <DollarSign className="w-4 h-4 mr-1" />
                {formatChileanCurrency(court.price)}/hora
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                Máx. {court.maxPlayers}
              </div>
            </div>            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Disponible
                </span>
                {(court.isCovered !== undefined || court.type) && (
                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                    court.isCovered || court.type === "covered" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {court.isCovered || court.type === "covered" ? (
                      <>
                        <Umbrella className="w-3 h-3 mr-1" />
                        Cubierta
                      </>
                    ) : (
                      <>
                        <Sun className="w-3 h-3 mr-1" />
                        Descubierta
                      </>
                    )}
                  </span>
                )}
              </div>              {selectedCourt === court.id && <span className="text-xs sm:text-sm font-medium text-[#071d40]">Seleccionada</span>}
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}

export default CourtSelector
