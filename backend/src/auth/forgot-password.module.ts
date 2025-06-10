import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordController } from './forgot-password.controller';
import { ForgotPasswordService } from './services/forgot-password.service';
import { EmailModule } from './email.module';
import { PasswordResetToken } from './entities/password-reset.entities';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken, User]),
    EmailModule,
  ],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}