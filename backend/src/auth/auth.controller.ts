import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService:AuthService ){    }    @Post('register')
    async register(@Body() registerDto: RegisterDto): Promise<User> {
        return this.authService.register(registerDto);
    }    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
        return this.authService.login(loginDto);
    }    @Get('profile')
    @UseGuards(AuthGuard)
    getProfile(@Req() req: Request & { user: User }): User {
        return req.user;
    }
}
