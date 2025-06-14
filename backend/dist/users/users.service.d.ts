import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserStats } from './types/user.types';
import { EmailService } from '../email/email.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly emailService;
    constructor(userRepository: Repository<User>, emailService: EmailService);
    create(createUserDto: CreateUserDto): Promise<CreateUserDto & User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    findOneByEmail(email: string): Promise<User | null>;
    updatePassword(id: number, currentPassword: string, newPassword: string): Promise<void>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").UpdateResult>;
    getActivePlayerCount(): Promise<number>;
    countActive(): Promise<number>;
    getStats(): Promise<UserStats>;
    getTopPlayers(): Promise<{
        id: number;
        name: string;
        reservas: number;
        gasto: string;
        nivel: string;
        avatar: string;
    }[]>;
    private calculateLevel;
    addBalance(userId: number, amount: number): Promise<User>;
    deductBalance(userId: number, amount: number): Promise<User>;
    getBalance(userId: number): Promise<number>;
    setBalance(userId: number, amount: number): Promise<User>;
}
