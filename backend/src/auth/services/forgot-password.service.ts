import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { PasswordResetToken } from '../entities/password-reset.entities';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';

interface UpdateUserData {
  password?: string;
  resetToken?: string | null;
  updatedAt?: Date;
}

@Injectable()
export class ForgotPasswordService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async cleanupExpiredTokens(): Promise<void> {
    await this.passwordResetTokenRepository.delete({
      expiresAt: LessThan(new Date()),
      isUsed: false
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Retornamos el mismo mensaje aunque el usuario no exista por seguridad
      return { message: 'Si el correo existe, recibirás un código de verificación' };
    }

    // Limpiar tokens previos
    await this.cleanupExpiredTokens();
    await this.passwordResetTokenRepository.delete({ email, isUsed: false });

    // Generar nuevo token de reset
    const resetToken = uuidv4();
    const code = this.generateSixDigitCode();
    const hashedCode = await bcrypt.hash(code, 10);

    // Actualizar usuario con el nuevo reset token
    await this.userRepository.update(
      { id: user.id },
      { resetToken }
    );

    // Crear token de restablecimiento
    const passwordResetToken = this.passwordResetTokenRepository.create({
      email,
      code: hashedCode,
      token: resetToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
      isUsed: false,
      createdAt: new Date()
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);
    await this.emailService.sendPasswordResetCode(email, code, user.name);

    return { message: 'Si el correo existe, recibirás un código de verificación' };
  }

  async verifyResetCode(email: string, code: string): Promise<{ isValid: boolean; message: string }> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { 
        email,
        isUsed: false
      },
      order: { createdAt: 'DESC' }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return { isValid: false, message: 'Código inválido o expirado' };
    }

    const isValidCode = await bcrypt.compare(code, resetToken.code);
    return {
      isValid: isValidCode,
      message: isValidCode ? 'Código válido' : 'Código inválido'
    };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { 
        email,
        isUsed: false,
      },
      order: { createdAt: 'DESC' }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      // Limpiar token expirado del usuario
      const updateData: UpdateUserData = {
        resetToken: null
      };
      await this.userRepository.update({ id: user.id }, updateData);
      throw new BadRequestException('Código inválido o expirado');
    }

    const isValidCode = await bcrypt.compare(code, resetToken.code);
    if (!isValidCode) {
      throw new BadRequestException('Código inválido');
    }

    // Actualizar contraseña y limpiar reset token
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updateData: UpdateUserData = {
      password: hashedPassword,
      resetToken: null,
      updatedAt: new Date()
    };

    await this.userRepository.update({ id: user.id }, updateData);

    // Marcar token como usado
    await this.passwordResetTokenRepository.update(
      { id: resetToken.id },
      { isUsed: true }
    );

    // Enviar confirmación por email
    await this.emailService.sendPasswordResetConfirmation(email, user.name);
    return { message: 'Contraseña actualizada correctamente' };
  }
}