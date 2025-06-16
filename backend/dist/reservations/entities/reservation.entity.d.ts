import { User } from "../../users/entities/user.entity";
import { Court } from "../../courts/entities/court.entity";
import { Player } from "./player.entity";
export declare class Reservation {
    id: number;
    startTime: Date;
    endTime: Date;
    status: string;
    amount: number;
    user: User;
    userId: number;
    court: Court;
    courtId: number;
    players: Player[];
    equipment: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    }[] | null;
    createdAt: Date;
}
