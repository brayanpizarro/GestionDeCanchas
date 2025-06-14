import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PasswordResetToken } from '../entities/password-reset.entities';
import { User } from '../../users/entities/user.entity'; // Asume que tienes una entidad User
import { EmailService } from '../../email/email.service';

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Verificar si el usuario existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message: 'Si el correo existe, recibirás un código de verificación',
      };
    }

    // Limpiar tokens previos del usuario
    await this.cleanupExpiredTokens();
    await this.passwordResetTokenRepository.delete({ email, isUsed: false });

    // Generar código de 6 dígitos
    const code = this.generateSixDigitCode();
    const token = crypto.randomBytes(32).toString('hex');
    const hashedCode = await bcrypt.hash(code, 10);

    // Crear token de restablecimiento
    const resetToken = this.passwordResetTokenRepository.create({
      email,
      code: hashedCode,
      token,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    });

    await this.passwordResetTokenRepository.save(resetToken);

    // Enviar correo con el código
    await this.emailService.sendPasswordResetCode(email, code, user.name || 'Usuario');

    return {
      message: 'Si el correo existe, recibirás un código de verificación',
    };
  }

  /**
   * Verificar código de restablecimiento
   */
  async verifyResetCode(
    email: string,
    code: string,
  ): Promise<{ message: string; valid: boolean }> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        email,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!resetToken) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.passwordResetTokenRepository.delete({ id: resetToken.id });
      throw new BadRequestException('El código ha expirado');
    }

    const isValidCode = await bcrypt.compare(code, resetToken.code);
    if (!isValidCode) {
      throw new BadRequestException('Código inválido');
    }

    return { message: 'Código verificado correctamente', valid: true };
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Verificar código nuevamente
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        email,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!resetToken) {
      throw new BadRequestException('Código inválido o expirado');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.passwordResetTokenRepository.delete({ id: resetToken.id });
      throw new BadRequestException('El código ha expirado');
    }

    const isValidCode = await bcrypt.compare(code, resetToken.code);
    if (!isValidCode) {
      throw new BadRequestException('Código inválido');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(
      { email },
      {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    );

    // Marcar token como usado
    await this.passwordResetTokenRepository.update(
      { id: resetToken.id },
      { isUsed: true },
    );

    // Enviar confirmación por correo
    await this.emailService.sendPasswordResetConfirmation(email, user.name || 'Usuario');

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Limpiar tokens expirados
   */
  private async cleanupExpiredTokens(): Promise<void> {
    await this.passwordResetTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Generar código de 6 dígitos
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
