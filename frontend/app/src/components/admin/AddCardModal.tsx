import React, { useState } from 'react'
import { X, CreditCard, AlertCircle } from 'lucide-react'
import { CardService, CreateCardDto } from '../../service/cardService'

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onCardAdded: () => void
}

export default function AddCardModal({ isOpen, onClose, onCardAdded }: AddCardModalProps) {
  const [formData, setFormData] = useState<CreateCardDto>({
    cardNumber: '',
    holderName: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validaciones del frontend
      const newErrors: Record<string, string> = {}

      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'El número de tarjeta debe tener al menos 13 dígitos'
      } else if (!CardService.validateCardNumber(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'El número de tarjeta no es válido'
      }

      if (!formData.holderName.trim()) {
        newErrors.holderName = 'El nombre del titular es requerido'
      }

      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'El CVV debe tener al menos 3 dígitos'
      }

      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      if (formData.expiryYear < currentYear || 
          (formData.expiryYear === currentYear && formData.expiryMonth < currentMonth)) {
        newErrors.expiry = 'La tarjeta está vencida'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsLoading(false)
        return
      }

      // Limpiar el número de tarjeta (remover espacios)
      const cleanCardData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, '')
      }

      await CardService.createCard(cleanCardData)
      onCardAdded()
      onClose()
      setFormData({
        cardNumber: '',
        holderName: '',
        expiryMonth: 1,
        expiryYear: new Date().getFullYear(),
        cvv: ''
      })
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Error al agregar la tarjeta' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
    if (value.length <= 23) { // 19 dígitos + 4 espacios = 23 caracteres máximo
      setFormData({ ...formData, cardNumber: value })
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setFormData({ ...formData, cvv: value })
    }
  }

  if (!isOpen) return null

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Agregar Tarjeta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Tarjeta
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
            {formData.cardNumber && (
              <p className="text-gray-500 text-sm mt-1">
                Tipo: {CardService.getCardType(formData.cardNumber)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Titular
            </label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value.toUpperCase() })}
              placeholder="JUAN PÉREZ"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.holderName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.holderName && (
              <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={formData.expiryMonth}
                onChange={(e) => setFormData({ ...formData, expiryMonth: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                value={formData.expiryYear}
                onChange={(e) => setFormData({ ...formData, expiryYear: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={handleCvvChange}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {errors.expiry && (
            <p className="text-red-500 text-sm">{errors.expiry}</p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Agregando...
                </>
              ) : (
                'Agregar Tarjeta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
