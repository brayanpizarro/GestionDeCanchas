import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsISO8601, IsPositive, IsInt, Min, IsOptional } from 'class-validator';
import {Type, Expose } from 'class-transformer';

export class PlayerDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    rut: string;

    @Expose()
    @IsNumber()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    age: number;
}

export class SelectedEquipmentDto {
    @Expose()
    @IsNotEmpty()
    @IsString()
    id: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    name: string;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    price: number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    quantity: number;
}

export class CreateReservationDto {
    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    courtId: number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    userId: number;

    @Expose()
    @IsNotEmpty()
    @IsISO8601()
    startTime: string;

    @Expose()
    @IsNotEmpty()
    @IsISO8601()
    endTime: string;

    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlayerDto)
    players: PlayerDto[];

    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SelectedEquipmentDto)
    equipment?: SelectedEquipmentDto[];
}
