import { IsEnum, IsInt, IsNotEmpty, IsString, Min, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCourtDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(['covered', 'uncovered'], {
    message: 'El tipo debe ser "covered" o "uncovered"'
  })
  type: 'covered' | 'uncovered';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === 'covered';
    }
    if (typeof value === 'boolean') {
      return value;
    }
    return false;
  })
  isCovered?: boolean;
  
  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsNotEmpty()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  })
  capacity: number;

  @IsNotEmpty()
  @IsNumber({}, { message: 'El precio por hora debe ser un número válido' })
  @Min(0, { message: 'El precio por hora no puede ser negativo' })
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  })
  pricePerHour: number;

  @IsNotEmpty()
  @IsEnum(['available', 'occupied', 'maintenance'], {
    message: 'El estado debe ser "available", "occupied" o "maintenance"'
  })
  status: 'available' | 'occupied' | 'maintenance';
}