"use client"
import type React from "react"
import { Package, Check } from "lucide-react"
import type { Equipment } from "../../types/reservation"

interface EquipmentSelectorProps {
    equipment: Equipment[]
    needsEquipment: boolean
    selectedEquipment: string[]
    onEquipmentDecision: (needsEq: boolean) => void
    onToggleEquipment: (equipmentId: string) => void
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
    equipment,
    needsEquipment,
    selectedEquipment,
    onEquipmentDecision,
    onToggleEquipment,
}) => {
    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
            onClick={() => onEquipmentDecision(true)}
            className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                needsEquipment ? "bg-[#071d40] text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            > Sí, necesito equipamiento </button>
            <button
            onClick={() => onEquipmentDecision(false)}
            className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                !needsEquipment ? "bg-[#071d40] text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            > No, tengo mi propio equipamiento. </button>
        </div>
        {needsEquipment && equipment.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((eq) => (
            <div
                key={eq.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedEquipment.includes(eq.id) ? "ring-2 ring-[#071d40] shadow-xl" : ""
                }`}
                onClick={() => onToggleEquipment(eq.id)}
            >
                <div className="relative">
                    {eq.imageUrl ? (
                        <img
                            src={eq.imageUrl || "/placeholder.svg?height=200&width=300"}
                            alt={eq.name}
                            className="w-full h-48 object-cover"
                        />
                    ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <Package className="w-16 h-16 text-orange-400" />
                        </div>
                    )}
                    {selectedEquipment.includes(eq.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#071d40] rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                    )}
                    </div>
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-[#071d40] mb-2">{eq.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{eq.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-[#071d40] font-bold text-lg">${eq.price.toLocaleString()}</span>
                            {selectedEquipment.includes(eq.id) && (
                                <span className="text-sm font-medium text-[#071d40]">Seleccionado</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        )}

        {needsEquipment && equipment.length === 0 && (
        <div className="text-center py-8">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay equipamiento disponible en este momento</p>
        </div>
        )}
    </div>
    )
}

export default EquipmentSelector
