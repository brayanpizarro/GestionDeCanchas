import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Request } from 'express';
import { User } from '@users/entities/user.entity';
interface RequestWithUser extends Request {
    user: User;
}
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    create(createCardDto: CreateCardDto, req: RequestWithUser): Promise<import("./entities/card.entity").Card>;
    findAll(req: RequestWithUser): Promise<import("./entities/card.entity").Card[]>;
    remove(id: number, req: RequestWithUser): Promise<void>;
}
export {};
