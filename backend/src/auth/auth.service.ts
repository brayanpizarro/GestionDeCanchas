import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

import * as bcryptjs from 'bcryptjs'; // Importar bcrypt para encriptar contraseñas
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService:UsersService, // Inyectar el servicio de autenticación
        private readonly jwtService:JwtService, // Inyectar el servicio de JWT
    
    ) { } 

    async register(registerDto:RegisterDto) { // Método para registrar un nuevo usuario
        const user= await this.usersService.findOneByEmail(registerDto.email); // Buscar el usuario por email
        if(user) { // Si el usuario ya existe
            throw new BadRequestException('User already exists'); // Lanzar un error
        }
        const passwordHash = await bcryptjs.hash(registerDto.password, 10); // Encriptar la contraseña
        const newUser = {
            ...registerDto,// Desestructurar el objeto registerDto
            password: passwordHash, // reemplazar la contraseña por la encriptada
          };
        return await this.usersService.create(newUser); // Llama al servicio de usuarios para crear un nuevo usuario
    }    async login(loginDto: LoginDto) {
        try {
            console.log('Login attempt for email:', loginDto.email);
            const user = await this.usersService.findOneByEmail(loginDto.email.toLowerCase());
            if (!user) {
                console.log('User not found for email:', loginDto.email);
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await bcryptjs.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const payload = { 
                email: user.email,
                sub: user.id,
                role: user.role
            };

            const token = await this.jwtService.sign(payload);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            return {
                token,
                user: userWithoutPassword
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('An error occurred during login');
        }
    }
}
