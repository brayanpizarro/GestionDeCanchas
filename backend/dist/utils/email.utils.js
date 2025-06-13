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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendPasswordResetCode = sendPasswordResetCode;
exports.sendPasswordResetConfirmation = sendPasswordResetConfirmation;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPasswordChangeNotification = sendPasswordChangeNotification;
exports.sendReservationConfirmation = sendReservationConfirmation;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
common_1.Logger.log(`EMAIL_USER environment variable: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
common_1.Logger.log(`EMAIL_PASSWORD environment variable: ${process.env.EMAIL_PASSWORD ? 'Loaded' : 'Not loaded'}`);
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
transporter.verify(function (error) {
    if (error) {
        common_1.Logger.error('Error verifying transporter:', error);
    }
    else {
        common_1.Logger.log('Server is ready to take our messages');
    }
});
async function sendEmail(to, subject, text) {
    try {
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
        const info = await transporter.sendMail({
            from: '"Soporte UCENIN" <no-reply@ucenin.com>',
            to,
            subject,
            text,
        });
        common_1.Logger.log(`Email sent: ${info.messageId}`);
    }
    catch (error) {
        common_1.Logger.error(`Error sending email: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function sendPasswordResetCode(email, code, userName) {
    try {
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
        const mailOptions = {
            from: '"Soporte UCENIN" <no-reply@ucenin.com>',
            to: email,
            subject: 'Código de restablecimiento de contraseña - UCENIN',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${userName},</h2>
          <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${code}
          </div>
          <p>Este código expira en 5 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo UCENIN</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        common_1.Logger.log(`Password reset code sent to: ${email}`);
    }
    catch (error) {
        common_1.Logger.error(`Error sending password reset code: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function sendPasswordResetConfirmation(email, userName) {
    try {
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
        const mailOptions = {
            from: '"Soporte UCENIN" <no-reply@ucenin.com>',
            to: email,
            subject: 'Contraseña actualizada - UCENIN',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${userName},</h2>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <p>Si no realizaste este cambio, contacta inmediatamente con administración.</p>
          <p>Saludos,<br>Equipo UCENIN</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        common_1.Logger.log(`Password reset confirmation sent to: ${email}`);
    }
    catch (error) {
        common_1.Logger.error(`Error sending password reset confirmation: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function sendWelcomeEmail(email, userName) {
    try {
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
        const mailOptions = {
            from: '"Soporte UCENIN" <no-reply@ucenin.com>',
            to: email,
            subject: '¡Bienvenido a UCENIN! - Cuenta creada exitosamente',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Bienvenido ${userName}!</h2>
          <p>Tu cuenta en UCENIN ha sido creada exitosamente.</p>
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
          <p>¡Disfruta de nuestras instalaciones!<br>Equipo UCENIN</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        common_1.Logger.log(`Welcome email sent to: ${email}`);
    }
    catch (error) {
        common_1.Logger.error(`Error sending welcome email: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function sendPasswordChangeNotification(email, userName) {
    try {
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
        const mailOptions = {
            from: '"Soporte UCENIN" <no-reply@ucenin.com>',
            to: email,
            subject: 'Contraseña modificada - UCENIN',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${userName},</h2>
          <p>Te informamos que tu contraseña ha sido modificada exitosamente desde tu perfil.</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <strong> Medidas de seguridad:</strong>
            <p>Si NO fuiste tú quien realizó este cambio, contacta inmediatamente con nuestro equipo de soporte.</p>
          </div>
          <p>Fecha y hora del cambio: ${new Date().toLocaleString('es-CL')}</p>
          <p>Para tu seguridad, te recomendamos:</p>
          <ul>
            <li>No compartir tu contraseña con nadie</li>
            <li>Usar una contraseña fuerte y única</li>
            <li>Cerrar sesión en dispositivos compartidos</li>
          </ul>
          <p>Saludos,<br>Equipo UCENIN</p>
        </div>
      `,
        };
        await transporter.sendMail(mailOptions);
        common_1.Logger.log(`Password change notification sent to: ${email}`);
    }
    catch (error) {
        common_1.Logger.error(`Error sending password change notification: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function sendReservationConfirmation(email, name, reservationData) {
    try {
        common_1.Logger.log('Enviando confirmación de reserva...');
        common_1.Logger.log(`Destinatario: ${email}`);
        common_1.Logger.log(`Cancha: ${reservationData.courtName}`);
        common_1.Logger.log(`Using EMAIL_USER: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
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
            from: '"Gestión Canchas UCN" <no-reply@gestioncanchas.com>',
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
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;"> Horario:</td>
                  <td style="padding: 8px 0; color: #1f2937;">${formattedStartTime} - ${formattedEndTime}</td>
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
              <h3 style="color: #92400e; margin-top: 0; font-size: 20px;">INFORMACIÓN IMPORTANTE</h3>
              <div style="color: #78350f;">
                <h4 style="color: #92400e; margin: 15px 0 10px 0;"> Puntualidad Obligatoria</h4>
                <p style="margin: 0 0 15px 0; line-height: 1.5;">
                  <strong>DEBES LLEGAR PUNTUALMENTE</strong> a la hora de inicio de tu reserva (${formattedStartTime}). 
                  Si llegas tarde, <strong>NO se te entregará la cancha</strong> y perderás tu reserva.
                </p>

                <h4 style="color: #92400e; margin: 15px 0 10px 0;">Política de Cancelación</h4>
                <p style="margin: 0 0 15px 0; line-height: 1.5;">
                  Las cancelaciones deben realizarse con <strong>MÍNIMO 1 SEMANA DE ANTICIPACIÓN</strong>. 
                  Cancelaciones con menos tiempo no serán procesadas y se cobrará la reserva completa.
                </p>
              </div>
            </div>

            <!-- Recommendations -->
            <div style="background: #ecfdf5; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 5px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0; font-size: 18px;"> Recomendaciones</h3>
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
        await transporter.sendMail(mailOptions);
        common_1.Logger.log(` Confirmación de reserva enviada exitosamente a: ${email}`);
    }
    catch (error) {
        common_1.Logger.error(`Error enviando confirmación de reserva: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=email.utils.js.map