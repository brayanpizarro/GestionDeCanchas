import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordController } from '../auth/forgot-password.controller';
import { ForgotPasswordService } from '../auth/services/forgot-password.service';
import { PasswordResetToken } from '../auth/entities/password-reset.entities';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordResetToken, User])],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
