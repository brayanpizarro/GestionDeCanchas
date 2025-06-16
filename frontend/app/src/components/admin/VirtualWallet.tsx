import { useState } from 'react'
import { Wallet, Plus, DollarSign } from 'lucide-react'
import { formatChileanCurrency } from '../../utils/currency'

interface VirtualWalletProps {
  balance: number
  onAddBalance: (amount: number) => void
  isLoading: boolean
}

export default function VirtualWallet({ balance, onAddBalance, isLoading }: VirtualWalletProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [amount, setAmount] = useState('')

  const handleAddBalance = () => {
    const numAmount = parseFloat(amount)
    if (numAmount > 0) {
      onAddBalance(numAmount)
      setAmount('')
      setShowAddModal(false)
    }
  }

  const quickAmounts = [5000, 10000, 20000, 50000]

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Saldo Virtual
            </h3>
            <p className="text-3xl font-bold">{formatChileanCurrency(balance)}</p>
            <p className="text-blue-100 text-sm mt-1">
              Disponible para reservas
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Saldo
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => onAddBalance(quickAmount)}
              disabled={isLoading}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md p-3 text-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-5 h-5 mx-auto text-gray-600 mb-1" />
              <span className="text-sm font-medium text-gray-900">
                +{formatChileanCurrency(quickAmount)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Balance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agregar Saldo
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a agregar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    step="1000"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setAmount('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBalance}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Agregando...' : 'Agregar Saldo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Información sobre el saldo virtual
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              El saldo virtual te permite realizar reservas de forma rápida sin necesidad de 
              procesar pagos reales. Este es un sistema ficticio para propósitos de demostración.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
