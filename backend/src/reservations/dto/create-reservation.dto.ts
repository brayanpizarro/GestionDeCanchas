import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsISO8601, IsPositive } from 'class-validator';
import {Type } from 'class-transformer';

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
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    courtId: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    userId: number;

    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @IsNotEmpty()
    @IsISO8601()
    endTime: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlayerDto)
    players: PlayerDto[];
}
