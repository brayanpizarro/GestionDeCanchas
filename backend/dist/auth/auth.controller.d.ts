import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: Partial<User>;
    }>;
    getProfile(req: Request & {
        user: User;
    }): User;
}
