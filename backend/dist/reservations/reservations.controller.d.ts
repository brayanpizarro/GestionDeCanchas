import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    findAll(): Promise<import("./entities/reservation.entity").Reservation[]>;
    getStats(): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        todayReservations: number;
        courtStats: {
            courtId?: number;
            court: string;
            reservations: number;
        }[];
    }>;
    getDebugReservations(): Promise<{
        total: number;
        reservations: import("./entities/reservation.entity").Reservation[];
    }>;
    findAllReservations(): Promise<import("./entities/reservation.entity").Reservation[]>;
    findByUser(userId: number): Promise<import("./entities/reservation.entity").Reservation[]>;
    getAvailableTimeSlots(courtId: number, date: string): Promise<{
        startTime: Date;
        endTime: Date;
    }[]>;
    processPayment(reservationId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: number): Promise<import("./entities/reservation.entity").Reservation>;
    updateStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<import("./entities/reservation.entity").Reservation>;
    testEmail(): Promise<{
        success: boolean;
        message: string;
        config: {
            EMAIL_USER: string;
            EMAIL_PASSWORD: string;
        };
        sentTo?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        sentTo: string;
        config?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: string;
        config?: undefined;
        sentTo?: undefined;
    }>;
    getAvailability(courtId: number, date: string): Promise<{
        startTime: Date;
        endTime: Date;
        isAvailable: boolean;
        status?: "confirmed" | "pending";
        reservationId?: number;
    }[]>;
}
