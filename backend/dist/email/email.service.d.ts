export declare class EmailService {
    private transporter;
    constructor();
    sendWelcomeEmail(email: string, name: string): Promise<void>;
    sendPasswordChangeNotification(email: string, name: string): Promise<void>;
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
