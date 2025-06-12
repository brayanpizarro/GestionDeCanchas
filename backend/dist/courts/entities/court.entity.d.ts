import { Reservation } from '../../reservations/entities/reservation.entity';
export declare class Court {
    id: number;
    name: string;
    description: string;
    location: string;
    pricePerHour: number;
    status: string;
    type: string;
    capacity: number;
    rating: number;
    imagePath: string;
    createdAt: Date;
    updatedAt: Date;
    reservations: Reservation[];
}
