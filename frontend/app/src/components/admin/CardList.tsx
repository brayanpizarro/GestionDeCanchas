import { CreditCard, Trash2 } from 'lucide-react'
import { Card, CardService } from '../../service/cardService'

interface CardListProps {
  cards: Card[]
  onDeleteCard: (cardId: number) => void
  isDeleting: boolean
}

export default function CardList({ cards, onDeleteCard, isDeleting }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tarjetas agregadas</h3>
        <p className="text-gray-500">
          Agrega una tarjeta para poder realizar reservas de forma más rápida.
        </p>
      </div>
    )
  }

  const getCardTypeIcon = (cardNumber: string) => {
    const type = CardService.getCardType(cardNumber)
    switch (type) {
      case 'Visa':
        return <div className="w-8 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">VISA</div>
      case 'MasterCard':
        return <div className="w-8 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded">MC</div>
      case 'American Express':
        return <div className="w-8 h-5 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">AMEX</div>
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getCardTypeIcon(card.cardNumber)}
              <div>
                <p className="font-medium text-gray-900">
                  {CardService.formatCardNumber(card.cardNumber)}
                </p>
                <p className="text-sm text-gray-500">{card.holderName}</p>
                <p className="text-xs text-gray-400">
                  Expira: {CardService.formatExpiry(card.expiry)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDeleteCard(card.id)}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-2"
              title="Eliminar tarjeta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
