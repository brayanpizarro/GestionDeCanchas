import { CreateCardDto } from './dto/create-card.dto';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { User } from '@users/entities/user.entity';
export declare class CardService {
    private readonly cardRepository;
    constructor(cardRepository: Repository<Card>);
    create(createCardDto: CreateCardDto, user: User): Promise<Card>;
    findByUser(user: User): Promise<Card[]>;
    remove(id: number, user: User): Promise<void>;
}
