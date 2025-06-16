import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './entities/reservation.entity';
import { Court } from '../courts/entities/court.entity';
import { User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { EmailService } from '../email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Court, User, Player]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ProductsModule,
  ],
  providers: [ReservationsService, EmailService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {}
