import { User } from '../../users/entities/user.entity';
export declare class Card {
    id: number;
    cardNumber: string;
    holderName: string;
    expiry: string;
    user: User;
}
