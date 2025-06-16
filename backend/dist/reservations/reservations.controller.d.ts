import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    findAll(): Promise<import("./entities/reservation.entity").Reservation[]>;
    findAllReservations(): Promise<import("./entities/reservation.entity").Reservation[]>;
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
    findByUser(userId: number): Promise<import("./entities/reservation.entity").Reservation[]>;
    getAvailableTimeSlots(courtId: number, date: string): Promise<any>;
    checkCourtAvailability(courtId: number, startTime: string, endTime: string): Promise<{
        courtId: number;
        startTime: string;
        endTime: string;
        available: boolean;
    }>;
    processPayment(reservationId: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    findOne(id: number): Promise<import("./entities/reservation.entity").Reservation>;
    updateStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<import("./entities/reservation.entity").Reservation>;
    getCourtStats(): Promise<any[]>;
    testEndpoint(): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
}
