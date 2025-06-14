import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber() 
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        throw new Error('Price must be a valid number');
      }
      return parsed;
    }
    if (typeof value !== 'number') {
      throw new Error('Price must be a number');
    }
    return value;
  })
  price?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new Error('Stock must be a valid integer');
      }
      return parsed;
    }
    if (typeof value !== 'number') {
      throw new Error('Stock must be a number');
    }
    return value;
  })
  stock?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      throw new Error('Available must be a boolean or "true"/"false" string');
    }
    return Boolean(value);
  })
  available?: boolean;
  
  @IsOptional()
  @IsString()
  imagePath?: string;
}