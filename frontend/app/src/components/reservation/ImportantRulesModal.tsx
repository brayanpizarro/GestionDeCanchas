import React from 'react'
import { X, AlertTriangle, Clock, Calendar, Ban, Phone } from 'lucide-react'

interface ImportantRulesModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    reservationDetails: {
        courtName: string
        date: string
        time: string
        duration: number
    }
}

const ImportantRulesModal: React.FC<ImportantRulesModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    reservationDetails
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                        <h2 className="text-xl font-bold text-gray-900">Términos y Condiciones de Reserva</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Reservation Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">📋 Resumen de tu Reserva</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>Cancha:</strong> {reservationDetails.courtName}</p>
                            <p><strong>Fecha:</strong> {new Date(reservationDetails.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                            <p><strong>Horario:</strong> {reservationDetails.time}</p>
                            <p><strong>Duración:</strong> {reservationDetails.duration} minutos</p>
                        </div>
                    </div>

                    {/* Important Rules */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">⚠️ REGLAS IMPORTANTES - LÉELAS DETENIDAMENTE</h3>
                        
                        {/* Rule 1 */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-900">🕐 PUNTUALIDAD OBLIGATORIA</h4>
                                    <p className="text-red-800 text-sm mt-1">
                                        <strong>DEBES LLEGAR EXACTAMENTE A LA HORA DE INICIO</strong> de tu reserva ({reservationDetails.time}). 
                                        Si llegas tarde, <strong>NO se te entregará la cancha</strong> y perderás tu reserva sin reembolso.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 2 */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Ban className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-orange-900">❌ POLÍTICA DE CANCELACIÓN</h4>
                                    <p className="text-orange-800 text-sm mt-1">
                                        Las cancelaciones deben realizarse con <strong>MÍNIMO 1 SEMANA DE ANTICIPACIÓN</strong>. 
                                        Cancelaciones con menos tiempo no serán procesadas y se cobrará la reserva completa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 3 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">📅 HORARIOS DISPONIBLES</h4>
                                    <p className="text-blue-800 text-sm mt-1">
                                        Las reservas solo están disponibles de <strong>Lunes a Viernes</strong>. 
                                        No hay servicio los fines de semana. Las reservas deben hacerse con al menos 1 semana de anticipación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rule 4 */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-green-900">📱 CONTACTO DE EMERGENCIA</h4>
                                    <p className="text-green-800 text-sm mt-1">
                                        Para emergencias el día de la reserva, contacta inmediatamente al: 
                                        <strong className="bg-green-100 px-2 py-1 rounded ml-1">+56 9 XXXX XXXX</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email notification info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">📧 Notificación por Email</h4>
                        <p className="text-gray-700 text-sm">
                            Recibirás un email de confirmación con todos estos detalles y recordatorios. 
                            Asegúrate de revisar tu bandeja de entrada y spam.
                        </p>
                    </div>

                    {/* Checkbox confirmation */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                id="terms-accepted"
                                className="mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                required
                            />
                            <span className="text-sm text-yellow-800">
                                <strong>Confirmo que he leído y acepto todas las reglas mencionadas.</strong> 
                                Entiendo que el incumplimiento de estas reglas puede resultar en la pérdida de mi reserva 
                                sin derecho a reembolso.
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            const checkbox = document.getElementById('terms-accepted') as HTMLInputElement
                            if (checkbox?.checked) {
                                onConfirm()
                            } else {
                                alert('Debes aceptar los términos y condiciones para continuar.')
                            }
                        }}
                        className="px-6 py-2 bg-[#071d40] text-white rounded-lg hover:bg-[#0a2047] transition-colors"
                    >
                        Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportantRulesModal
