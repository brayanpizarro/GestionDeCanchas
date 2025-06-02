import { IsEnum, IsInt, IsNotEmpty, IsString, Min, IsOptional } from 'class-validator';

export class CreateCourtDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(['covered', 'uncovered'])
    type: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsInt()
    @Min(2) // Mínimo 2 personas (pádel)
    capacity: number;

    @IsEnum(['available', 'occupied', 'maintenance'])
    status: string;
}