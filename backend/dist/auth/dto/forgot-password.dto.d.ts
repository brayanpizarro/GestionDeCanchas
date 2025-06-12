export declare class ForgotPasswordDto {
    email: string;
}
export declare class VerifyResetCodeDto {
    email: string;
    code: string;
}
export declare class ResetPasswordDto {
    email: string;
    code: string;
    newPassword: string;
}
