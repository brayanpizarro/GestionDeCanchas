import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordService } from '../auth/services/forgot-password.service';
import {
  ForgotPasswordDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from '../auth/dto/forgot-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar código de restablecimiento de contraseña',
  })
  @ApiResponse({ status: 200, description: 'Código enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async requestPasswordReset(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    console.log('getting request');
    return await this.forgotPasswordService.requestPasswordReset(
      forgotPasswordDto.email,
    );
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código de restablecimiento' })
  @ApiResponse({ status: 200, description: 'Código verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return await this.forgotPasswordService.verifyResetCode(
      verifyResetCodeDto.email,
      verifyResetCodeDto.code,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido o datos incorrectos',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.forgotPasswordService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }
}
