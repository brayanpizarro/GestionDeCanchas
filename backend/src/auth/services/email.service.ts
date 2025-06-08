import { Injectable } from "@nestjs/common"

@Injectable()
export class EmailService {
  private readonly API_URL = "http://localhost:3001/api/v1"

  async sendPasswordResetCode(email: string, code: string, userName?: string): Promise<void> {
    try {
      // Enviar el código a través de tu API existente
      const response = await fetch(`${this.API_URL}/email/send-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          userName,
          template: "password-reset",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el correo electrónico")
      }

      console.log(`Password reset email sent to: ${email}`)
    } catch (error) {
      console.error("Error sending email:", error)
      throw new Error("Error al enviar el correo electrónico")
    }
  }

  // Método alternativo si prefieres usar un servicio de email simple
  async sendPasswordResetCodeSimple(email: string, code: string, userName?: string): Promise<void> {
    try {
      // Simulación de envío de email - reemplaza con tu lógica
      console.log(`
        ===== EMAIL ENVIADO =====
        Para: ${email}
        Asunto: Código de Recuperación - Canchas UCENIN
        
        Hola ${userName || ""},
        
        Tu código de verificación es: ${code}
        
        Este código expira en 5 minutos.
        
        Si no solicitaste este cambio, ignora este correo.
        
        Saludos,
        Equipo Canchas UCENIN
        =========================
      `)

      // Aquí puedes integrar con cualquier servicio de email que uses
      // Por ejemplo: SendGrid, Mailgun, Resend, etc.
    } catch (error) {
      console.error("Error sending email:", error)
      throw new Error("Error al enviar el correo electrónico")
    }
  }
}
