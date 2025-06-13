export declare function sendEmail(to: string, subject: string, text: string): Promise<void>;
export declare function sendPasswordResetCode(email: string, code: string, userName: string): Promise<void>;
export declare function sendPasswordResetConfirmation(email: string, userName: string): Promise<void>;
export declare function sendWelcomeEmail(email: string, userName: string): Promise<void>;
export declare function sendPasswordChangeNotification(email: string, userName: string): Promise<void>;
export declare function sendReservationConfirmation(email: string, name: string, reservationData: {
    id: number;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    players: string[];
}): Promise<void>;
