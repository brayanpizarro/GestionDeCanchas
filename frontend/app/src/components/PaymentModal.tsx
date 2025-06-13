import React, { useState, useEffect, useCallback } from 'react'
import { formatChileanCurrency } from '../utils/currency'
import { UserService } from '../service/userService'
import { reservationService } from '../service/reservationService'
import { CreditCard, Wallet, CheckCircle, AlertCircle } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  reservationId: number
  totalAmount: number
  userId: number
  onPaymentSuccess: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  reservationId,
  totalAmount,
  userId,
  onPaymentSuccess
}) => {
  const [userBalance, setUserBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'loading' | 'confirm' | 'processing' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const loadUserBalance = useCallback(async () => {
    try {
      setBalanceLoading(true)
      const balance = await UserService.getUserBalance(userId)
      setUserBalance(balance)
      setPaymentStep('confirm')
    } catch (error) {
      console.error('Error loading balance:', error)
      setErrorMessage('Error al cargar el saldo')
      setPaymentStep('error')
    } finally {
      setBalanceLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen && userId) {
      loadUserBalance()
    }
  }, [isOpen, userId, loadUserBalance])

  const handlePayment = async () => {
    if (userBalance < totalAmount) {
      setErrorMessage('Saldo insuficiente para realizar el pago')
      setPaymentStep('error')
      return
    }

    try {
      setPaymentStep('processing')
      
      // Simular un pequeño delay para el proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Procesar el pago
      const result = await reservationService.payReservation(reservationId)
      
      if (result.success) {
        // Actualizar el saldo local
        setUserBalance(prev => prev - totalAmount)
        setPaymentStep('success')
        
        // Notificar al componente padre después de un breve delay
        setTimeout(() => {
          onPaymentSuccess()
          onClose()
        }, 2000)
      } else {
        throw new Error(result.message || 'Error en el pago')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Error al procesar el pago')
      setPaymentStep('error')
    }
  }

  const handleClose = () => {
    if (paymentStep !== 'processing') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {paymentStep === 'loading' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de pago...</p>
          </div>
        )}

        {paymentStep === 'confirm' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirmar Pago
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Tarjeta Virtual */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Tarjeta Virtual</span>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">
                  {formatChileanCurrency(userBalance)}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  Saldo disponible
                </div>
              </div>

              {/* Detalles del pago */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Detalles del pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total a pagar:</span>
                    <span className="font-medium">{formatChileanCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo después del pago:</span>
                    <span className={`font-medium ${
                      userBalance - totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatChileanCurrency(userBalance - totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado del saldo */}
              {userBalance < totalAmount ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Saldo insuficiente</p>
                      <p className="text-sm text-red-600">
                        Necesitas {formatChileanCurrency(totalAmount - userBalance)} adicionales
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm font-medium text-green-800">
                      Saldo suficiente para realizar el pago
                    </p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={userBalance < totalAmount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="h-4 w-4 inline mr-2" />
                  Pagar ahora
                </button>
              </div>
            </div>
          </>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Procesando pago...
            </h3>
            <p className="text-gray-600">
              Por favor espera mientras procesamos tu pago
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Pago exitoso!
            </h3>
            <p className="text-gray-600 mb-4">
              Tu reserva ha sido confirmada y pagada
            </p>
            <p className="text-sm text-gray-500">
              Se ha deducido {formatChileanCurrency(totalAmount)} de tu tarjeta virtual
            </p>
          </div>
        )}

        {paymentStep === 'error' && (
          <>
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error en el pago
              </h3>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setPaymentStep('loading')
                  loadUserBalance()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Reintentar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
