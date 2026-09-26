export declare class EmailService {
    sendEmail(_to: string, _subject: string, _text: string): Promise<void>;
    sendPasswordResetCode(_email: string, _code: string, _userName: string): Promise<void>;
    sendPasswordResetConfirmation(_email: string, _userName: string): Promise<void>;
    sendWelcomeEmail(_email: string, _userName: string): Promise<void>;
    sendPasswordChangeNotification(_email: string, _userName: string): Promise<void>;
    sendReservationConfirmation(_email: string, _name: string, _reservationData: {
        id: number;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
        duration: number;
        players: string[];
    }): Promise<void>;
    sendReservationCancellation(_email: string, _name: string, _reservationData: {
        id: number;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
        cancellationReason?: string;
    }): Promise<void>;
}
