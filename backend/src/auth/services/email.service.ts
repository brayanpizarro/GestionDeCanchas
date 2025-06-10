import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Inicializar el transporter con Gmail
    this.transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD')
      },
      tls: {
        ciphers: 'SSLv3'
      },
      debug: true // Para ver logs detallados
    });
  }

  async sendPasswordResetCode(email: string, code: string, userName?: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Canchas UCENIN" <${this.configService.get('EMAIL_USER')}>`,
        to: email,
        subject: 'Código de restablecimiento de contraseña - Canchas UCENIN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748; text-align: center;">Restablecimiento de Contraseña</h1>
            <p>Hola ${userName || "Usuario"},</p>
            <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
            <div style="background-color: #f7fafc; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #4a5568; font-size: 24px; letter-spacing: 5px; margin: 0;">
                ${code}
              </h2>
            </div>
            <p>Este código expirará en 5 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Saludos,<br>Equipo Canchas UCENIN</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Código de restablecimiento enviado a: ${email}`);
    } catch (error) {
      console.error('Error al enviar email:', error);
       throw new Error(`Error al enviar el correo electrónico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async sendPasswordResetConfirmation(email: string, userName?: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Canchas UCENIN" <${this.configService.get('EMAIL_USER')}>`,
        to: email,
        subject: 'Contraseña restablecida exitosamente - Canchas UCENIN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748; text-align: center;">Contraseña Restablecida</h1>
            <p>Hola ${userName || "Usuario"},</p>
            <p>Tu contraseña ha sido restablecida exitosamente.</p>
            <p style="color: #e53e3e;">Si no realizaste este cambio, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Saludos,<br>Equipo Canchas UCENIN</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Confirmación de restablecimiento enviada a: ${email}`);
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      throw new Error(`Error al enviar el correo de confirmación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async sendAccountActivation(email: string, userName: string, activationToken: string): Promise<void> {
    try {
      const activationUrl = `${this.configService.get('FRONTEND_URL')}/activate-account?token=${activationToken}`;
      
      const mailOptions = {
        from: `"Canchas UCENIN" <${this.configService.get('EMAIL_USER')}>`,
        to: email,
        subject: 'Activa tu cuenta - Canchas UCENIN',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2d3748; text-align: center;">Bienvenido a Canchas UCENIN</h1>
            <p>Hola ${userName},</p>
            <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background-color: #4a5568; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Activar mi cuenta
              </a>
            </div>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #4a5568;">${activationUrl}</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">Saludos,<br>Equipo Canchas UCENIN</p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email de activación enviado a: ${email}`);
    } catch (error) {
      console.error('Error al enviar email de activación:', error);
      throw new Error(`Error al enviar el correo de activación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}