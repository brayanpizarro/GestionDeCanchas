import { IsNotEmpty, IsDateString, IsNumber, IsPositive } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateReservationDto {
    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    readonly courtId!: number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    readonly userId!: number;

    @Expose()
    @IsNotEmpty()
    @IsDateString()
    readonly startTime!: string;

    @Expose()
    @IsNotEmpty()
    @IsDateString()
    readonly endTime!: string;
}
