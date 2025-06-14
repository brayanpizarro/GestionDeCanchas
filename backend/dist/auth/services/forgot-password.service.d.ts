import { Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset.entities';
import { User } from '../../users/entities/user.entity';
import { EmailService } from '../../email/email.service';
export declare class ForgotPasswordService {
    private passwordResetTokenRepository;
    private userRepository;
    private readonly emailService;
    constructor(passwordResetTokenRepository: Repository<PasswordResetToken>, userRepository: Repository<User>, emailService: EmailService);
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    verifyResetCode(email: string, code: string): Promise<{
        message: string;
        valid: boolean;
    }>;
    resetPassword(email: string, code: string, newPassword: string): Promise<{
        message: string;
    }>;
    private cleanupExpiredTokens;
    private generateSixDigitCode;
}
