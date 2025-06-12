import { API_BASE_URL, getAuthHeaders } from "./api"
import type { ReservationStats } from "../types"
import type { CreateReservationDto } from "../types/reservation"
export class ReservationService {
  static async getReservations() {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching reservations")
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

  static async getAvailableTimeSlots(courtId: number, date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/available/${courtId}?date=${date}`, {
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

  static async createReservation(reservationData: CreateReservationDto) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Error creating reservation")
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
}

export const reservationService = {
  getAvailableTimeSlots: ReservationService.getAvailableTimeSlots,
  createReservation: ReservationService.createReservation,
  updateReservationStatus: ReservationService.updateReservationStatus,
  getReservationsByUser: ReservationService.getReservationsByUser,
  getReservations: ReservationService.getReservations,
  getReservationStats: ReservationService.getReservationStats,
  getDashboardStats: ReservationService.getDashboardStats,
}
