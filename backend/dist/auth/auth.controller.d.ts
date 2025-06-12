import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
interface AuthenticatedRequest extends Request {
    user: User;
}
interface LoginResponse {
    token: string;
    access_token?: string;
    user: Partial<User>;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
    getProfile(req: AuthenticatedRequest): Partial<User>;
    logout(): Promise<{
        message: string;
    }>;
}
export {};
