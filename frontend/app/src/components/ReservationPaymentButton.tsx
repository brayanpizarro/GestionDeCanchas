import React, { useState } from 'react'
import { PaymentModal } from './PaymentModal'
import { formatChileanCurrency } from '../utils/currency'
import { toast } from 'react-hot-toast'

interface ReservationPaymentButtonProps {
  reservationData: {
    court: {
      id: number
      name: string
      price: number
    }
    date: Date
    duration: number
    players: Array<{
      firstName: string
      lastName: string
      rut: string
      age: number
    }>
  }
  userId: number
  onReservationComplete: () => void
  disabled?: boolean
}

export const ReservationPaymentButton: React.FC<ReservationPaymentButtonProps> = ({
  reservationData,
  userId,
  onReservationComplete,
  disabled = false
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isCreatingReservation, setIsCreatingReservation] = useState(false)
  const [reservationId, setReservationId] = useState<number | null>(null)

  // Calcular el total
  const totalAmount = Math.round((reservationData.court.price * reservationData.duration) / 60)

  const handleConfirmReservation = async () => {
    try {
      setIsCreatingReservation(true)
      
      // Simular la creación de reserva
      toast.loading('Creando reserva...')
      
      // Aquí normalmente llamarías al API para crear la reserva
      // Por ahora simulamos con un delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simular ID de reserva
      const mockReservationId = Math.floor(Math.random() * 1000) + 1
      setReservationId(mockReservationId)
      
      toast.dismiss()
      toast.success('Reserva creada. Proceder al pago...')
      
      setShowPaymentModal(true)
    } catch (error) {
      toast.dismiss()
      toast.error('Error al crear la reserva')
      console.error('Error creating reservation:', error)
    } finally {
      setIsCreatingReservation(false)
    }
  }

  const handlePaymentSuccess = () => {
    toast.success('¡Reserva confirmada y pagada exitosamente!')
    onReservationComplete()
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Resumen de Reserva
        </h3>
        
        <div className="space-y-3 mb-6">
          <div>
            <span className="text-sm text-gray-600">Cancha:</span>
            <span className="ml-2 font-medium">{reservationData.court.name}</span>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Fecha:</span>
            <span className="ml-2 font-medium">
              {reservationData.date.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Duración:</span>
            <span className="ml-2 font-medium">{reservationData.duration} minutos</span>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Jugadores:</span>
            <span className="ml-2 font-medium">{reservationData.players.length}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatChileanCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleConfirmReservation}
          disabled={disabled || isCreatingReservation || reservationData.players.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isCreatingReservation ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creando reserva...
            </>
          ) : (
            'Confirmar y proceder al pago'
          )}
        </button>
        
        {reservationData.players.length === 0 && (
          <p className="text-sm text-red-600 mt-2 text-center">
            Debes agregar al menos un jugador
          </p>
        )}
      </div>

      {reservationId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          reservationId={reservationId}
          totalAmount={totalAmount}
          userId={userId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
