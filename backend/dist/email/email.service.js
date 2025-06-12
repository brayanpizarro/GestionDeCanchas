"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    async sendWelcomeEmail(email, name) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@gestioncanchas.com',
                to: email,
                subject: '¡Bienvenido a Gestión Canchas UCN!',
                html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">¡Bienvenido a Gestión Canchas UCN!</h2>
                <p>Hola <strong>${name}</strong>,</p>
                <p>Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a reservar canchas deportivas.</p>
                <p>Características de tu cuenta:</p>
                <ul>
                <li>Reserva de canchas deportivas</li>
                <li>Gestión de pagos</li>
                <li>Historial de reservas</li>
                <li>Perfil personalizable</li>
                </ul>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>¡Que disfrutes tu experiencia deportiva!</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.
                </p>
            </div>
            `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de bienvenida enviado a: ${email}`);
        }
        catch (error) {
            console.error('Error enviando email de bienvenida:', error);
        }
    }
    async sendPasswordChangeNotification(email, name) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@gestioncanchas.com',
                to: email,
                subject: 'Contraseña actualizada - Gestión Canchas UCN',
                html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Contraseña Actualizada</h2>
                <p>Hola <strong>${name}</strong>,</p>
                <p>Te informamos que tu contraseña ha sido actualizada exitosamente.</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
                <p style="margin: 0;"><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                </div>
                <p>Si no realizaste este cambio, por favor contacta con soporte inmediatamente.</p>
                <p>Por tu seguridad, te recomendamos:</p>
                <ul>
                <li>No compartir tu contraseña con nadie</li>
                <li>Usar contraseñas seguras y únicas</li>
                <li>Cambiar tu contraseña regularmente</li>
                </ul>
                <hr>
                <p style="color: #666; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.<br>
                Si necesitas ayuda, contacta con soporte técnico.
                </p>
            </div>
            `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Notificación de cambio de contraseña enviada a: ${email}`);
        }
        catch (error) {
            console.error('Error enviando notificación de cambio de contraseña:', error);
        }
    }
    async sendReservationConfirmation(email, name, reservationData) {
        try {
            const formattedDate = new Date(reservationData.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedStartTime = new Date(reservationData.startTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const formattedEndTime = new Date(reservationData.endTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@gestioncanchas.com',
                to: email,
                subject: '✅ Confirmación de Reserva - Gestión Canchas UCN',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #f8fafc;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #071d40 0%, #1e40af 100%); color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🏆 ¡Reserva Confirmada!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Gestión Canchas UCN</p>
                    </div>

                    <!-- Reservation Details -->
                    <div style="background: white; margin: 0; padding: 30px;">
                        <h2 style="color: #071d40; margin-top: 0;">Hola ${name},</h2>
                        <p style="font-size: 16px; color: #374151;">Tu reserva ha sido confirmada exitosamente. Aquí tienes todos los detalles:</p>
                        
                        <!-- Reservation Info Card -->
                        <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981;">
                            <h3 style="color: #071d40; margin-top: 0; font-size: 20px;">📋 Detalles de la Reserva</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">🏟️ Cancha:</td>
                                    <td style="padding: 8px 0; color: #1f2937;">${reservationData.courtName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">📅 Fecha:</td>
                                    <td style="padding: 8px 0; color: #1f2937;">${formattedDate}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">⏰ Horario:</td>
                                    <td style="padding: 8px 0; color: #1f2937;">${formattedStartTime} - ${formattedEndTime}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">⏱️ Duración:</td>
                                    <td style="padding: 8px 0; color: #1f2937;">${reservationData.duration} minutos</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">👥 Jugadores:</td>
                                    <td style="padding: 8px 0; color: #1f2937;">${reservationData.players.join(', ')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">🔢 ID Reserva:</td>
                                    <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">#${reservationData.id}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Important Rules -->
                        <div style="background: #fef3c7; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #f59e0b;">
                            <h3 style="color: #92400e; margin-top: 0; font-size: 20px;">⚠️ INFORMACIÓN IMPORTANTE</h3>
                            <div style="color: #78350f;">
                                <h4 style="color: #92400e; margin: 15px 0 10px 0;">🕐 Puntualidad Obligatoria</h4>
                                <p style="margin: 0 0 15px 0; line-height: 1.5;">
                                    <strong>DEBES LLEGAR PUNTUALMENTE</strong> a la hora de inicio de tu reserva (${formattedStartTime}). 
                                    Si llegas tarde, <strong>NO se te entregará la cancha</strong> y perderás tu reserva.
                                </p>

                                <h4 style="color: #92400e; margin: 15px 0 10px 0;">❌ Política de Cancelación</h4>
                                <p style="margin: 0 0 15px 0; line-height: 1.5;">
                                    Las cancelaciones deben realizarse con <strong>MÍNIMO 1 SEMANA DE ANTICIPACIÓN</strong>. 
                                    Cancelaciones con menos tiempo no serán procesadas y se cobrará la reserva completa.
                                </p>

                                <h4 style="color: #92400e; margin: 15px 0 10px 0;">📱 Contacto de Emergencia</h4>
                                <p style="margin: 0 0 10px 0; line-height: 1.5;">
                                    Para cualquier emergencia el día de la reserva, contacta inmediatamente al: 
                                    <strong style="background: #fed7aa; padding: 2px 6px; border-radius: 4px;">+56 9 XXXX XXXX</strong>
                                </p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; margin: 10px;">
                                <a href="#" style="background: #071d40; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                    📱 Ver en la App
                                </a>
                            </div>
                            <div style="display: inline-block; margin: 10px;">
                                <a href="#" style="background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                    ❌ Cancelar Reserva
                                </a>
                            </div>
                        </div>

                        <!-- Recommendations -->
                        <div style="background: #ecfdf5; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981;">
                            <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">💡 Recomendaciones</h3>
                            <ul style="color: #047857; line-height: 1.6; margin: 0; padding-left: 20px;">
                                <li>Llega 10 minutos antes para el check-in</li>
                                <li>Trae identificación oficial para validar la reserva</li>
                                <li>Confirma que todos los jugadores estén presentes</li>
                                <li>Revisa las condiciones climáticas antes de venir</li>
                                <li>Trae tu propio equipo deportivo</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #374151; color: #d1d5db; padding: 25px; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 14px;">
                            📧 Este es un correo automático de confirmación
                        </p>
                        <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                            Gestión Canchas UCN - Reserva ID: #${reservationData.id}<br>
                            Generado el ${new Date().toLocaleString('es-ES')}
                        </p>
                    </div>
                </div>
                `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de confirmación de reserva enviado a: ${email}`);
        }
        catch (error) {
            console.error('Error enviando email de confirmación de reserva:', error);
        }
    }
    async sendReservationCancellation(email, name, reservationData) {
        try {
            const formattedDate = new Date(reservationData.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedStartTime = new Date(reservationData.startTime).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const mailOptions = {
                from: process.env.EMAIL_USER || 'noreply@gestioncanchas.com',
                to: email,
                subject: '❌ Reserva Cancelada - Gestión Canchas UCN',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fef2f2;">
                    <!-- Header -->
                    <div style="background: #dc2626; color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">❌ Reserva Cancelada</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Gestión Canchas UCN</p>
                    </div>

                    <!-- Content -->
                    <div style="background: white; padding: 30px;">
                        <h2 style="color: #dc2626; margin-top: 0;">Hola ${name},</h2>
                        <p style="color: #374151;">Tu reserva ha sido cancelada. Aquí tienes los detalles:</p>
                        
                        <div style="background: #fee2e2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
                            <h3 style="color: #dc2626; margin-top: 0;">Reserva Cancelada</h3>
                            <p><strong>Cancha:</strong> ${reservationData.courtName}</p>
                            <p><strong>Fecha:</strong> ${formattedDate}</p>
                            <p><strong>Horario:</strong> ${formattedStartTime}</p>
                            <p><strong>ID Reserva:</strong> #${reservationData.id}</p>
                            ${reservationData.cancellationReason ? `<p><strong>Motivo:</strong> ${reservationData.cancellationReason}</p>` : ''}
                        </div>

                        <p>Si tienes alguna pregunta sobre esta cancelación, no dudes en contactarnos.</p>
                    </div>

                    <!-- Footer -->
                    <div style="background: #374151; color: #d1d5db; padding: 20px; text-align: center;">
                        <p style="margin: 0; font-size: 12px;">
                            Este es un correo automático - No responder<br>
                            Gestión Canchas UCN
                        </p>
                    </div>
                </div>
                `,
            };
            await this.transporter.sendMail(mailOptions);
            console.log(`Email de cancelación de reserva enviado a: ${email}`);
        }
        catch (error) {
            console.error('Error enviando email de cancelación de reserva:', error);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map