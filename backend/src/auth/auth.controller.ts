import { Body, Controller, Get, Post, UseGuards, Req, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
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
    @Controller('auth')
    export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<User> {
        try {
        return await this.authService.register(registerDto);
        } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        throw new UnauthorizedException(`Error en el registro: ${errorMessage}`);
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
        try {
        // Usar el método login del servicio existente
        const result = await this.authService.login(loginDto);
        
        // Remover password del usuario antes de enviarlo
        const { password, ...userWithoutPassword } = result.user;
        
        // Tu servicio retorna { token: string, user: User }
        // Asegurar compatibilidad con diferentes formatos
        return {
            token: result.token,
            access_token: result.token,  // Agregar access_token para compatibilidad JWT
            user: userWithoutPassword,   // Usuario sin password
        };
        } catch (error) {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        throw new UnauthorizedException(`Error en el login: ${errorMessage}`);
        }
    }

  // Comentamos este endpoint hasta que se implemente en el AuthService
  // @Post('verify')
  // @HttpCode(HttpStatus.OK)
  // async verifyToken(@Body() body: TokenVerifyRequest): Promise<TokenVerifyResponse> {
  //   try {
  //     const decoded = await this.authService.verifyToken(body.token);
  //     return { 
  //       valid: true, 
  //       user: decoded 
  //     };
  //   } catch (error) {
  //     throw new UnauthorizedException('Token inválido');
  //   }
  // }

    @Get('profile')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    getProfile(@Req() req: AuthenticatedRequest): Partial<User> {
        // Retornar solo los datos necesarios del usuario
        const { password, ...userWithoutPassword } = req.user;
        return userWithoutPassword;
    }

    @Post('logout')
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout(): Promise<{ message: string }> {
        // Aquí podrías implementar lógica adicional como blacklist de tokens
        // o invalidación en base de datos si es necesario
        return { message: 'Logout exitoso' };
    }
}