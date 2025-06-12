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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendPasswordResetCode = sendPasswordResetCode;
exports.sendPasswordResetConfirmation = sendPasswordResetConfirmation;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
common_1.Logger.log(`EMAIL_USER environment variable: ${process.env.EMAIL_USER ? 'Loaded' : 'Not loaded'}`);
common_1.Logger.log(`EMAIL_PASSWORD environment variable: ${process.env.EMAIL_PASSWORD ? 'Loaded' : 'Not loaded'}`);
const transporter = nodemailer.createTransport({
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
//# sourceMappingURL=email.utils.js.map