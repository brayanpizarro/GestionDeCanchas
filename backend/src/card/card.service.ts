import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { User } from '@users/entities/user.entity';
import { validateCard } from './utils/card-validator'; // Asegúrate de crearlo

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>
  ) {}

  async create(createCardDto: CreateCardDto, user: User): Promise<Card> {
    const errors = validateCard(createCardDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const card = this.cardRepository.create({ ...createCardDto, user });
    return this.cardRepository.save(card);
  }

  async findByUser(user: User): Promise<Card[]> {
    return this.cardRepository.find({ where: { user } });
  }

  async remove(id: number, user: User): Promise<void> {
    const card = await this.cardRepository.findOne({ where: { id, user } });
    if (!card) {
      throw new Error('Tarjeta no encontrada o no pertenece al usuario.');
    }
    await this.cardRepository.remove(card);
  }
}
