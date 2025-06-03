import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsISO8601, IsPositive } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PlayerDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    rut: string;

    @IsNumber()
    @IsNotEmpty()
    age: number;
}

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
    @IsISO8601()
    readonly startTime!: string;

    @Expose()
    @IsNotEmpty()
    @IsISO8601()
    readonly endTime!: string;

    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlayerDto)
    readonly players!: PlayerDto[];
}
