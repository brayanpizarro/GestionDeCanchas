import React, { useState } from 'react'
import { formatChileanCurrency } from '../utils/currency'

interface BalanceModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onRecharge: (amount: number) => Promise<void>
  loading?: boolean
}

export const BalanceModal: React.FC<BalanceModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onRecharge,
  loading = false
}) => {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const predefinedAmounts = [5000, 10000, 20000, 50000, 100000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return

    setIsSubmitting(true)
    try {
      await onRecharge(Number(amount))
      setAmount('')
      onClose()
    } catch (error) {
      console.error('Error al recargar saldo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePredefinedAmount = async (predefinedAmount: number) => {
    setIsSubmitting(true)
    try {
      await onRecharge(predefinedAmount)
      onClose()
    } catch (error) {
      console.error('Error al recargar saldo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Recargar Tarjeta Virtual
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Saldo actual</div>
            <div className="text-2xl font-bold">
              {formatChileanCurrency(currentBalance)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Montos sugeridos
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {predefinedAmounts.map((preAmount) => (
              <button
                key={preAmount}
                onClick={() => handlePredefinedAmount(preAmount)}
                disabled={isSubmitting || loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formatChileanCurrency(preAmount)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto personalizado
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingresa el monto"
              min="1000"
              step="1000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Monto mínimo: $1.000
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading || !amount || isNaN(Number(amount))}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : 'Recargar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
