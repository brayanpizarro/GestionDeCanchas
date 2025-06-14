import { API_BASE_URL, getAuthHeaders, getAuthHeadersForFormData } from "./api"
import type { Court, CreateCourtFormData } from "../types"
import type { Court as ReservationCourt} from "../types/reservation"

export class CourtService {
  static async getCourts(): Promise<Court[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courts`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.text()
        console.error("Error response:", error)
        throw new Error("Error fetching courts")
      }
      const courtsData = await response.json()
      return courtsData.map((court: any) => ({
        id: court.id,
        name: court.name,
        type: court.type,
        status: court.status,
        capacity: court.capacity,
        pricePerHour: Number.parseFloat(court.pricePerHour),
        image: court.imagePath || court.image,
        createdAt: court.createdAt,
        updatedAt: court.updatedAt,
      }))
    } catch (error) {
      console.error("Error in getCourts:", error)
      throw error
    }
  }

  static async getAllCourts(): Promise<ReservationCourt[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courts`)

      if (!response.ok) {
        throw new Error("Error fetching courts")
      }      const courtsData = await response.json()
      return courtsData.map((court: any) => ({
        id: court.id,
        name: court.name,
        description: court.description || "",
        price: Number.parseFloat(court.pricePerHour || court.price),
        imageUrl: court.imagePath || court.imageUrl,
        imagePath: court.imagePath,
        available: court.status === "available",
        maxPlayers: court.capacity || court.maxPlayers,
        capacity: court.capacity,
        pricePerHour: court.pricePerHour,
        status: court.status,
        type: court.type,
        isCovered: court.isCovered,
      }))
    } catch (error) {
      console.error("Error fetching courts:", error)
      throw error
    }
  }

  static async createCourt(courtData: CreateCourtFormData): Promise<Court> {
    const formData = new FormData()
    formData.append("name", courtData.name)
    formData.append("type", courtData.type)
    formData.append("status", courtData.status)
    formData.append("capacity", String(Number(courtData.capacity)))
    formData.append("pricePerHour", String(Number(courtData.pricePerHour)))

    if (courtData.imageFile) {
      formData.append("image", courtData.imageFile)
    }

    const response = await fetch(`${API_BASE_URL}/courts`, {
      method: "POST",
      headers: getAuthHeadersForFormData(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error creating court")
    }

    return response.json()
  }
  static async updateCourtStatus(courtId: string, status: "available" | "occupied" | "maintenance"): Promise<Court> {
    const response = await fetch(`${API_BASE_URL}/courts/${courtId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    })

    if (!response.ok) throw new Error("Error updating court status")
    return response.json()
  }

  static async updateCourt(courtId: string, courtData: CreateCourtFormData): Promise<Court> {
    const formData = new FormData()
    formData.append("name", courtData.name)
    formData.append("type", courtData.type)
    formData.append("status", courtData.status)
    formData.append("capacity", String(Number(courtData.capacity)))
    formData.append("pricePerHour", String(Number(courtData.pricePerHour)))

    if (courtData.imageFile) {
      formData.append("image", courtData.imageFile)
    }

    const response = await fetch(`${API_BASE_URL}/courts/${courtId}`, {
      method: "PUT",
      headers: getAuthHeadersForFormData(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error updating court")
    }

    return response.json()
  }

  static async getCourtUsage() {
    const response = await fetch(`${API_BASE_URL}/courts/usage/stats`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error fetching court usage stats")
    return response.json()
  }
}

export const courtService = {
  getAllCourts: CourtService.getAllCourts,
  getCourts: CourtService.getCourts,
  createCourt: CourtService.createCourt,
  updateCourt: CourtService.updateCourt,
  updateCourtStatus: CourtService.updateCourtStatus,
  getCourtUsage: CourtService.getCourtUsage,
}
