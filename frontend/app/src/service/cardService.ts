import { API_BASE_URL } from './api'

export interface Card {
  id: number
  cardNumber: string
  holderName: string
  expiry: string
}

export interface CreateCardDto {
  cardNumber: string
  holderName: string
  expiryMonth: number
  expiryYear: number
  cvv: string
}

export class CardService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  private static getAuthHeaders() {
    const token = this.getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  static async createCard(cardData: CreateCardDto): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(cardData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al agregar la tarjeta')
    }

    return response.json()
  }

  static async getUserCards(): Promise<Card[]> {
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al obtener las tarjetas')
    }

    return response.json()
  }

  static async deleteCard(cardId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar la tarjeta')
    }
  }

  // Función para formatear el número de tarjeta para mostrar
  static formatCardNumber(cardNumber: string): string {
    const masked = cardNumber.slice(0, -4).replace(/\d/g, '*') + cardNumber.slice(-4)
    return masked.replace(/(\*{4}|\d{4})/g, '$1 ').trim()
  }

  // Función para formatear la fecha de expiración
  static formatExpiry(expiry: string): string {
    return expiry
  }

  // Función para validar el número de tarjeta (algoritmo de Luhn)
  static validateCardNumber(cardNumber: string): boolean {
    const num = cardNumber.replace(/\D/g, '')
    if (num.length < 13 || num.length > 19) return false

    let sum = 0
    let isEven = false

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  // Función para detectar el tipo de tarjeta
  static getCardType(cardNumber: string): string {
    const num = cardNumber.replace(/\D/g, '')
    
    if (num.match(/^4/)) return 'Visa'
    if (num.match(/^5[1-5]/)) return 'MasterCard'
    if (num.match(/^3[47]/)) return 'American Express'
    if (num.match(/^6/)) return 'Discover'
    
    return 'Desconocido'
  }
}
