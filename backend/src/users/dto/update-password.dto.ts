import { IsString, MinLength, IsNumber, Matches } from 'class-validator';

export class UpdatePasswordDto {
    @IsNumber()
    id: number;

    @IsString()
    currentPassword: string;

    @IsString({ message: "La contraseña debe ser una cadena de texto" })
    @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
        message: "La nueva contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial",
    })
    newPassword: string;
}