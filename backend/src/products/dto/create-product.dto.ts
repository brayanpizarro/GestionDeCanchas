import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber() 
    @Transform(({ value }) => {
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
    price: number;

    @IsNumber()
    @Transform(({ value }) => {
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
    stock: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
            throw new Error('Available must be a boolean or "true"/"false" string');
        }
        return Boolean(value);
    })
    available: boolean = true;

    @IsString()
    @IsOptional()
    imagePath?: string;
}