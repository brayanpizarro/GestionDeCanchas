export declare class EmailService {
    private transporter;
    private readonly logger;
    constructor();
    private isEmailConfigured;
    sendEmail(to: string, subject: string, text: string): Promise<void>;
    sendPasswordResetCode(email: string, code: string, userName: string): Promise<void>;
    sendPasswordResetConfirmation(email: string, userName: string): Promise<void>;
    sendWelcomeEmail(email: string, userName: string): Promise<void>;
    sendPasswordChangeNotification(email: string, userName: string): Promise<void>;
    sendReservationConfirmation(email: string, name: string, reservationData: {
        id: number;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
        duration: number;
        players: string[];
    }): Promise<void>;
    sendReservationCancellation(email: string, name: string, reservationData: {
        id: number;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
        cancellationReason?: string;
    }): Promise<void>;
}
