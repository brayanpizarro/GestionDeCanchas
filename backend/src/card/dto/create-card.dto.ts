import { IsNotEmpty, IsString, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, { message: 'El número de tarjeta debe tener entre 13 y 19 dígitos' })
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  holderName: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @IsNumber()
  @Min(2024) // Año mínimo aceptado
  expiryYear: number;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'El CVV debe tener 3 o 4 dígitos' })
  cvv: string;
}
