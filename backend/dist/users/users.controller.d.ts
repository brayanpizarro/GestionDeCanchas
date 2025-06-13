import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<CreateUserDto & import("./entities/user.entity").User>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
    findOne(id: number): Promise<import("./entities/user.entity").User | null>;
    updatePassword(dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").UpdateResult>;
    getBalance(id: number): Promise<{
        balance: number;
    }>;
    addBalance(id: number, body: {
        amount: number;
    }): Promise<{
        message: string;
        newBalance: number;
    }>;
    setBalance(id: number, body: {
        amount: number;
    }): Promise<{
        message: string;
        newBalance: number;
    }>;
}
