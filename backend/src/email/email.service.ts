import { Injectable } from '@nestjs/common';

/**
 * Compatibilidad para los servicios que todavía invocan notificaciones.
 * Las notificaciones por email están deshabilitadas y no requieren SMTP.
 */
@Injectable()
export class EmailService {
  async sendEmail(_to: string, _subject: string, _text: string): Promise<void> {}

  async sendPasswordResetCode(
    _email: string,
    _code: string,
    _userName: string,
  ): Promise<void> {}

  async sendPasswordResetConfirmation(
    _email: string,
    _userName: string,
  ): Promise<void> {}

  async sendWelcomeEmail(_email: string, _userName: string): Promise<void> {}

  async sendPasswordChangeNotification(
    _email: string,
    _userName: string,
  ): Promise<void> {}

  async sendReservationConfirmation(
    _email: string,
    _name: string,
    _reservationData: {
      id: number;
      courtName: string;
      date: string;
      startTime: string;
      endTime: string;
      duration: number;
      players: string[];
    },
  ): Promise<void> {}

  async sendReservationCancellation(
    _email: string,
    _name: string,
    _reservationData: {
      id: number;
      courtName: string;
      date: string;
      startTime: string;
      endTime: string;
      cancellationReason?: string;
    },
  ): Promise<void> {}
}
