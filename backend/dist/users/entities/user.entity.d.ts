import { UserRole } from './user-role.enum';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Card } from '../../card/entities/card.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    status: 'active' | 'inactive';
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    reservations: Reservation[];
    balance: number;
    cards: Card[];
}
