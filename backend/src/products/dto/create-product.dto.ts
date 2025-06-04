import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    price: number;

    @IsNumber()
    stock: number;

    @IsString()
    category: string;

    @IsBoolean()
    @IsOptional()
    available?: boolean;

    @IsString()
    @IsOptional()
    imagePath?: string;
}