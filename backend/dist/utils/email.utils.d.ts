export declare function sendEmail(to: string, subject: string, text: string): Promise<void>;
export declare function sendPasswordResetCode(email: string, code: string, userName: string): Promise<void>;
export declare function sendPasswordResetConfirmation(email: string, userName: string): Promise<void>;
