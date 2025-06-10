import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordService } from '../auth/services/forgot-password.service';
import { ForgotPasswordDto, VerifyResetCodeDto, ResetPasswordDto } from '../auth/dto/forgot-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  @Post('forgot-password')
  async requestPasswordReset(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.forgotPasswordService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.forgotPasswordService.verifyResetCode(
      verifyResetCodeDto.email,
      verifyResetCodeDto.code,
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.forgotPasswordService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }
}
