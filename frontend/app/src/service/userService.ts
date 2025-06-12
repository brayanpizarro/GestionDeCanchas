import { API_BASE_URL, getAuthHeaders } from "./api"
import type { User } from "../types"

export class UserService {
  static async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        const error = await response.text()
        console.error("Error response:", error)
        throw new Error("Error fetching users")
      }
      return response.json()
    } catch (error) {
      console.error("Error in getUsers:", error)
      throw error
    }
  }

  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || "Error al cambiar la contraseña")
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || "Error al eliminar usuario")
    }
  }
}
