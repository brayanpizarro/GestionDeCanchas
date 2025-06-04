import { IsEnum, IsInt, IsNotEmpty, IsString, Min, IsOptional, IsNumber } from 'class-validator';

export class CreateCourtDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['covered', 'uncovered'])
  type: string;
  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsInt()
  @Min(2)
  capacity: number;

  @IsNumber()
  @Min(0)
  pricePerHour: number; 

  @IsEnum(['available', 'occupied', 'maintenance'])
  status: string;
}