import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordController } from '../auth/forgot-password.controller';
import { ForgotPasswordService } from '../auth/services/forgot-password.service';
import { PasswordResetToken } from '../auth/entities/password-reset.entities';
import { User } from '../users/entities/user.entity';
import { EmailModule } from './email.module'; // Tu módulo de correo

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken, User]),
    EmailModule,
  ],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}

// Email Service (ejemplo básico)
// services/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string, userName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL'),
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

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetConfirmation(email: string, userName: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('FROM_EMAIL'),
      to: email,
      subject: 'Contraseña actualizada - UCENIN',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${userName},</h2>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <p>Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
          <p>Saludos,<br>Equipo UCENIN</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}