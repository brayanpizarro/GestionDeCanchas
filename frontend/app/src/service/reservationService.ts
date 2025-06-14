import { API_BASE_URL, getAuthHeaders } from "./api"
import type { ReservationStats } from "../types"
import type { CreateReservationDto, TimeSlot, Reservation } from "../types/reservation"
export class ReservationService {
  static async getReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching reservations")
    return response.json()
  }

  static async getAllReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations/all`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching all reservations")
    return response.json()
  }

  static async getReservationStats(): Promise<ReservationStats[]> {
    const response = await fetch(`${API_BASE_URL}/reservations/stats`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching reservation stats")
    return response.json()
  }

  static async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching dashboard stats")
    return response.json()
  }
  static async getAvailableTimeSlots(courtId: number, date: string, duration: number = 90): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/available/${courtId}?date=${date}&duration=${duration}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error fetching available time slots")
      }

      const slots = await response.json()
      
      return slots.map((slot: any) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      }))
    } catch (error) {
      console.error("Error fetching time slots:", error)
      throw error
    }
  }

  static async getTimeSlotsWithAvailability(courtId: number, date: string): Promise<Array<{
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
    status?: 'confirmed' | 'pending';
    reservationId?: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/slots/${courtId}?date=${date}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error fetching time slots with availability")
      }

      const slots = await response.json()
      return slots.map((slot: any) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      }))
    } catch (error) {
      console.error("Error fetching time slots with availability:", error)
      throw error
    }
  }
  static async createReservation(reservationData: CreateReservationDto) {
    try {
      console.log('Sending reservation data:', JSON.stringify(reservationData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText || "Error creating reservation"}`)
      }

      return response.json()
    } catch (error) {
      console.error("Error creating reservation:", error)
      throw error
    }
  }
  static async updateReservationStatus(
    reservationId: number,
    status: "pending" | "confirmed" | "completed" | "cancelled",
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Error updating reservation status")
      }

      return response.json()
    } catch (error) {
      console.error("Error updating reservation status:", error)
      throw error
    }
  }

  static async cancelReservation(
    reservationId: number,
    reason?: string,
    isAdminCancellation: boolean = false
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, isAdminCancellation }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error cancelling reservation")
      }

      return response.json()
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      throw error
    }
  }

  static async getReservationsByUser(userId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error fetching user reservations")
      }

      return response.json()
    } catch (error) {
      console.error("Error fetching user reservations:", error)
      throw error
    }
  }
  static async payReservation(reservationId: number): Promise<{ success: boolean, message: string, reservation?: Reservation }> {
    try {
      // Obtener el userId del localStorage para testing temporal
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id || 1; // Usar ID por defecto si no está disponible

      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al procesar el pago")
      }

      return response.json()
    } catch (error) {
      console.error("Error in payReservation:", error)
      throw error
    }
  }

  static async getAvailabilityWithStatus(courtId: number, date: string): Promise<Array<{ 
    startTime: Date; 
    endTime: Date; 
    isAvailable: boolean; 
    status?: 'confirmed' | 'pending';
    reservationId?: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/availability/${courtId}?date=${date}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error fetching availability with status")
      }      const data = await response.json()
      return data.map((slot: {
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        status?: 'confirmed' | 'pending';
        reservationId?: number;
      }) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime)
      }))
    } catch (error) {
      console.error("Error in getAvailabilityWithStatus:", error)
      throw error
    }
  }
}

export const reservationService = {
  getAvailableTimeSlots: ReservationService.getAvailableTimeSlots,
  createReservation: ReservationService.createReservation,
  updateReservationStatus: ReservationService.updateReservationStatus,
  cancelReservation: ReservationService.cancelReservation,
  getReservationsByUser: ReservationService.getReservationsByUser,
  getReservations: ReservationService.getReservations,
  getReservationStats: ReservationService.getReservationStats,
  getDashboardStats: ReservationService.getDashboardStats,
  payReservation: ReservationService.payReservation,
  getAvailabilityWithStatus: ReservationService.getAvailabilityWithStatus,
}
