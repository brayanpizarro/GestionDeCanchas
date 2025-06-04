import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
  
  @IsOptional()
  @IsString()
  imagePath?: string;
}