const API_URL = "http://localhost:3001/api/v1/auth"

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export interface ForgotPasswordResponse {
  message: string
  success: boolean
}

class ForgotPasswordService {
  async requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
    try {
      console.log("Sending request to:", `${API_URL}/forgot-password`)
      console.log("With email:", email)

      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(errorText || "Error al solicitar recuperación de contraseña")
      }

      const data = await response.json()
      console.log("Success response:", data)
      return data
    } catch (error) {
      console.error("Error in requestPasswordReset:", error)
      throw error
    }
  }

  async verifyResetCode(email: string, code: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Código de verificación inválido")
      }
      return data
    } catch (error) {
      console.error("Error verifying reset code:", error)
      throw error
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña")
      }
      return data
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }
}

export const forgotPasswordService = new ForgotPasswordService()
