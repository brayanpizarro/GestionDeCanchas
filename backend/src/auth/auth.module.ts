import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ForgotPasswordController } from "../auth/forgot-password.controller"
import { ForgotPasswordService } from "./services/forgot-password.service"
import { EmailService } from "./services/email.service"
import { PasswordResetToken } from "./entities/password-reset.entities"
import { User } from "../users/entities/user.entity"
import { UsersModule } from "../users/users.module"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstanst } from "./constants/jwt.constants"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtStrategy } from "./strategy/jwt.strategy"

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([PasswordResetToken, User]),
    JwtModule.register({
      global: true,
      secret: jwtConstanst.secret,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController, ForgotPasswordController],
  providers: [AuthService, JwtStrategy, ForgotPasswordService, EmailService],
  exports: [AuthService, JwtModule, ForgotPasswordService, EmailService],
})
export class AuthModule {}
