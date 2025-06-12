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
//# sourceMappingURL=email.utils.js.map