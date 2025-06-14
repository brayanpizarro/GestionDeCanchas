"use client"
import type React from "react"
import { Package, Check, Plus, Minus } from "lucide-react"
import type { Equipment, SelectedEquipment } from "../../types/reservation"
import { formatChileanCurrency } from "../../utils/currency"

interface EquipmentSelectorProps {
    equipment: Equipment[]
    needsEquipment: boolean
    selectedEquipment: SelectedEquipment[]
    onEquipmentDecision: (needsEq: boolean) => void
    onUpdateEquipmentQuantity: (equipmentId: string, quantity: number) => void
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
    equipment,
    needsEquipment,
    selectedEquipment,
    onEquipmentDecision,
    onUpdateEquipmentQuantity,
}) => {
    
    const getSelectedQuantity = (equipmentId: string): number => {
        const selected = selectedEquipment.find(eq => eq.id === equipmentId)
        return selected ? selected.quantity : 0
    }

    const handleQuantityChange = (equipmentId: string, newQuantity: number) => {
        if (newQuantity < 0) return
        onUpdateEquipmentQuantity(equipmentId, newQuantity)
    }
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
                <button
                    onClick={() => onEquipmentDecision(true)}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                        needsEquipment ? "bg-[#071d40] text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Sí, necesito equipamiento
                </button>
                <button
                    onClick={() => onEquipmentDecision(false)}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base ${
                        !needsEquipment ? "bg-[#071d40] text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    No, tengo mi propio equipamiento.
                </button>
            </div>            {needsEquipment && equipment.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {equipment.map((eq) => {
                        const quantity = getSelectedQuantity(eq.id)
                        const isSelected = quantity > 0
                        
                        return (
                            <div
                                key={eq.id}
                                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                                    isSelected ? "ring-2 ring-[#071d40] shadow-xl" : ""
                                }`}
                            >                                <div className="relative">
                                    {eq.imageUrl ? (
                                        (() => {
                                            const finalUrl = eq.imageUrl.startsWith('http') 
                                                ? eq.imageUrl 
                                                : `http://localhost:3001${eq.imageUrl}`;
                                            console.log(`Equipment ${eq.name}: imageUrl="${eq.imageUrl}", finalUrl="${finalUrl}"`);
                                            return (
                                                <img
                                                    src={finalUrl}
                                                    alt={eq.name}
                                                    className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image for ${eq.name}:`);
                                                        console.error('  Original imageUrl:', eq.imageUrl);
                                                        console.error('  Final URL attempted:', e.currentTarget.src);
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                    onLoad={() => {
                                                        console.log(`✅ Successfully loaded image for ${eq.name}`);
                                                    }}
                                                />
                                            );
                                        })()
                                    ) : null}
                                    <div className={`w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center ${eq.imageUrl ? 'hidden' : ''}`}>
                                        <Package className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-orange-400" />
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#071d40] rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-[#071d40] mb-1 sm:mb-2">{eq.name}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{eq.description}</p>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[#071d40] font-bold text-base sm:text-lg">{formatChileanCurrency(eq.price)}</span>
                                        <span className="text-xs text-gray-500">por unidad</span>
                                    </div>
                                    
                                    {/* Control de cantidad */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(eq.id, quantity - 1)}
                                                disabled={quantity <= 0}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-lg font-semibold text-[#071d40] min-w-[2rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(eq.id, quantity + 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {isSelected && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-semibold text-[#071d40]">
                                                    {formatChileanCurrency(eq.price * quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {needsEquipment && equipment.length === 0 && (
                <div className="text-center py-6 sm:py-8">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No hay equipamiento disponible en este momento</p>
                </div>
            )}
        </div>
    )
}

export default EquipmentSelector
