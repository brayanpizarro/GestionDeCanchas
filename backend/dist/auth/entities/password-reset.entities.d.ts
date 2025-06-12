export declare class PasswordResetToken {
    id: number;
    email: string;
    code: string;
    token: string;
    isUsed: boolean;
    createdAt: Date;
    expiresAt: Date;
}
