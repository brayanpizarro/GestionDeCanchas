import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from "class-validator"

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Debe ser un email válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email: string
}

export class VerifyResetCodeDto {
  @IsEmail({}, { message: "Debe ser un email válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email: string

  @IsString({ message: "El código debe ser una cadena de texto" })
  @IsNotEmpty({ message: "El código es requerido" })
  @Matches(/^\d{6}$/, { message: "El código debe tener exactamente 6 dígitos" })
  code: string
}

export class ResetPasswordDto {
  @IsEmail({}, { message: "Debe ser un email válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email: string

  @IsString({ message: "El código debe ser una cadena de texto" })
  @IsNotEmpty({ message: "El código es requerido" })
  @Matches(/^\d{6}$/, { message: "El código debe tener exactamente 6 dígitos" })
  code: string

  @IsString({ message: "La contraseña debe ser una cadena de texto" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: "La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial",
  })
  newPassword: string
}
