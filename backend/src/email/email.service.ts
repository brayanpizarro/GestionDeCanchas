import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { formatReservationDateBackend, formatReservationTimeRangeBackend, formatReservationTimeBackend } from '../utils/date.utils';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter | null;
    private readonly logger = new Logger(EmailService.name);

    constructor() {
        // Solo configurar el transporter si las credenciales están disponibles
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            this.transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
            this.logger.log('✅ Email service configured successfully');
        } else {
            this.logger.warn('⚠️ Email credentials not configured. Email functionality will be disabled.');
            this.transporter = null;
        }
    }

    // Método helper para verificar si el email está configurado
    private isEmailConfigured(): boolean {
        return this.transporter !== null;
    }

    // Método genérico para enviar emails
    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log(`📧 Email skipped (not configured): ${subject} to ${to}`);
            return;
        }

        try {
            const info = await this.transporter!.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                text,
            });
            this.logger.log(`📧 Email sent: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`❌ Error sending email: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async sendPasswordResetCode(email: string, code: string, userName: string): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log('📧 Email skipped (not configured): Password reset code to', email);
            return;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: 'Código de restablecimiento de contraseña - Gestión Canchas UCN',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Hola ${userName},</h2>
                        <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
                        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
                            ${code}
                        </div>
                        <p>Este código expira en 5 minutos.</p>
                        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                        <p>Saludos,<br>Equipo Gestión Canchas UCN</p>
                    </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            this.logger.log(`✅ Código de restablecimiento enviado a: ${email}`);
        } catch (error) {
            this.logger.error('❌ Error enviando código de restablecimiento:', error);
        }
    }

    async sendPasswordResetConfirmation(email: string, userName: string): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log('📧 Email skipped (not configured): Password reset confirmation to', email);
            return;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: 'Contraseña actualizada - Gestión Canchas UCN',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Hola ${userName},</h2>
                        <p>Tu contraseña ha sido actualizada exitosamente.</p>
                        <p>Si no realizaste este cambio, contacta inmediatamente con administración.</p>
                        <p>Saludos,<br>Equipo Gestión Canchas UCN</p>
                    </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            this.logger.log(`✅ Confirmación de actualización de contraseña enviada a: ${email}`);
        } catch (error) {
            this.logger.error('❌ Error enviando confirmación de actualización de contraseña:', error);
        }
    }

    async sendWelcomeEmail(email: string, userName: string): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log('📧 Email skipped (not configured): Welcome email to', email);
            return;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: '¡Bienvenido a Gestión Canchas UCN! - Cuenta creada exitosamente',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>¡Bienvenido ${userName}!</h2>
                        <p>Tu cuenta en Gestión Canchas UCN ha sido creada exitosamente.</p>
                        <p>Ya puedes acceder a nuestros servicios y realizar reservas de canchas deportivas.</p>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>¿Qué puedes hacer ahora?</h3>
                            <ul>
                                <li>Ver y reservar canchas disponibles</li>
                                <li>Gestionar tu perfil</li>
                                <li>Revisar tu historial de reservas</li>
                                <li>Agregar métodos de pago</li>
                            </ul>
                        </div>
                        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                        <p>¡Disfruta de nuestras instalaciones!<br>Equipo Gestión Canchas UCN</p>
                    </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            this.logger.log(`✅ Email de bienvenida enviado a: ${email}`);
        } catch (error) {
            this.logger.error('❌ Error enviando email de bienvenida:', error);
        }
    }

    async sendPasswordChangeNotification(email: string, userName: string): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log('📧 Email skipped (not configured): Password change notification to', email);
            return;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: 'Contraseña modificada - Gestión Canchas UCN',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Hola ${userName},</h2>
                        <p>Te informamos que tu contraseña ha sido modificada exitosamente desde tu perfil.</p>
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <strong>⚠️ Medidas de seguridad:</strong>
                            <p>Si NO fuiste tú quien realizó este cambio, contacta inmediatamente con nuestro equipo de soporte.</p>
                        </div>
                        <p>Fecha y hora del cambio: ${new Date().toLocaleString('es-CL')}</p>
                        <p>Para tu seguridad, te recomendamos:</p>
                        <ul>
                            <li>No compartir tu contraseña con nadie</li>
                            <li>Usar una contraseña fuerte y única</li>
                            <li>Cerrar sesión en dispositivos compartidos</li>
                        </ul>
                        <p>Saludos,<br>Equipo Gestión Canchas UCN</p>
                    </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            this.logger.log(`✅ Notificación de cambio de contraseña enviada a: ${email}`);
        } catch (error) {
            this.logger.error('❌ Error enviando notificación de cambio de contraseña:', error);
        }
    }

    async sendReservationConfirmation(
        email: string,
        name: string,
        reservationData: {
            id: number;
            courtName: string;
            date: string;
            startTime: string;
            endTime: string;
            duration: number;
            players: string[];
        }
    ): Promise<void> {
        if (!this.isEmailConfigured()) {
            this.logger.log('📧 Email skipped (not configured): Reservation confirmation to', email);
            return;
        }

        try {
            this.logger.log('Enviando confirmación de reserva...');
            this.logger.log(`Destinatario: ${email}`);
            this.logger.log(`Cancha: ${reservationData.courtName}`);

            const formattedDate = formatReservationDateBackend(reservationData.date);
            const formattedTimeRange = formatReservationTimeRangeBackend(reservationData.startTime, reservationData.endTime);
            const formattedStartTime = formatReservationTimeBackend(reservationData.startTime);

            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: email,
                subject: 'Confirmación de Reserva - Gestión Canchas UCN',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8fafc;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #071d40 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">¡Reserva Confirmada!</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Gestión Canchas UCN</p>
                        </div>

                        <!-- Reservation Details -->
                        <div style="background: white; margin: 0; padding: 30px;">
                            <h2 style="color: #071d40; margin-top: 0;">Hola ${name},</h2>
                            <p style="font-size: 16px; color: #374151;">Tu reserva ha sido confirmada exitosamente. Aquí tienes todos los detalles:</p>
                            
                            <!-- Reservation Info Card -->
                            <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981;">
                                <h3 style="color: #071d40; margin-top: 0; font-size: 20px;">Detalles de la Reserva</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Cancha:</td>
                                        <td style="padding: 8px 0; color: #1f2937;">${reservationData.courtName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha:</td>
                                        <td style="padding: 8px 0; color: #1f2937;">${formattedDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">🕐 Horario:</td>
                                        <td style="padding: 8px 0; color: #1f2937;">${formattedTimeRange}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Jugadores:</td>
                                        <td style="padding: 8px 0; color: #1f2937;">${reservationData.players.join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">ID Reserva:</td>
                                        <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">#${reservationData.id}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Important Rules -->
                            <div style="background: #fef3c7; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #f59e0b;">
                                <h3 style="color: #92400e; margin-top: 0; font-size: 20px;">⚠️ INFORMACIÓN IMPORTANTE</h3>
                                <div style="color: #78350f;">
                                    <h4 style="color: #92400e; margin: 15px 0 10px 0;">⏰ Puntualidad Obligatoria</h4>
                                    <p style="margin: 0 0 15px 0; line-height: 1.5;">
                                        <strong>DEBES LLEGAR PUNTUALMENTE</strong> a la hora de inicio de tu reserva (${formattedStartTime}). 
                                        Si llegas tarde, <strong>NO se te entregará la cancha</strong> y perderás tu reserva.
                                    </p>

                                    <h4 style="color: #92400e; margin: 15px 0 10px 0;">📅 Política de Cancelación</h4>
                                    <p style="margin: 0 0 15px 0; line-height: 1.5;">
                                        Las cancelaciones deben realizarse con <strong>MÍNIMO 1 SEMANA DE ANTICIPACIÓN</strong>. 
                                        Cancelaciones con menos tiempo no serán procesadas y se cobrará la reserva completa.
                                    </p>
                                </div>
                            </div>

                            <!-- Recommendations -->
                            <div style="background: #ecfdf5; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981;">
                                <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">💡 Recomendaciones</h3>
                                <ul style="color: #047857; line-height: 1.6; margin: 0; padding-left: 20px;">
                                    <li>Llega 10 minutos antes para el check-in</li>
                                    <li>Trae identificación oficial para validar la reserva</li>
                                    <li>Confirma que todos los jugadores estén presentes</li>
                                </ul>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background: #374151; color: #d1d5db; padding: 25px; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 14px;">
                                Este es un correo automático de confirmación
                            </p>
                            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                                Gestión Canchas UCN - Reserva ID: #${reservationData.id}<br>
                                Generado el ${new Date().toLocaleString('es-ES')}
                            </p>
                        </div>
                    </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            this.logger.log(`✅ Confirmación de reserva enviada exitosamente a: ${email}`);
        } catch (error) {
            this.logger.error('❌ Error enviando confirmación de reserva:', error);
        }
    }

    async sendReservationCancellation(
        email: string, 
        name: string, 
        reservationData: {
            id: number;
            courtName: string;
            date: string;
            startTime: string;
            endTime: string;
            cancellationReason?: string;
        }
    ): Promise<void> {
        if (!this.isEmailConfigured()) {
            console.log('📧 Email skipped (not configured): Reservation cancellation to', email);
            return;
        }

        try {
            const formattedDate = formatReservationDateBackend(reservationData.date);
            const formattedStartTime = formatReservationTimeBackend(reservationData.startTime);

            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@gestioncanchas.com',
                to: email,
                subject: 'Reserva Cancelada - Gestión Canchas UCN',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Reserva Cancelada</h2>
                    <p>Hola ${name},</p>
                    <p>Tu reserva ha sido cancelada:</p>
                    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Reserva #${reservationData.id}</strong></p>
                        <p><strong>Cancha:</strong> ${reservationData.courtName}</p>
                        <p><strong>Fecha:</strong> ${formattedDate}</p>
                        <p><strong>Horario:</strong> ${formattedStartTime}</p>
                        ${reservationData.cancellationReason ? `<p><strong>Motivo:</strong> ${reservationData.cancellationReason}</p>` : ''}
                    </div>
                    <p>Esperamos verte pronto en nuestras instalaciones.</p>
                </div>
                `,
            };

            await this.transporter!.sendMail(mailOptions);
            console.log(`✅ Email de cancelación de reserva enviado a: ${email}`);
        } catch (error) {
            console.error('❌ Error enviando email de cancelación de reserva:', error);
        }
    }
}
