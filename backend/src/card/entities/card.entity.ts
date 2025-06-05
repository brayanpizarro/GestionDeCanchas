import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cardNumber: string;

  @Column()
  holderName: string;

  @Column()
  expiry: string;

  @ManyToOne(() => User, (user) => user.cards, { eager: false })
  user: User;
}
