// src/courts/courts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { Court } from './entities/court.entity';
import {UsersModule} from "../users/users.module";
import { Reservation } from '@reservations/entities/reservation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Court,Reservation]),UsersModule],
    controllers: [CourtsController],
    providers: [CourtsService],
    exports: [CourtsService],
})
export class CourtsModule {}