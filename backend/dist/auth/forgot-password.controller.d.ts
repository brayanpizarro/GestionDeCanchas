import { ForgotPasswordService } from '../auth/services/forgot-password.service';
import { ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto } from '../auth/dto/forgot-password.dto';
export declare class ForgotPasswordController {
    private readonly forgotPasswordService;
    constructor(forgotPasswordService: ForgotPasswordService);
    requestPasswordReset(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto): Promise<{
        message: string;
        valid: boolean;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
